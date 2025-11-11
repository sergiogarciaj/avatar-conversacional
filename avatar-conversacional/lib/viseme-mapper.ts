/**
 * Mapeo de visemes (Azure/Polly) a blendshapes ARKit
 * Basado en el estándar MPEG-4 y ARKit Face Tracking
 */

export interface VisemeMapping {
  [visemeId: string]: Array<{ name: string; value: number }>;
}

/**
 * Mapeo de visemes de Azure Speech a ARKit blendshapes
 * Azure usa IDs numéricos 0-21 + 'sil' para silencio
 */
export const AZURE_VISEME_TO_ARKIT: VisemeMapping = {
  // Silencio
  sil: [{ name: 'jawOpen', value: 0 }],
  '0': [{ name: 'jawOpen', value: 0 }],

  // Vocales
  '1': [
    // AE (cat, bat) - boca abierta ancha
    { name: 'jawOpen', value: 0.5 },
    { name: 'mouthStretchLeft', value: 0.3 },
    { name: 'mouthStretchRight', value: 0.3 },
  ],
  '2': [
    // AA (father) - boca muy abierta
    { name: 'jawOpen', value: 0.8 },
    { name: 'mouthOpen', value: 0.6 },
  ],
  '3': [
    // AO (dog, caught) - boca abierta redondeada
    { name: 'jawOpen', value: 0.6 },
    { name: 'mouthFunnel', value: 0.4 },
  ],
  '4': [
    // EY (ate) - sonrisa con boca ligeramente abierta
    { name: 'jawOpen', value: 0.3 },
    { name: 'mouthSmileLeft', value: 0.4 },
    { name: 'mouthSmileRight', value: 0.4 },
  ],
  '5': [
    // EH (bet) - boca abierta media
    { name: 'jawOpen', value: 0.4 },
    { name: 'mouthStretchLeft', value: 0.2 },
    { name: 'mouthStretchRight', value: 0.2 },
  ],
  '6': [
    // ER (bird) - boca semi-abierta neutral
    { name: 'jawOpen', value: 0.3 },
  ],
  '7': [
    // IY (eat) - sonrisa amplia
    { name: 'jawOpen', value: 0.2 },
    { name: 'mouthSmileLeft', value: 0.6 },
    { name: 'mouthSmileRight', value: 0.6 },
  ],
  '8': [
    // IH (it) - sonrisa leve
    { name: 'jawOpen', value: 0.25 },
    { name: 'mouthSmileLeft', value: 0.3 },
    { name: 'mouthSmileRight', value: 0.3 },
  ],
  '9': [
    // UW (you) - labios fruncidos
    { name: 'jawOpen', value: 0.2 },
    { name: 'mouthPucker', value: 0.7 },
    { name: 'mouthFunnel', value: 0.5 },
  ],
  '10': [
    // UH (book) - labios redondeados
    { name: 'jawOpen', value: 0.3 },
    { name: 'mouthFunnel', value: 0.3 },
  ],

  // Consonantes labiales
  '11': [
    // B, P, M - labios cerrados
    { name: 'jawOpen', value: 0 },
    { name: 'mouthPressLeft', value: 0.5 },
    { name: 'mouthPressRight', value: 0.5 },
  ],
  '12': [
    // F, V - labio inferior bajo dientes superiores
    { name: 'jawOpen', value: 0.1 },
    { name: 'mouthRollLower', value: 0.6 },
  ],
  '13': [
    // TH (thin/this) - lengua entre dientes
    { name: 'jawOpen', value: 0.2 },
    { name: 'tongueOut', value: 0.3 },
  ],

  // Consonantes dentales/alveolares
  '14': [
    // D, T, N - lengua en alveolos
    { name: 'jawOpen', value: 0.2 },
  ],
  '15': [
    // S, Z - dientes casi cerrados, aire pasa
    { name: 'jawOpen', value: 0.1 },
    { name: 'mouthSmileLeft', value: 0.2 },
    { name: 'mouthSmileRight', value: 0.2 },
  ],
  '16': [
    // SH, ZH - labios ligeramente fruncidos
    { name: 'jawOpen', value: 0.15 },
    { name: 'mouthFunnel', value: 0.2 },
  ],

  // Consonantes posteriores
  '17': [
    // K, G - boca ligeramente abierta
    { name: 'jawOpen', value: 0.3 },
  ],
  '18': [
    // L - lengua arriba
    { name: 'jawOpen', value: 0.3 },
  ],
  '19': [
    // R - labios ligeramente retraídos
    { name: 'jawOpen', value: 0.25 },
  ],
  '20': [
    // W - labios redondeados hacia adelante
    { name: 'jawOpen', value: 0.2 },
    { name: 'mouthPucker', value: 0.4 },
  ],
  '21': [
    // Y - similar a IY pero menos intenso
    { name: 'jawOpen', value: 0.2 },
    { name: 'mouthSmileLeft', value: 0.4 },
    { name: 'mouthSmileRight', value: 0.4 },
  ],
};

