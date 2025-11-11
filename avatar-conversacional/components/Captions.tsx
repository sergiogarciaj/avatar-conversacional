'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/state';

export default function Captions() {
  const userTranscript = useAppStore((state) => state.userTranscript);
  const assistantTranscript = useAppStore((state) => state.assistantTranscript);
  const liveCaption = useAppStore((state) => state.liveCaption);
  const latencyMetrics = useAppStore((state) => state.latencyMetrics);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll a la última transcripción
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userTranscript, assistantTranscript]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Subtítulos en vivo */}
      {liveCaption && (
        <div className="p-4 bg-black/80 text-white text-center rounded-lg mb-4">
          <p className="text-lg font-medium">{liveCaption}</p>
        </div>
      )}

      {/* Historial de conversación */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {userTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] p-3 bg-blue-600 text-white rounded-lg">
              <p className="text-sm font-medium mb-1">Tú</p>
              <p>{userTranscript}</p>
            </div>
          </div>
        )}

        {assistantTranscript && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg">
              <p className="text-sm font-medium mb-1">Asistente</p>
              <p>{assistantTranscript}</p>
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Métricas de latencia (opcional, para debugging) */}
      {latencyMetrics && process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs">
          <p className="font-medium mb-2">Métricas de latencia:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Captura → Transcripción:
              </span>
              <span className="ml-2 font-mono">
                {latencyMetrics.captureToTranscription}ms
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Transcripción → Respuesta:
              </span>
              <span className="ml-2 font-mono">
                {latencyMetrics.transcriptionToResponse}ms
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Respuesta → Audio:
              </span>
              <span className="ml-2 font-mono">
                {latencyMetrics.responseToAudio}ms
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Latencia total:
              </span>
              <span className="ml-2 font-mono font-bold">
                {latencyMetrics.totalLatency}ms
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
