import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para configurar sesión con OpenAI Realtime API
 * En producción, este endpoint obtendría un token efímero de OpenAI
 * y configurarí la sesión WebRTC
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, voice } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OPENAI_API_KEY no configurada. Usando modo mock.');
      
      // Modo mock: Retornar configuración simulada
      return NextResponse.json({
        success: true,
        mock: true,
        sessionId: 'mock-session-' + Date.now(),
        model: model || 'gpt-4o-realtime-preview',
        voice: voice || 'alloy',
        message: 'Usando modo mock. Configura OPENAI_API_KEY para usar la API real.',
      });
    }

    // Crear sesión efímera con OpenAI Realtime API
    try {
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-realtime-preview',
          voice: voice || 'alloy',
          modalities: ['text', 'audio'],
          instructions: 'Eres un asistente útil y amigable. Mantén las respuestas concisas (2-3 frases máximo). Responde siempre en español.',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Error HTTP ${response.status}: ${errorData.error?.message || 'Error al crear sesión'}`
        );
      }

      const sessionData = await response.json();

      return NextResponse.json({
        success: true,
        mock: false,
        sessionId: sessionData.id,
        ephemeralKey: sessionData.client_secret?.value,
        model: sessionData.model,
        voice: sessionData.voice,
        expiresAt: sessionData.expires_at,
      });
    } catch (apiError) {
      console.error('Error al conectar con OpenAI Realtime API:', apiError);
      
      // Fallback a modo mock si falla la API
      return NextResponse.json({
        success: true,
        mock: true,
        sessionId: 'fallback-mock-' + Date.now(),
        model: model || 'gpt-4o-realtime-preview',
        voice: voice || 'alloy',
        message: 'Error al conectar con OpenAI. Usando modo mock temporal.',
        error: apiError instanceof Error ? apiError.message : 'Error desconocido',
      });
    }
  } catch (error) {
    console.error('Error en endpoint de Realtime API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para verificar configuración
 */
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    configured: hasApiKey,
    model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview',
    message: hasApiKey
      ? 'OpenAI Realtime API configurada'
      : 'OPENAI_API_KEY no configurada. La aplicación funcionará en modo mock.',
  });
}
