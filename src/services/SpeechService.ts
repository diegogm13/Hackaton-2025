import { GOOGLE_CLOUD_API_KEY } from '../config/speech';

export const SpeechService = {
  /**
   * Transcribe audio base64 using Google Cloud Speech-to-Text API
   * @param base64Audio Audio data in base64 format (m4a from expo-av)
   * @returns Transcribed text
   */
  async transcribeAudio(base64Audio: string): Promise<string> {
    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`;

    const body = {
      config: {
        encoding: 'ENCODING_UNSPECIFIED', // Google can often detect m4a/aac container
        sampleRateHertz: 16000,
        languageCode: 'es-MX',
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: base64Audio,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Error en Google STT API');
      }

      const transcription = data.results
        ?.map((result: any) => result.alternatives[0].transcript)
        .join('\n');

      return transcription || '';
    } catch (error) {
      console.error('SpeechService Error:', error);
      throw error;
    }
  },
};
