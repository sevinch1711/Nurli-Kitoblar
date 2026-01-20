
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async chatWithAI(history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are NoorReader AI Assistant. Help the user with their reading journey. Be insightful, academic yet warm."
      }
    });
    return response.text || 'Communication error.';
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: `Translate the following text to ${targetLanguage}. Maintain the original tone, formatting, and line breaks. Text: \n\n ${text}` }]
      }
    });
    return response.text || text;
  }

  async analyzeImage(base64Data: string, mimeType: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Analyze this visually and explain in detail." }] }
    });
    return response.text || 'Vision analysis failed.';
  }

  async transcribeAudio(base64Audio: string, mimeType: string = 'audio/wav'): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: "Transcribe audio." }] }
    });
    return response.text || '';
  }

  async extractText(base64Data: string, mimeType: string = 'image/jpeg'): Promise<{ text: string, detectedLanguage: string }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Extract text and language (en, uz, ru)." }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            language: { type: Type.STRING }
          },
          required: ["text", "language"]
        }
      }
    });
    try {
      const result = JSON.parse(response.text || '{}');
      return { text: result.text || '', detectedLanguage: result.language || 'en' };
    } catch (e) {
      return { text: response.text || '', detectedLanguage: 'en' };
    }
  }

  async summarizeText(input: string, mimeType?: string): Promise<string> {
    const part = mimeType 
      ? { inlineData: { mimeType, data: input } } 
      : { text: input };

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          part,
          { text: "Provide a comprehensive summary including main themes, key takeaways, and conclusion. THE SUMMARY MUST BE IN THE SAME LANGUAGE AS THE CONTENT PROVIDED." }
        ]
      }
    });
    return response.text || 'Summary failed.';
  }

  async generateSpeech(text: string, voiceName: string = 'Kore', language: string = 'en'): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  }

  async connectLive(callbacks: any, systemInstruction: string) {
    return this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction,
      },
    });
  }
}

export const gemini = new GeminiService();

export function decodeBase64Audio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeToAudioBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

export function encodeAudioToBlob(data: Float32Array): { data: string; mimeType: string } {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
}
