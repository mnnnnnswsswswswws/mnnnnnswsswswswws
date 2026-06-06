import { useState } from 'react';
import { Book, Photo } from '../types';
import { getPhotoUrl } from '../api';

interface Props {
  book: Book;
}

export default function BookViewer({ book }: Props) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentIndex = lightbox ? book.photos.findIndex(p => p.id === lightbox.id) : -1;

  const goPrev = () => {
    if (currentIndex > 0) setLightbox(book.photos[currentIndex - 1]);
  };

  const goNext = () => {
    if (currentIndex < book.photos.length - 1) setLightbox(book.photos[currentIndex + 1]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'Escape') setLightbox(null);
  };

  return (
    <div className="min-h-screen bg-stone-50" onKeyDown={handleKeyDown} tabIndex={-1}>
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-stone-800 truncate">{book.title}</h1>
            {book.description && (
              <p className="text-stone-500 mt-1">{book.description}</p>
            )}
            <p className="text-xs text-stone-400 mt-2">
              {book.photos.length} {book.photos.length === 1 ? 'Foto' : 'Fotos'} &middot;{' '}
              {new Date(book.createdAt).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="border border-stone-200 hover:border-amber-400 text-stone-600 hover:text-amber-600 font-medium px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            {copied ? '✓ Kopiert!' : '🔗 Teilen'}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {book.photos.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {book.photos.map(photo => (
              <div
                key={photo.id}
                className="break-inside-avoid mb-4 group cursor-zoom-in"
                onClick={() => setLightbox(photo)}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-all">
                  <img
                    src={getPhotoUrl(photo.filename)}
                    alt={photo.caption}
                    className="w-full object-cover group-hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="px-3 py-2.5">
                      <p className="text-sm text-stone-500 italic">"{photo.caption}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-28 text-stone-300">
            <div className="text-7xl mb-5">📷</div>
            <p className="text-xl text-stone-400">Dieses Fotobuch ist noch leer.</p>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl w-10 h-10 flex items-center justify-center transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>

          {currentIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl w-12 h-12 flex items-center justify-center transition-colors z-10"
              onClick={e => { e.stopPropagation(); goPrev(); }}
            >
              ‹
            </button>
          )}

          {currentIndex < book.photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl w-12 h-12 flex items-center justify-center transition-colors z-10"
              onClick={e => { e.stopPropagation(); goNext(); }}
            >
              ›
            </button>
          )}

          <img
            src={getPhotoUrl(lightbox.filename)}
            alt={lightbox.caption}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {lightbox.caption && (
            <p className="text-white/70 text-center mt-4 italic max-w-lg">
              "{lightbox.caption}"
            </p>
          )}

          <p className="text-white/30 text-xs mt-3">
            {currentIndex + 1} / {book.photos.length}
          </p>
        </div>
      )}
    </div>
  );
}
