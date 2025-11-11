/**
 * Utilidades de audio para captura de micrófono, VAD y análisis de audio
 */

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface VadConfig {
  threshold: number; // 0-1, umbral de energía
  hangoverMs: number; // tiempo de espera antes de marcar fin de habla
  minSpeechMs: number; // duración mínima para considerar habla válida
}

const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const DEFAULT_VAD_CONFIG: VadConfig = {
  threshold: 0.015,
  hangoverMs: 200,
  minSpeechMs: 150,
};

export class AudioCapture {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private vadConfig: VadConfig;
  private isSpeakingState = false;
  private silenceStart = 0;
  private speechStart = 0;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onAudioLevel?: (level: number) => void;
  private vadCheckInterval: number | null = null;

  constructor(vadConfig: Partial<VadConfig> = {}) {
    this.vadConfig = { ...DEFAULT_VAD_CONFIG, ...vadConfig };
  }

  async initialize(
    onSpeechStart?: () => void,
    onSpeechEnd?: () => void,
    onAudioLevel?: (level: number) => void
  ): Promise<void> {
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd = onSpeechEnd;
    this.onAudioLevel = onAudioLevel;

    try {
      // Solicitar permiso de micrófono
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: DEFAULT_AUDIO_CONFIG.sampleRate,
          channelCount: DEFAULT_AUDIO_CONFIG.channelCount,
          echoCancellation: DEFAULT_AUDIO_CONFIG.echoCancellation,
          noiseSuppression: DEFAULT_AUDIO_CONFIG.noiseSuppression,
          autoGainControl: DEFAULT_AUDIO_CONFIG.autoGainControl,
        },
      });

      // Crear contexto de audio
      this.audioContext = new AudioContext({
        sampleRate: DEFAULT_AUDIO_CONFIG.sampleRate,
      });

      // Crear nodos de análisis
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      this.sourceNode.connect(this.analyserNode);

      // Buffer para datos de audio
      this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

      // Iniciar chequeo de VAD
      this.startVadCheck();
    } catch (error) {
      console.error('Error al inicializar captura de audio:', error);
      throw new Error('No se pudo acceder al micrófono');
    }
  }

  private startVadCheck(): void {
    this.vadCheckInterval = window.setInterval(() => {
      this.checkVad();
    }, 50); // Chequear cada 50ms
  }

  private checkVad(): void {
    if (!this.analyserNode || !this.dataArray) return;

    // Obtener datos de audio
    this.analyserNode.getByteTimeDomainData(this.dataArray);

    // Calcular energía RMS
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);

    // Notificar nivel de audio
    if (this.onAudioLevel) {
      this.onAudioLevel(rms);
    }

    const now = Date.now();
    const isSpeaking = rms > this.vadConfig.threshold;

    if (isSpeaking) {
      if (!this.isSpeakingState) {
        // Posible inicio de habla
        if (this.speechStart === 0) {
          this.speechStart = now;
        } else if (now - this.speechStart >= this.vadConfig.minSpeechMs) {
          // Confirmar inicio de habla
          this.isSpeakingState = true;
          this.silenceStart = 0;
          if (this.onSpeechStart) {
            this.onSpeechStart();
          }
        }
      } else {
        // Continuar hablando
        this.silenceStart = 0;
      }
    } else {
      // Silencio detectado
      if (this.isSpeakingState) {
        if (this.silenceStart === 0) {
          this.silenceStart = now;
        } else if (now - this.silenceStart >= this.vadConfig.hangoverMs) {
          // Confirmar fin de habla
          this.isSpeakingState = false;
          this.speechStart = 0;
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
        }
      } else {
        // Reset del contador de inicio de habla si no se confirmó
        this.speechStart = 0;
      }
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  updateVadConfig(config: Partial<VadConfig>): void {
    this.vadConfig = { ...this.vadConfig, ...config };
  }

  stop(): void {
    if (this.vadCheckInterval) {
      clearInterval(this.vadCheckInterval);
      this.vadCheckInterval = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyserNode = null;
    this.dataArray = null;
    this.isSpeakingState = false;
    this.silenceStart = 0;
    this.speechStart = 0;
  }
}

/**
 * Calcular energía RMS de un buffer de audio para lip-sync Modo A
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Calcular crest factor (pico / RMS) para detectar transientes
 */
export function calculateCrestFactor(buffer: Float32Array): number {
  const rms = calculateRMS(buffer);
  const peak = Math.max(...Array.from(buffer).map(Math.abs));
  return rms > 0 ? peak / rms : 0;
}
