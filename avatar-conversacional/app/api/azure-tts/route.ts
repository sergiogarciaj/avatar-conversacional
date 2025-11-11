import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para Azure Speech TTS con visemes (Modo B)
 * Genera audio con información de visemes para sincronización labial precisa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'es-ES-ElviraNeural', rate = 1.0 } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Texto requerido' },
        { status: 400 }
      );
    }

    const apiKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!apiKey || !region) {
      console.warn('Azure Speech API no configurada. Usando modo mock.');
      
      // Mock: Generar visemes simulados
      const mockVisemes = generateMockVisemes(text);
      
      return NextResponse.json({
        success: true,
        mock: true,
        audioUrl: '/mock-audio.mp3', // En producción, retornar audio real
        visemes: mockVisemes,
        duration: text.length * 50, // Aproximado
        message: 'Usando TTS simulado. Configura AZURE_SPEECH_KEY para usar Azure.',
      });
    }

    // Crear SSML para Azure Speech
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-ES">
        <voice name="${voice}">
          <prosody rate="${rate}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    try {
      // Generar audio con Azure Speech
      const audioResponse = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'Avatar-Conversacional',
          },
          body: ssml,
        }
      );

      if (!audioResponse.ok) {
        throw new Error(`Error HTTP ${audioResponse.status} al generar audio`);
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      // Generar visemes con una segunda llamada
      const visemeSsml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="es-ES">
          <voice name="${voice}">
            <mstts:viseme type="FacialExpression"/>
            <prosody rate="${rate}">
              ${text}
            </prosody>
          </voice>
        </speak>
      `;

      const visemeResponse = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'Avatar-Conversacional',
          },
          body: visemeSsml,
        }
      );

      // Azure envía visemes en el header X-Microsoft-Speech-FacialExpression
      const visemeData = visemeResponse.headers.get('X-Microsoft-Speech-FacialExpression');
      
      let visemes = [];
      if (visemeData) {
        try {
          visemes = JSON.parse(visemeData);
        } catch {
          console.warn('No se pudieron parsear visemes, usando fallback');
          visemes = generateMockVisemes(text);
        }
      } else {
        // Fallback a visemes mock si Azure no los provee
        visemes = generateMockVisemes(text);
      }

      return NextResponse.json({
        success: true,
        mock: false,
        audioBase64,
        visemes,
        duration: (audioBuffer.byteLength / 16000) * 1000, // Estimado
        message: 'Audio y visemes generados con Azure Speech',
      });
    } catch (apiError) {
      console.error('Error al generar TTS con Azure:', apiError);
      
      // Fallback a mock
      const mockVisemes = generateMockVisemes(text);
      return NextResponse.json({
        success: true,
        mock: true,
        audioUrl: '/mock-audio.mp3',
        visemes: mockVisemes,
        duration: text.length * 50,
        message: 'Error con Azure, usando TTS simulado',
        error: apiError instanceof Error ? apiError.message : 'Error desconocido',
      });
    }
  } catch (error) {
    console.error('Error en endpoint de Azure TTS:', error);
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
 * Generar visemes mock para demostración
 */
function generateMockVisemes(text: string) {
  const visemes = [];
  const words = text.split(' ');
  let currentTime = 0;

  words.forEach((word) => {
    const phonemes = word.split('');
    phonemes.forEach((phoneme) => {
      // Mapeo simplificado de caracteres a visemes
      let visemeId = '0'; // silencio por defecto
      
      const vowels: { [key: string]: string } = {
        'a': '2', 'e': '5', 'i': '7', 'o': '3', 'u': '9',
        'á': '2', 'é': '5', 'í': '7', 'ó': '3', 'ú': '9',
      };
      
      const consonants: { [key: string]: string } = {
        'b': '11', 'p': '11', 'm': '11',
        'f': '12', 'v': '12',
        's': '15', 'z': '15', 'c': '15',
        't': '14', 'd': '14', 'n': '14',
        'l': '18', 'r': '19',
        'k': '17', 'g': '17', 'j': '17',
      };

      const lowerPhoneme = phoneme.toLowerCase();
      if (vowels[lowerPhoneme]) {
        visemeId = vowels[lowerPhoneme];
      } else if (consonants[lowerPhoneme]) {
        visemeId = consonants[lowerPhoneme];
      }

      visemes.push({
        id: visemeId,
        atMs: currentTime,
        durationMs: 80,
      });

      currentTime += 80;
    });

    // Pequeña pausa entre palabras
    visemes.push({
      id: '0',
      atMs: currentTime,
      durationMs: 50,
    });
    currentTime += 50;
  });

  return visemes;
}

/**
 * Endpoint GET para verificar configuración
 */
export async function GET() {
  const hasApiKey = !!process.env.AZURE_SPEECH_KEY;
  const hasRegion = !!process.env.AZURE_SPEECH_REGION;
  
  return NextResponse.json({
    configured: hasApiKey && hasRegion,
    region: process.env.AZURE_SPEECH_REGION || 'no configurada',
    message: hasApiKey && hasRegion
      ? 'Azure Speech API configurada'
      : 'AZURE_SPEECH_KEY o AZURE_SPEECH_REGION no configurados. La aplicación funcionará en modo mock.',
  });
}
