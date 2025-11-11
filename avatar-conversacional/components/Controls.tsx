'use client';

import { useAppStore } from '@/lib/state';

export default function Controls() {
  const connectionState = useAppStore((state) => state.connectionState);
  const isMuted = useAppStore((state) => state.isMuted);
  const isPushToTalk = useAppStore((state) => state.isPushToTalk);
  const audioLevel = useAppStore((state) => state.audioLevel);
  const mode = useAppStore((state) => state.mode);
  const selectedVoice = useAppStore((state) => state.selectedVoice);
  const vadSensitivity = useAppStore((state) => state.vadSensitivity);
  
  const setMuted = useAppStore((state) => state.setMuted);
  const setPushToTalk = useAppStore((state) => state.setPushToTalk);
  const setMode = useAppStore((state) => state.setMode);
  const setSelectedVoice = useAppStore((state) => state.setSelectedVoice);
  const setVadSensitivity = useAppStore((state) => state.setVadSensitivity);

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  const handleConnect = () => {
    // Esta función será implementada en la página principal
    const event = new CustomEvent('avatar-connect');
    window.dispatchEvent(event);
  };

  const handleDisconnect = () => {
    const event = new CustomEvent('avatar-disconnect');
    window.dispatchEvent(event);
  };

  const handleMuteToggle = () => {
    setMuted(!isMuted);
  };

  const handlePushToTalkToggle = () => {
    setPushToTalk(!isPushToTalk);
  };

  return (
    <div className="w-full space-y-4">
      {/* Estado de conexión */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected
                ? 'bg-green-500 animate-pulse'
                : isConnecting
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-gray-400'
            }`}
          />
          <span className="font-medium">
            {isConnected
              ? 'Conectado'
              : isConnecting
              ? 'Conectando...'
              : 'Desconectado'}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Modo {mode}
        </div>
      </div>

      {/* Botones principales */}
      <div className="grid grid-cols-2 gap-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="col-span-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? 'Conectando...' : 'Conectar'}
          </button>
        ) : (
          <>
            <button
              onClick={handleMuteToggle}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isMuted
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {isMuted ? 'Silenciado' : 'Silenciar'}
            </button>
            
            <button
              onClick={handleDisconnect}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 transition-colors"
            >
              Desconectar
            </button>
          </>
        )}
      </div>

      {/* Nivel de audio */}
      {isConnected && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Nivel de audio</label>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-100"
              style={{ width: `${Math.min(audioLevel * 200, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Push to talk */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm font-medium">Push to Talk</span>
        <button
          onClick={handlePushToTalkToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isPushToTalk ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isPushToTalk ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Selector de voz */}
      <div className="space-y-2">
        <label htmlFor="voice-select" className="text-sm font-medium">
          Voz del asistente
        </label>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          disabled={isConnected}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="alloy">Alloy</option>
          <option value="echo">Echo</option>
          <option value="fable">Fable</option>
          <option value="onyx">Onyx</option>
          <option value="nova">Nova</option>
          <option value="shimmer">Shimmer</option>
        </select>
      </div>

      {/* Sensibilidad VAD */}
      <div className="space-y-2">
        <label htmlFor="vad-sensitivity" className="text-sm font-medium">
          Sensibilidad de detección de voz: {vadSensitivity.toFixed(2)}
        </label>
        <input
          id="vad-sensitivity"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={vadSensitivity}
          onChange={(e) => setVadSensitivity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Selector de modo (solo cuando no está conectado) */}
      {!isConnected && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Modo de operación</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('A')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'A'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Modo A
              <div className="text-xs opacity-75">Baja latencia</div>
            </button>
            <button
              onClick={() => setMode('B')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              Modo B
              <div className="text-xs opacity-75">Lip-sync Pro</div>
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones de uso */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
        <p className="font-medium mb-1">Consejos de uso:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Permite acceso al micrófono cuando se solicite</li>
          <li>Habla claramente y espera tu turno</li>
          <li>Puedes interrumpir al asistente hablando</li>
          {isPushToTalk && (
            <li>Mantén presionada la barra espaciadora para hablar</li>
          )}
        </ul>
      </div>
    </div>
  );
}
