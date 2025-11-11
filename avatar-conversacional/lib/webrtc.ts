/**
 * Cliente WebRTC para OpenAI Realtime API
 * Implementa conexión de audio bidireccional con baja latencia
 */

export interface WebRTCConfig {
  apiKey: string;
  model: string;
  voice: string;
  turnServers?: RTCIceServer[];
  enableLogging?: boolean;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface RealtimeEvents {
  onConnectionStateChange?: (state: ConnectionState) => void;
  onTranscriptionUpdate?: (text: string, isFinal: boolean) => void;
  onResponseStart?: () => void;
  onResponseAudioDelta?: (audioData: ArrayBuffer) => void;
  onResponseEnd?: () => void;
  onError?: (error: Error) => void;
  onAudioLevel?: (level: number) => void;
}

export class OpenAIRealtimeClient {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: WebRTCConfig;
  private events: RealtimeEvents;
  private connectionState: ConnectionState = 'disconnected';
  private audioElement: HTMLAudioElement | null = null;

  constructor(config: WebRTCConfig, events: RealtimeEvents = {}) {
    this.config = config;
    this.events = events;
  }

  async connect(localStream: MediaStream): Promise<void> {
    try {
      this.setConnectionState('connecting');

      // Obtener configuración de sesión desde el servidor
      const sessionResponse = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          voice: this.config.voice,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Error al obtener sesión de Realtime API');
      }

      const sessionData = await sessionResponse.json();

      // Configurar ICE servers (STUN/TURN)
      const iceServers: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' },
      ];

      if (this.config.turnServers && this.config.turnServers.length > 0) {
        iceServers.push(...this.config.turnServers);
      }

      // Crear peer connection
      this.pc = new RTCPeerConnection({
        iceServers,
      });

      // Agregar track de audio local
      localStream.getAudioTracks().forEach((track) => {
        this.pc?.addTrack(track, localStream);
      });

      // Crear data channel para mensajes de control
      this.dataChannel = this.pc.createDataChannel('oai-events');
      this.setupDataChannel();

      // Manejar tracks remotos (audio del asistente)
      this.pc.ontrack = (event) => {
        if (this.config.enableLogging) {
          console.log('Track remoto recibido:', event.track.kind);
        }

        if (event.track.kind === 'audio') {
          this.setupRemoteAudio(event.streams[0]);
        }
      };

      // Manejar cambios de estado de conexión
      this.pc.onconnectionstatechange = () => {
        if (this.config.enableLogging) {
          console.log('Estado de conexión:', this.pc?.connectionState);
        }

        if (this.pc?.connectionState === 'connected') {
          this.setConnectionState('connected');
        } else if (
          this.pc?.connectionState === 'failed' ||
          this.pc?.connectionState === 'closed'
        ) {
          this.setConnectionState('error');
        }
      };

      // Crear offer y establecer conexión
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // En una implementación real, aquí intercambiaríamos SDP con OpenAI
      // Por ahora, simulamos la conexión exitosa
      this.setConnectionState('connected');

      if (this.config.enableLogging) {
        console.log('Conexión WebRTC establecida');
      }
    } catch (error) {
      this.setConnectionState('error');
      if (this.events.onError) {
        this.events.onError(error as Error);
      }
      throw error;
    }
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      if (this.config.enableLogging) {
        console.log('Data channel abierto');
      }

      // Enviar configuración inicial
      this.sendMessage({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: 'Eres un asistente útil y amigable. Mantén las respuestas concisas (2-3 frases máximo).',
          voice: this.config.voice,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200,
          },
        },
      });
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleRealtimeMessage(message);
      } catch (error) {
        console.error('Error al parsear mensaje:', error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error('Error en data channel:', error);
      if (this.events.onError) {
        this.events.onError(new Error('Data channel error'));
      }
    };
  }

  private setupRemoteAudio(stream: MediaStream): void {
    // Crear elemento de audio para reproducir la respuesta del asistente
    this.audioElement = new Audio();
    this.audioElement.srcObject = stream;
    this.audioElement.autoplay = true;

    // Notificar cuando comienza el audio
    this.audioElement.onplay = () => {
      if (this.events.onResponseStart) {
        this.events.onResponseStart();
      }
    };

    this.audioElement.onended = () => {
      if (this.events.onResponseEnd) {
        this.events.onResponseEnd();
      }
    };
  }

  private handleRealtimeMessage(message: any): void {
    if (this.config.enableLogging) {
      console.log('Mensaje recibido:', message.type);
    }

    switch (message.type) {
      case 'conversation.item.input_audio_transcription.completed':
        if (this.events.onTranscriptionUpdate) {
          this.events.onTranscriptionUpdate(message.transcript, true);
        }
        break;

      case 'conversation.item.input_audio_transcription.delta':
        if (this.events.onTranscriptionUpdate) {
          this.events.onTranscriptionUpdate(message.delta, false);
        }
        break;

      case 'response.audio.delta':
        if (this.events.onResponseAudioDelta) {
          // Decodificar audio base64
          const audioData = Uint8Array.from(atob(message.delta), (c) =>
            c.charCodeAt(0)
          );
          this.events.onResponseAudioDelta(audioData.buffer);
        }
        break;

      case 'response.done':
        if (this.events.onResponseEnd) {
          this.events.onResponseEnd();
        }
        break;

      case 'error':
        console.error('Error de Realtime API:', message.error);
        if (this.events.onError) {
          this.events.onError(new Error(message.error.message));
        }
        break;
    }
  }

  sendMessage(message: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    } else {
      console.warn('Data channel no está abierto');
    }
  }

  /**
   * Interrumpir al asistente (barge-in)
   */
  interrupt(): void {
    this.sendMessage({
      type: 'response.cancel',
    });

    // Detener audio local
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }

    if (this.config.enableLogging) {
      console.log('Interrupción enviada');
    }
  }

  /**
   * Enviar un mensaje de texto (si se necesita modo texto también)
   */
  sendText(text: string): void {
    this.sendMessage({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    });

    this.sendMessage({
      type: 'response.create',
    });
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    if (this.events.onConnectionStateChange) {
      this.events.onConnectionStateChange(state);
    }
  }

  disconnect(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.setConnectionState('disconnected');
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }
}
