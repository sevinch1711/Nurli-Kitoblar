
export enum Language {
  EN = 'en',
  RU = 'ru',
  UZ = 'uz',
  TR = 'tr',
  AR = 'ar'
}

export interface LocalizationStrings {
  title: string;
  settings: string;
  library: string;
  reader: string;
  upload: string;
  aiVoiceChat: string;
  bookSummary: string;
  audioBook: string;
  aiAudio: string;
  languageSelect: string;
  startLive: string;
  stopLive: string;
  ocrProcessing: string;
  noFileSelected: string;
  extractText: string;
  voiceLanguage: string;
  autoDetect: string;
  summarize: string;
  summarizingStatus: string;
  summarizingDrafting: string;
  summaryTitle: string;
  close: string;
  aiCompanion: string;
  askAnything: string;
  analyzeImage: string;
  visionProcessing: string;
  chatPlaceholder: string;
  dropFile: string;
  processingPdf: string;
  downloadCover: string;
  downloadPdf: string;
  getPdf: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  pdfUrl?: string;
  content?: string;
  language: Language;
}

export interface ReaderSettings {
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  ttsSpeed: number;
  ttsPitch: number;
  voiceName: string;
  voiceLanguage?: Language | 'auto';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id: string;
}
