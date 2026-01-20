
import React, { useState } from 'react';
import { Book, Language, LocalizationStrings } from '../types';
import { gemini } from '../services/geminiService';

interface LibraryProps {
  strings: LocalizationStrings;
  onBookSelect: (book: Book) => void;
  currentLanguage: Language;
}

const Library: React.FC<LibraryProps> = ({ strings, onBookSelect, currentLanguage }) => {
  const [status, setStatus] = useState<'idle' | 'reading' | 'analyzing' | 'done' | 'error'>('idle');
  const [extractedBook, setExtractedBook] = useState<Book | null>(null);

  const sampleBooks: Book[] = [
    { 
      id: '1', 
      title: 'O‘tkan Kunlar', 
      author: 'Abdulla Qodiriy', 
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&h=900&auto=format&fit=crop', 
      pdfUrl: 'https://www.orimi.com/pdf-test.pdf', 
      language: Language.UZ, 
      content: 'Baharın o güzel günlerinden biri edi. Güneş her zamanki gibi parlayıp tabiatın canlanışına guvohlik qilardi. Kumushbibi derazadan boqib, uzoqlarga termuldi...' 
    },
    { 
      id: '2', 
      title: 'The Great Gatsby', 
      author: 'F. Scott Fitzgerald', 
      coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&h=900&auto=format&fit=crop', 
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
      language: Language.EN, 
      content: 'In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."' 
    },
    { 
      id: '3', 
      title: 'Anna Karenina', 
      author: 'Leo Tolstoy', 
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&h=900&auto=format&fit=crop', 
      pdfUrl: 'https://www.africau.edu/images/default/sample.pdf', 
      language: Language.RU, 
      content: 'Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему. Всё смешалось в доме Облонских. Жена узнала, что муж был в связи с бывшею в их доме француженкою-гувернанткой...' 
    },
    { 
      id: '4', 
      title: 'Atomic Habits', 
      author: 'James Clear', 
      coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=600&h=900&auto=format&fit=crop', 
      pdfUrl: 'https://pdfobject.com/pdf/sample.pdf', 
      language: Language.EN, 
      content: 'It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that huge success requires huge action.' 
    },
    { 
      id: '5', 
      title: 'Yulduzli Tunlar', 
      author: 'Pirimqul Qodirov', 
      coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&h=900&auto=format&fit=crop', 
      pdfUrl: 'https://www.orimi.com/pdf-test.pdf', 
      language: Language.UZ, 
      content: 'Sulton Mahmud Mirzo vafotidan so‘ng Temuriylar taxti uchun kurash yanada avj oldi. Yosh Bobur Mirzo Andijon taxtiga o‘tirganida hali go‘dak edi...' 
    },
    { 
      id: '6', 
      title: 'Dunyoning Ishlari', 
      author: 'O‘tkir Hoshimov', 
      coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&h=900&auto=format&fit=crop', 
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
      language: Language.UZ, 
      content: 'Onamni eslasam, ko‘nglim yorishib ketadi. Uning mehribon nigohi, issiq nafasi hamon qulog‘im ostida yangraydi. Dunyoning ishlari shunaqa ekan...' 
    }
  ];

  const handleDownloadCover = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    try {
      const response = await fetch(book.coverUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${book.title}_cover.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download cover", err);
    }
  };

  const handleDownloadPdf = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    if (book.pdfUrl) {
      window.open(book.pdfUrl, '_blank');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('reading');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result?.toString().split(',')[1];
      if (base64Data) {
        try {
          setStatus('analyzing');
          const { text, detectedLanguage } = await gemini.extractText(base64Data, file.type);
          const newBook: Book = {
            id: Date.now().toString(),
            title: file.name.split('.')[0],
            author: strings.aiCompanion,
            coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600&h=900&auto=format&fit=crop',
            content: text,
            language: (detectedLanguage as Language) || currentLanguage
          };
          setExtractedBook(newBook);
          setStatus('done');
        } catch (error) { setStatus('error'); }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-12">
      {/* Featured / Continue Reading Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Mutoalani davom ettiring</h3>
          <button className="text-blue-600 font-bold text-sm hover:underline">Barcha tarixni ko‘rish</button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {sampleBooks.slice(0, 2).map((book) => (
            <div 
              key={`feat-${book.id}`}
              className="flex-shrink-0 w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 flex gap-6 shadow-pro border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-pro group"
              onClick={() => onBookSelect(book)}
            >
              <div className="w-24 h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative bg-slate-100">
                <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <span className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Sahifa: 42</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1 leading-tight">{book.title}</h4>
                <p className="text-sm text-slate-400 font-bold mb-4">{book.author}</p>
                
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={(e) => handleDownloadCover(e, book)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all"
                    title={strings.downloadCover}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                  {book.pdfUrl && (
                    <button 
                      onClick={(e) => handleDownloadPdf(e, book)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-600 transition-all"
                      title={strings.downloadPdf}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </button>
                  )}
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[60%] rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Banner */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] p-10 text-white shadow-pro-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-pro duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black tracking-tight mb-3">AI Mutolaa Hamrohi</h2>
            <p className="text-blue-100 text-lg font-medium opacity-90">Istalgan PDF, hujjat yoki fotosuratni yuklang. Bizning AI uni tahlil qiladi, matnga aylantiradi va bir zumda sizga o‘qib beradi.</p>
          </div>
          <div className="flex-shrink-0">
            <input type="file" id="main-upload" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
            <label htmlFor="main-upload" className="cursor-pointer inline-flex items-center gap-4 px-10 py-5 bg-white text-blue-900 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-pro shadow-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              {strings.upload}
            </label>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">{strings.library}</h3>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-pro">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-blue-600 border border-blue-600 rounded-xl shadow-sm text-white transition-pro">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h7M4 12h7M4 18h7M15 6h5M15 12h5M15 18h5" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-8 lg:gap-10">
          {sampleBooks.map((book) => (
            <div 
              key={book.id} 
              className="group cursor-pointer flex flex-col"
              onClick={() => onBookSelect(book)}
            >
              <div className="aspect-[2/3] relative rounded-[2rem] overflow-hidden mb-5 bg-slate-100 shadow-pro group-hover:shadow-pro-lg transition-pro transform group-hover:-translate-y-2">
                <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-pro duration-700" alt={book.title} />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/60 transition-pro flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleDownloadCover(e, book)}
                      className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-blue-900 transition-all shadow-xl"
                      title={strings.downloadCover}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    {book.pdfUrl && (
                      <button 
                        onClick={(e) => handleDownloadPdf(e, book)}
                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-all shadow-xl"
                        title={strings.downloadPdf}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </button>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-pro">
                    <svg className="w-7 h-7 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div className="px-1 text-center sm:text-left">
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-0.5 truncate">{book.title}</h4>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Status Overlay */}
      {status === 'analyzing' && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center shadow-4xl animate-in zoom-in-95">
             <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-8 border-slate-100 dark:border-slate-800 rounded-full"></div>
               <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{strings.summarizingStatus}</h3>
             <p className="text-slate-500 font-bold mb-8">Gemini 3.0 kitobni o‘rganmoqda va tahlil qilmoqda...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
