import React, { useState } from 'react';
import { Loader2, Play, Download } from 'lucide-react';
import { LocalizationStrings } from '../types';

interface AIAudioGeneratorProps {
  strings: LocalizationStrings;
}

const AIAudioGenerator: React.FC<AIAudioGeneratorProps> = ({ strings }) => {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start", startPage.toString());
    formData.append("end", endPage.toString());
    formData.append("voice", "uz-UZ-MadinaNeural");

    try {
        const response = await fetch("https://nurli-kitoblar.onrender.com/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Server xatoligi");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err: any) {
        setError("Server bilan bog'lanishda xatolik. Iltimos, keyinroq urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
      <header className="mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">
          {strings.aiAudio || "Audio Generator"}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Microsoft Edge Neural TTS yordamida kitob audiolashtirilmoqda.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2. FORM SECTION */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              PDF Hujjat
            </label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-zinc-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-zinc-100 file:text-zinc-700
                  hover:file:bg-zinc-200
                  dark:file:bg-zinc-800 dark:file:text-zinc-300
                  dark:hover:file:bg-zinc-700
                  cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all
                "
              />
            </div>
            {file && (
              <p className="text-xs text-green-600 font-medium mt-1">
                • {file.name} tanlandi
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Boshlash
              </label>
              <input 
                type="number" 
                min={1} 
                value={startPage} 
                onChange={(e) => setStartPage(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none transition-all font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Tugash
              </label>
              <input 
                type="number" 
                min={startPage} 
                value={endPage} 
                onChange={(e) => setEndPage(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white outline-none transition-all font-mono text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !file}
            className={`w-full py-4 px-6 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3
              ${loading || !file 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-[0.99]'
              }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "Qayta ishlanmoqda..." : "Generatsiya qilish"}
          </button>
          
          <p className="text-xs text-zinc-400 text-center">
            Maksimal tavsiya etilgan hajm: 20 sahifa / so'rov
          </p>
        </div>

        {/* 3. RESULT SECTION */}
        <div className="lg:col-span-5">
          <div className="h-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between min-h-[300px]">
            
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">Natija</h3>
              <p className="text-xs text-zinc-500 mb-6">Audio fayl shu yerda paydo bo'ladi.</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {!audioUrl ? (
                <div className="text-center opacity-40">
                  <div className="w-16 h-16 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="block w-2 h-2 bg-zinc-400 rounded-full"></span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Kutilmoqda</p>
                </div>
              ) : (
                <div className="w-full space-y-6 animate-in zoom-in duration-300">
                  <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                         <Play size={14} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Audio tayyor</p>
                        <p className="text-xs text-zinc-500">Duration: Auto</p>
                      </div>
                    </div>
                    <audio controls src={audioUrl} className="w-full h-10" />
                  </div>

                  <a 
                    href={audioUrl} 
                    download={`audiobook-${startPage}-${endPage}.mp3`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Download size={16} /> MP3 Yuklab olish
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAudioGenerator;
