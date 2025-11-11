import { create } from 'zustand';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type ConversationMode = 'A' | 'B';

export interface SttPartial {
  text: string;
  isFinal: boolean;
  startMs: number;
  endMs: number;
}

export interface TtsChunk {
  audioBase64: string;
  startMs: number;
  endMs: number;
}

export interface VisemeMark {
  id: string;
  atMs: number;
  durationMs?: number;
  arkit: Array<{ name: string; value: number }>;
}

export interface LatencyMetrics {
  captureToTranscription: number;
  transcriptionToResponse: number;
  responseToAudio: number;
  totalLatency: number;
}

interface AppState {
  // Conexión
  connectionState: ConnectionState;
  mode: ConversationMode;
  
  // Audio
  isMuted: boolean;
  isPushToTalk: boolean;
  isUserSpeaking: boolean;
  isAssistantSpeaking: boolean;
  audioLevel: number;
  
  // Transcripción y subtítulos
  userTranscript: string;
  assistantTranscript: string;
  liveCaption: string;
  
  // Visemes para lip-sync
  currentVisemes: VisemeMark[];
  
  // Configuración
  selectedVoice: string;
  vadSensitivity: number;
  ttsSpeed: number;
  ttsVolume: number;
  
  // Métricas de latencia
  latencyMetrics: LatencyMetrics | null;
  
  // Acciones
  setConnectionState: (state: ConnectionState) => void;
  setMode: (mode: ConversationMode) => void;
  setMuted: (muted: boolean) => void;
  setPushToTalk: (enabled: boolean) => void;
  setUserSpeaking: (speaking: boolean) => void;
  setAssistantSpeaking: (speaking: boolean) => void;
  setAudioLevel: (level: number) => void;
  setUserTranscript: (text: string) => void;
  setAssistantTranscript: (text: string) => void;
  setLiveCaption: (text: string) => void;
  setCurrentVisemes: (visemes: VisemeMark[]) => void;
  setSelectedVoice: (voice: string) => void;
  setVadSensitivity: (sensitivity: number) => void;
  setTtsSpeed: (speed: number) => void;
  setTtsVolume: (volume: number) => void;
  setLatencyMetrics: (metrics: LatencyMetrics) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Estado inicial
  connectionState: 'disconnected',
  mode: 'A',
  isMuted: false,
  isPushToTalk: false,
  isUserSpeaking: false,
  isAssistantSpeaking: false,
  audioLevel: 0,
  userTranscript: '',
  assistantTranscript: '',
  liveCaption: '',
  currentVisemes: [],
  selectedVoice: 'alloy',
  vadSensitivity: 0.5,
  ttsSpeed: 1.0,
  ttsVolume: 1.0,
  latencyMetrics: null,

  // Acciones
  setConnectionState: (state) => set({ connectionState: state }),
  setMode: (mode) => set({ mode }),
  setMuted: (muted) => set({ isMuted: muted }),
  setPushToTalk: (enabled) => set({ isPushToTalk: enabled }),
  setUserSpeaking: (speaking) => set({ isUserSpeaking: speaking }),
  setAssistantSpeaking: (speaking) => set({ isAssistantSpeaking: speaking }),
  setAudioLevel: (level) => set({ audioLevel: level }),
  setUserTranscript: (text) => set({ userTranscript: text }),
  setAssistantTranscript: (text) => set({ assistantTranscript: text }),
  setLiveCaption: (text) => set({ liveCaption: text }),
  setCurrentVisemes: (visemes) => set({ currentVisemes: visemes }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
  setVadSensitivity: (sensitivity) => set({ vadSensitivity: sensitivity }),
  setTtsSpeed: (speed) => set({ ttsSpeed: speed }),
  setTtsVolume: (volume) => set({ ttsVolume: volume }),
  setLatencyMetrics: (metrics) => set({ latencyMetrics: metrics }),
}));
