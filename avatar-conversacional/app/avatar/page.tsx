'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/state';
import { AudioCapture } from '@/lib/audio';
import { OpenAIRealtimeClient } from '@/lib/webrtc';
import { LipSyncEnergy } from '@/lib/lip-sync-energy';
import { getBlendShapesForViseme, VisemeMark } from '@/lib/viseme-mapper';
import AvatarCanvas from '@/components/AvatarCanvas';
import Controls from '@/components/Controls';
import Captions from '@/components/Captions';

export default function AvatarPage() {
  const mode = useAppStore((state) => state.mode);
  const selectedVoice = useAppStore((state) => state.selectedVoice);
  const vadSensitivity = useAppStore((state) => state.vadSensitivity);
  const isPushToTalk = useAppStore((state) => state.isPushToTalk);
  const isMuted = useAppStore((state) => state.isMuted);
  
  const setConnectionState = useAppStore((state) => state.setConnectionState);
  const setUserSpeaking = useAppStore((state) => state.setUserSpeaking);
  const setAssistantSpeaking = useAppStore((state) => state.setAssistantSpeaking);
  const setAudioLevel = useAppStore((state) => state.setAudioLevel);
  const setUserTranscript = useAppStore((state) => state.setUserTranscript);
  const setAssistantTranscript = useAppStore((state) => state.setAssistantTranscript);
  const setLiveCaption = useAppStore((state) => state.setLiveCaption);
  const setCurrentVisemes = useAppStore((state) => state.setCurrentVisemes);
  const setLatencyMetrics = useAppStore((state) => state.setLatencyMetrics);

  const audioCaptureRef = useRef<AudioCapture | null>(null);
  const realtimeClientRef = useRef<OpenAIRealtimeClient | null>(null);
  const lipSyncRef = useRef<LipSyncEnergy | null>(null);
  
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    // Manejar eventos de conexión/desconexión
    const handleConnect = async () => {
      try {
        setConnectionState('connecting');

        // Inicializar captura de audio
        const audioCapture = new AudioCapture({
          threshold: vadSensitivity * 0.03,
          hangoverMs: 200,
          minSpeechMs: 150,
        });

        await audioCapture.initialize(
          () => {
            setUserSpeaking(true);
            setLiveCaption('Escuchando...');
            
            // Si hay asistente hablando, interrumpir (barge-in)
            if (realtimeClientRef.current) {
              realtimeClientRef.current.interrupt();
            }
          },
          () => {
            setUserSpeaking(false);
            setLiveCaption('');
          },
          (level) => {
            setAudioLevel(level);
          }
        );

        audioCaptureRef.current = audioCapture;

        // Obtener stream de audio
        const stream = audioCapture.getStream();
        if (!stream) {
          throw new Error('No se pudo obtener stream de audio');
        }

        // Inicializar cliente de Realtime API
        const realtimeClient = new OpenAIRealtimeClient(
          {
            apiKey: '', // Se obtiene del servidor
            model: 'gpt-4o-realtime-preview',
            voice: selectedVoice,
            enableLogging: true,
          },
          {
            onConnectionStateChange: (state) => {
              setConnectionState(state);
            },
            onTranscriptionUpdate: (text, isFinal) => {
              if (isFinal) {
                setUserTranscript(text);
                setLiveCaption('');
              } else {
                setLiveCaption(text);
              }
            },
            onResponseStart: () => {
              setAssistantSpeaking(true);
              
              // Inicializar lip-sync según el modo
              if (mode === 'A') {
                const audioElement = realtimeClient.getAudioElement();
                if (audioElement && !lipSyncRef.current) {
                  const lipSync = new LipSyncEnergy();
                  lipSync.initializeWithAudioElement(audioElement);
                  lipSync.start((frame) => {
                    // Los frames se aplican directamente en AvatarCanvas
                  });
                  lipSyncRef.current = lipSync;
                }
              }
            },
            onResponseAudioDelta: (audioData) => {
              // Audio se reproduce automáticamente via WebRTC
            },
            onResponseEnd: () => {
              setAssistantSpeaking(false);
              
              if (lipSyncRef.current) {
                lipSyncRef.current.stop();
                lipSyncRef.current = null;
              }
            },
            onError: (error) => {
              console.error('Error en Realtime API:', error);
              setConnectionState('error');
            },
          }
        );

        await realtimeClient.connect(stream);
        realtimeClientRef.current = realtimeClient;

        // Simular transcripción y respuesta para modo mock
        setTimeout(() => {
          setUserTranscript('Hola, ¿cómo estás?');
          setTimeout(() => {
            setAssistantSpeaking(true);
            setAssistantTranscript('¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?');
            
            if (mode === 'B') {
              // Simular visemes para Modo B
              simulateVisemes('¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?');
            }
            
            setTimeout(() => {
              setAssistantSpeaking(false);
            }, 5000);
          }, 1000);
        }, 2000);

      } catch (error) {
        console.error('Error al conectar:', error);
        setConnectionState('error');
        alert('Error al conectar. Por favor, permite el acceso al micrófono.');
      }
    };

    const handleDisconnect = () => {
      if (realtimeClientRef.current) {
        realtimeClientRef.current.disconnect();
        realtimeClientRef.current = null;
      }

      if (audioCaptureRef.current) {
        audioCaptureRef.current.stop();
        audioCaptureRef.current = null;
      }

      if (lipSyncRef.current) {
        lipSyncRef.current.stop();
        lipSyncRef.current = null;
      }

      setConnectionState('disconnected');
      setUserSpeaking(false);
      setAssistantSpeaking(false);
      setAudioLevel(0);
      setUserTranscript('');
      setAssistantTranscript('');
      setLiveCaption('');
      setCurrentVisemes([]);
    };

    window.addEventListener('avatar-connect', handleConnect);
    window.addEventListener('avatar-disconnect', handleDisconnect);

    return () => {
      window.removeEventListener('avatar-connect', handleConnect);
      window.removeEventListener('avatar-disconnect', handleDisconnect);
      handleDisconnect();
    };
  }, [
    mode,
    selectedVoice,
    vadSensitivity,
    setConnectionState,
    setUserSpeaking,
    setAssistantSpeaking,
    setAudioLevel,
    setUserTranscript,
    setAssistantTranscript,
    setLiveCaption,
    setCurrentVisemes,
  ]);

  // Manejar Push to Talk con barra espaciadora
  useEffect(() => {
    if (!isPushToTalk) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        setUserSpeaking(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setUserSpeaking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPushToTalk, isSpacePressed, setUserSpeaking]);

  // Función auxiliar para simular visemes en modo B
  const simulateVisemes = (text: string) => {
    const visemes: VisemeMark[] = [];
    const startTime = performance.now();
    let offset = 0;

    // Generar visemes basados en el texto
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      let visemeId = 'sil';

      if ('aáà'.includes(char)) visemeId = '2';
      else if ('eéè'.includes(char)) visemeId = '5';
      else if ('iíì'.includes(char)) visemeId = '7';
      else if ('oóò'.includes(char)) visemeId = '3';
      else if ('uúù'.includes(char)) visemeId = '9';
      else if ('bpm'.includes(char)) visemeId = '11';
      else if ('fv'.includes(char)) visemeId = '12';
      else if ('sz'.includes(char)) visemeId = '15';
      else if ('tdnl'.includes(char)) visemeId = '14';
      else if ('rj'.includes(char)) visemeId = '19';

      const blendshapes = getBlendShapesForViseme(visemeId);
      
      visemes.push({
        id: visemeId,
        atMs: startTime + offset,
        durationMs: 80,
        arkit: blendshapes,
      });

      offset += 80;
    }

    setCurrentVisemes(visemes);

    // Limpiar después de que termine
    setTimeout(() => {
      setCurrentVisemes([]);
    }, offset + 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Avatar Conversacional 3D
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conversa con un asistente de IA mediante voz en tiempo real
          </p>
        </header>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar 3D */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video w-full">
              <AvatarCanvas lipSyncMode={mode} />
            </div>
          </div>

          {/* Controles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <Controls />
          </div>
        </div>

        {/* Subtítulos y transcripción */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Conversación
          </h2>
          <div className="h-64">
            <Captions />
          </div>
        </div>

        {/* Aviso sobre modo mock */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Modo de demostración:</strong> Esta aplicación está configurada con
            implementaciones simuladas. Para usar las APIs reales (OpenAI, Deepgram, Azure),
            configura las variables de entorno en <code>.env.local</code>. Consulta el README
            para más información.
          </p>
        </div>
      </div>
    </div>
  );
}
