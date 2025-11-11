import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint proxy para Deepgram Live Transcription (Modo B)
 * En producción, este endpoint establecería una conexión WebSocket
 * con Deepgram y actuaría como proxy para el cliente
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      console.warn('DEEPGRAM_API_KEY no configurada. Usando modo mock.');
      
      return NextResponse.json({
        success: true,
        mock: true,
        wsUrl: 'ws://localhost:3000/mock-deepgram',
        message: 'Usando modo mock. Configura DEEPGRAM_API_KEY para usar la API real.',
      });
    }

    // Construir URL de WebSocket de Deepgram con parámetros
    const deepgramWsUrl = new URL('wss://api.deepgram.com/v1/listen');
    
    // Parámetros de configuración para español con resultados interinos
    const params = {
      model: 'nova-2',
      language: 'es',
      punctuate: 'true',
      interim_results: 'true',
      endpointing: '200',
      vad_events: 'true',
      smart_format: 'true',
    };

    Object.entries(params).forEach(([key, value]) => {
      deepgramWsUrl.searchParams.append(key, value);
    });

    return NextResponse.json({
      success: true,
      mock: false,
      wsUrl: deepgramWsUrl.toString(),
      apiKey: apiKey,
      config: params,
      message: 'Deepgram configurado correctamente',
    });
  } catch (error) {
    console.error('Error en endpoint de Deepgram:', error);
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
  const hasApiKey = !!process.env.DEEPGRAM_API_KEY;
  
  return NextResponse.json({
    configured: hasApiKey,
    message: hasApiKey
      ? 'Deepgram API configurada'
      : 'DEEPGRAM_API_KEY no configurada. La aplicación funcionará en modo mock.',
  });
}
