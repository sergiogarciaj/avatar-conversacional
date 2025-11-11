/**
 * Lip-sync heurístico basado en energía de audio (Modo A)
 * Para usar con OpenAI Realtime API sin visemes explícitos
 */

import { calculateRMS, calculateCrestFactor } from './audio';

export interface LipSyncFrame {
  jawOpen: number;
  mouthFunnel: number;
  mouthPucker: number;
  timestamp: number;
}

export interface LipSyncConfig {
  attackMs: number; // Velocidad de apertura
  releaseMs: number; // Velocidad de cierre
  energyThreshold: number; // Umbral mínimo de energía
  jawOpenScale: number; // Escalar para jawOpen
  funnelScale: number; // Escalar para mouthFunnel
}

const DEFAULT_CONFIG: LipSyncConfig = {
  attackMs: 30,
  releaseMs: 80,
  energyThreshold: 0.01,
  jawOpenScale: 0.8,
  funnelScale: 0.3,
};

export class LipSyncEnergy {
  private config: LipSyncConfig;
  private currentJawOpen = 0;
  private currentFunnel = 0;
  private currentPucker = 0;
  private lastUpdateTime = 0;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private dataArray: Float32Array | null = null;
  private animationFrameId: number | null = null;
  private onFrame?: (frame: LipSyncFrame) => void;

  constructor(config: Partial<LipSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Inicializar con un elemento de audio HTML
   */
  initializeWithAudioElement(audioElement: HTMLAudioElement): void {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaElementSource(audioElement);

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.analyserNode.smoothingTimeConstant = 0.7;

    source.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    this.dataArray = new Float32Array(this.analyserNode.fftSize);
  }

  /**
   * Inicializar con un MediaStream
   */
  initializeWithStream(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.analyserNode.smoothingTimeConstant = 0.7;

    source.connect(this.analyserNode);

    this.dataArray = new Float32Array(this.analyserNode.fftSize);
  }

  /**
   * Iniciar análisis y generación de frames
   */
  start(onFrame: (frame: LipSyncFrame) => void): void {
    this.onFrame = onFrame;
    this.lastUpdateTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    if (!this.analyserNode || !this.dataArray) {
      return;
    }

    const now = performance.now();
    const deltaMs = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // Obtener datos de audio
    this.analyserNode.getFloatTimeDomainData(this.dataArray);

    // Calcular métricas de energía
    const rms = calculateRMS(this.dataArray);
    const crestFactor = calculateCrestFactor(this.dataArray);

    // Calcular valores objetivo basados en energía
    let targetJawOpen = 0;
    let targetFunnel = 0;
    let targetPucker = 0;

    if (rms > this.config.energyThreshold) {
      // Jaw open proporcional a RMS
      targetJawOpen = Math.min(rms * this.config.jawOpenScale * 10, 1.0);

      // Funnel/Pucker basado en crest factor (transientes)
      // Crest alto = consonantes explosivas -> más funnel
      // Crest bajo = vocales sostenidas -> más pucker
      if (crestFactor > 2.0) {
        targetFunnel = Math.min((crestFactor - 2.0) * this.config.funnelScale, 0.5);
      } else {
        targetPucker = Math.min((2.0 - crestFactor) * 0.2, 0.3);
      }
    }

    // Aplicar suavizado con attack/release
    const attackRate = 1000 / this.config.attackMs;
    const releaseRate = 1000 / this.config.releaseMs;

    this.currentJawOpen = this.smooth(
      this.currentJawOpen,
      targetJawOpen,
      deltaMs,
      attackRate,
      releaseRate
    );
    this.currentFunnel = this.smooth(
      this.currentFunnel,
      targetFunnel,
      deltaMs,
      attackRate,
      releaseRate
    );
    this.currentPucker = this.smooth(
      this.currentPucker,
      targetPucker,
      deltaMs,
      attackRate,
      releaseRate
    );

    // Emitir frame
    if (this.onFrame) {
      this.onFrame({
        jawOpen: this.currentJawOpen,
        mouthFunnel: this.currentFunnel,
        mouthPucker: this.currentPucker,
        timestamp: now,
      });
    }

    // Continuar animación
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private smooth(
    current: number,
    target: number,
    deltaMs: number,
    attackRate: number,
    releaseRate: number
  ): number {
    const rate = target > current ? attackRate : releaseRate;
    const maxChange = (deltaMs / 1000) * rate;

    if (Math.abs(target - current) < maxChange) {
      return target;
    }

    return target > current ? current + maxChange : current - maxChange;
  }

  /**
   * Actualizar configuración en tiempo real
   */
  updateConfig(config: Partial<LipSyncConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Detener análisis
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyserNode = null;
    this.dataArray = null;
    this.onFrame = undefined;
  }

  /**
   * Resetear estado
   */
  reset(): void {
    this.currentJawOpen = 0;
    this.currentFunnel = 0;
    this.currentPucker = 0;
  }
}

/**
 * Generar frames de lip-sync desde un buffer de audio pregrabado
 * Útil para pre-procesar audio y sincronizar con precisión
 */
export function generateLipSyncFrames(
  audioBuffer: AudioBuffer,
  config: Partial<LipSyncConfig> = {}
): LipSyncFrame[] {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const frames: LipSyncFrame[] = [];
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  // Analizar en ventanas de 20ms (típico para análisis de voz)
  const windowSize = Math.floor((sampleRate * 20) / 1000);
  const hopSize = Math.floor(windowSize / 2); // 50% overlap

  let currentJawOpen = 0;
  let currentFunnel = 0;
  let currentPucker = 0;

  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    const window = channelData.slice(i, i + windowSize);
    const rms = calculateRMS(window);
    const crestFactor = calculateCrestFactor(window);

    let targetJawOpen = 0;
    let targetFunnel = 0;
    let targetPucker = 0;

    if (rms > mergedConfig.energyThreshold) {
      targetJawOpen = Math.min(rms * mergedConfig.jawOpenScale * 10, 1.0);

      if (crestFactor > 2.0) {
        targetFunnel = Math.min((crestFactor - 2.0) * mergedConfig.funnelScale, 0.5);
      } else {
        targetPucker = Math.min((2.0 - crestFactor) * 0.2, 0.3);
      }
    }

    // Suavizado simple
    const alpha = 0.3;
    currentJawOpen = currentJawOpen * (1 - alpha) + targetJawOpen * alpha;
    currentFunnel = currentFunnel * (1 - alpha) + targetFunnel * alpha;
    currentPucker = currentPucker * (1 - alpha) + targetPucker * alpha;

    frames.push({
      jawOpen: currentJawOpen,
      mouthFunnel: currentFunnel,
      mouthPucker: currentPucker,
      timestamp: (i / sampleRate) * 1000, // ms
    });
  }

  return frames;
}
