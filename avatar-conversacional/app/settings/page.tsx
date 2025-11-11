'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/state';

export default function SettingsPage() {
  const router = useRouter();
  
  const mode = useAppStore((state) => state.mode);
  const selectedVoice = useAppStore((state) => state.selectedVoice);
  const vadSensitivity = useAppStore((state) => state.vadSensitivity);
  const ttsSpeed = useAppStore((state) => state.ttsSpeed);
  const ttsVolume = useAppStore((state) => state.ttsVolume);
  
  const setMode = useAppStore((state) => state.setMode);
  const setSelectedVoice = useAppStore((state) => state.setSelectedVoice);
  const setVadSensitivity = useAppStore((state) => state.setVadSensitivity);
  const setTtsSpeed = useAppStore((state) => state.setTtsSpeed);
  const setTtsVolume = useAppStore((state) => state.setTtsVolume);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => router.push('/avatar')}
            className="mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
          >
            <span>←</span> Volver al avatar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia conversacional
          </p>
        </header>

        <div className="space-y-6">
          {/* Modo de operación */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Modo de operación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('A')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  mode === 'A'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <h3 className="text-lg font-bold mb-2">Modo A - Baja Latencia</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  OpenAI Realtime API con lip-sync heurístico basado en energía.
                  Latencia mínima, sincronización aproximada.
                </p>
              </button>
              
              <button
                onClick={() => setMode('B')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  mode === 'B'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <h3 className="text-lg font-bold mb-2">Modo B - Lip-sync Pro</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deepgram STT + OpenAI + Azure TTS con visemes.
                  Sincronización labial precisa.
                </p>
              </button>
            </div>
          </div>

          {/* Voz del asistente */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Voz del asistente
            </h2>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alloy">Alloy - Neutral y versátil</option>
              <option value="echo">Echo - Profesional masculina</option>
              <option value="fable">Fable - Cálida y expresiva</option>
              <option value="onyx">Onyx - Profunda y autoritaria</option>
              <option value="nova">Nova - Energética y joven</option>
              <option value="shimmer">Shimmer - Suave y amigable</option>
            </select>
          </div>

          {/* Detección de voz (VAD) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Detección de voz (VAD)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sensibilidad: {vadSensitivity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={vadSensitivity}
                  onChange={(e) => setVadSensitivity(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Ajusta qué tan sensible es la detección de tu voz. Valores más altos
                  detectan voz más fácilmente pero pueden captar ruido de fondo.
                </p>
              </div>
            </div>
          </div>

          {/* Audio de respuesta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Audio de respuesta
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Velocidad: {ttsSpeed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Volumen: {Math.round(ttsVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ttsVolume}
                  onChange={(e) => setTtsVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Estado de las APIs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Estado de las APIs
            </h2>
            <div className="space-y-3">
              <ApiStatus name="OpenAI Realtime" endpoint="/api/realtime" />
              <ApiStatus name="Deepgram STT" endpoint="/api/deepgram" />
              <ApiStatus name="Azure Speech TTS" endpoint="/api/azure-tts" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiStatus({ name, endpoint }: { name: string; endpoint: string }) {
  const [status, setStatus] = React.useState<{
    configured: boolean;
    loading: boolean;
    message: string;
  }>({
    configured: false,
    loading: true,
    message: 'Verificando...',
  });

  React.useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          configured: data.configured || false,
          loading: false,
          message: data.message || '',
        });
      })
      .catch(() => {
        setStatus({
          configured: false,
          loading: false,
          message: 'Error al verificar',
        });
      });
  }, [endpoint]);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{status.message}</p>
      </div>
      <div
        className={`w-3 h-3 rounded-full ${
          status.loading
            ? 'bg-yellow-500 animate-pulse'
            : status.configured
            ? 'bg-green-500'
            : 'bg-gray-400'
        }`}
      />
    </div>
  );
}

// Necesario para usar useState en el componente ApiStatus
import React from 'react';
