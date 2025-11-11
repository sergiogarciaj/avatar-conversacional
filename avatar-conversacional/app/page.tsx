'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Avatar Conversacional 3D
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Conversa con un asistente de IA mediante voz en tiempo real
            con avatar 3D y sincronización labial
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/avatar')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Iniciar conversación
            </button>
            <Link
              href="/settings"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Configuración
            </Link>
          </div>
        </div>

        {/* Características */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Baja latencia"
            description="Conversaciones en tiempo real con respuestas en menos de 400ms"
            icon="⚡"
          />
          <FeatureCard
            title="Avatar 3D realista"
            description="Sincronización labial precisa con Ready Player Me y morph targets ARKit"
            icon="🎭"
          />
          <FeatureCard
            title="Dos modos de operación"
            description="Modo A (baja latencia) y Modo B (lip-sync profesional con visemes)"
            icon="🎯"
          />
          <FeatureCard
            title="Detección de voz (VAD)"
            description="Detecta automáticamente cuando hablas y gestiona los turnos de conversación"
            icon="🎤"
          />
          <FeatureCard
            title="Barge-in support"
            description="Interrumpe al asistente hablando cuando lo necesites"
            icon="✋"
          />
          <FeatureCard
            title="Subtítulos en vivo"
            description="Transcripción en tiempo real de tu voz y las respuestas del asistente"
            icon="💬"
          />
        </div>

        {/* Tecnologías */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Tecnologías utilizadas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TechItem name="Next.js 14" description="Framework React con App Router" />
            <TechItem name="React Three Fiber" description="Renderizado 3D con Three.js" />
            <TechItem name="OpenAI Realtime API" description="Conversación por voz en tiempo real" />
            <TechItem name="Azure Speech TTS" description="Text-to-Speech con visemes" />
            <TechItem name="Deepgram" description="Speech-to-Text de baja latencia" />
            <TechItem name="WebRTC / WebSocket" description="Audio bidireccional" />
            <TechItem name="Ready Player Me" description="Avatares 3D personalizables" />
            <TechItem name="TypeScript" description="Type safety y mejor DX" />
          </div>
        </div>

        {/* Instrucciones rápidas */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Primeros pasos
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              Clona el repositorio y ejecuta <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">pnpm install</code>
            </li>
            <li>
              Copia <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">.env.example</code> a <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">.env.local</code>
            </li>
            <li>
              Configura tus claves API (OpenAI, Deepgram, Azure) o usa el modo mock
            </li>
            <li>
              Ejecuta <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">pnpm dev</code> y navega a <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">/avatar</code>
            </li>
            <li>
              Permite acceso al micrófono cuando se solicite
            </li>
          </ol>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Para más detalles, consulta el archivo README.md en el repositorio.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function TechItem({ name, description }: { name: string; description: string }) {
  return (
    <div className="text-center">
      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