/**
 * Nombres de todos los blendshapes ARKit disponibles en Ready Player Me
 */
export const ARKIT_BLENDSHAPES = [
  'jawOpen',
  'mouthOpen',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthFrownLeft',
  'mouthFrownRight',
  'mouthFunnel',
  'mouthPucker',
  'mouthRollLower',
  'mouthRollUpper',
  'mouthShrugLower',
  'mouthShrugUpper',
  'mouthPressLeft',
  'mouthPressRight',
  'mouthStretchLeft',
  'mouthStretchRight',
  'mouthDimpleLeft',
  'mouthDimpleRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'tongueOut',
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'eyeWideLeft',
  'eyeWideRight',
  'eyeSquintLeft',
  'eyeSquintRight',
  'browDownLeft',
  'browDownRight',
  'browInnerUp',
  'browOuterUpLeft',
  'browOuterUpRight',
] as const;

export type ARKitBlendShape = (typeof ARKIT_BLENDSHAPES)[number];

/**
 * Obtener los blendshapes para un viseme dado
 */
export function getBlendShapesForViseme(
  visemeId: string
): Array<{ name: string; value: number }> {
  return AZURE_VISEME_TO_ARKIT[visemeId] || AZURE_VISEME_TO_ARKIT['sil'];
}

/**
 * Interpolar suavemente entre dos estados de blendshapes
 */
export function interpolateBlendShapes(
  from: Record<string, number>,
  to: Record<string, number>,
  t: number // 0-1
): Record<string, number> {
  const result: Record<string, number> = {};

  // Aplicar easing suave (ease-out)
  const easedT = 1 - Math.pow(1 - t, 3);

  const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);

  allKeys.forEach((key) => {
    const fromValue = from[key] || 0;
    const toValue = to[key] || 0;
    result[key] = fromValue + (toValue - fromValue) * easedT;
  });

  return result;
}

/**
 * Aplicar suavizado temporal a una secuencia de visemes
 */
export class VisemeSmoothing {
  private history: Array<{ name: string; value: number }>[] = [];
  private readonly maxHistory = 3;

  addFrame(blendshapes: Array<{ name: string; value: number }>): void {
    this.history.push(blendshapes);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getSmoothed(): Array<{ name: string; value: number }> {
    if (this.history.length === 0) {
      return [];
    }

    // Promediar los últimos frames
    const averaged = new Map<string, number>();

    this.history.forEach((frame, frameIndex) => {
      const weight = (frameIndex + 1) / this.history.length; // Dar más peso a frames recientes
      frame.forEach(({ name, value }) => {
        const current = averaged.get(name) || 0;
        averaged.set(name, current + value * weight);
      });
    });

    // Normalizar por el número de frames
    const result: Array<{ name: string; value: number }> = [];
    averaged.forEach((value, name) => {
      result.push({ name, value: value / this.history.length });
    });

    return result;
  }

  reset(): void {
    this.history = [];
  }
}
