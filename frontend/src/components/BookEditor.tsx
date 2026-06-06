import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../types';
import { uploadPhotos, updateCaption, deletePhoto, updateBook, getPhotoUrl } from '../api';

interface Props {
  book: Book;
  editToken: string;
  onUpdate: (book: Book) => void;
}

export default function BookEditor({ book, editToken, onUpdate }: Props) {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(book.title);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (!imageFiles.length) return;
      setUploading(true);
      try {
        const newPhotos = await uploadPhotos(book.id, editToken, imageFiles);
        onUpdate({ ...book, photos: [...book.photos, ...newPhotos] });
      } catch {
        alert('Fehler beim Hochladen der Fotos.');
      } finally {
        setUploading(false);
      }
    },
    [book, editToken, onUpdate]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleSaveCaption = async (photoId: string) => {
    try {
      await updateCaption(book.id, photoId, editToken, captionValue);
      onUpdate({
        ...book,
        photos: book.photos.map(p => (p.id === photoId ? { ...p, caption: captionValue } : p)),
      });
    } catch {
      alert('Fehler beim Speichern der Beschriftung.');
    }
    setEditingCaption(null);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Dieses Foto wirklich löschen?')) return;
    try {
      await deletePhoto(book.id, photoId, editToken);
      onUpdate({ ...book, photos: book.photos.filter(p => p.id !== photoId) });
    } catch {
      alert('Fehler beim Löschen des Fotos.');
    }
  };

  const handleSaveTitle = async () => {
    if (!titleValue.trim()) { setEditingTitle(false); return; }
    try {
      const updated = await updateBook(book.id, editToken, { title: titleValue.trim() });
      onUpdate({ ...book, ...updated });
      const stored = JSON.parse(localStorage.getItem('myBooks') || '[]');
      localStorage.setItem(
        'myBooks',
        JSON.stringify(stored.map((b: { id: string }) => b.id === book.id ? { ...b, title: titleValue.trim() } : b))
      );
    } catch {
      alert('Fehler beim Speichern des Titels.');
    }
    setEditingTitle(false);
  };

  const shareUrl = `${window.location.origin}/books/${book.id}`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-700 transition-colors text-sm flex items-center gap-1"
          >
            ← Zurück
          </button>

          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                className="font-bold text-xl text-stone-800 border-b-2 border-amber-400 bg-transparent focus:outline-none w-full"
                onBlur={handleSaveTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => { setEditingTitle(true); setTitleValue(book.title); }}
                className="font-bold text-xl text-stone-800 hover:text-amber-600 transition-colors flex items-center gap-2 group truncate"
                title="Klicken zum Bearbeiten"
              >
                <span className="truncate">{book.title}</span>
                <span className="text-stone-300 group-hover:text-amber-400 text-sm flex-shrink-0">✏️</span>
              </button>
            )}
          </div>

          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
            Mein Buch
          </span>
          <button
            onClick={handleShare}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2 rounded-full text-sm transition-all flex items-center gap-2 flex-shrink-0 shadow-sm"
          >
            {copied ? '✓ Kopiert!' : '🔗 Link teilen'}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all mb-8 ${
            dragging
              ? 'border-amber-400 bg-amber-50 scale-[1.01]'
              : 'border-stone-300 hover:border-amber-400 hover:bg-amber-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          {uploading ? (
            <div className="text-stone-500">
              <div className="text-5xl mb-3">⏳</div>
              <p className="font-medium text-stone-600">Fotos werden hochgeladen…</p>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-3">📤</div>
              <p className="font-medium text-stone-600">Fotos hierher ziehen oder klicken</p>
              <p className="text-sm text-stone-400 mt-1">JPG, PNG, GIF, WEBP – bis zu 10 MB pro Bild</p>
            </div>
          )}
        </div>

        {book.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {book.photos.map(photo => (
              <div
                key={photo.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-all"
              >
                <div className="aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={getPhotoUrl(photo.filename)}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full text-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Löschen"
                >
                  ✕
                </button>
                <div className="p-2.5">
                  {editingCaption === photo.id ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={captionValue}
                        onChange={e => setCaptionValue(e.target.value)}
                        placeholder="Beschriftung…"
                        className="flex-1 text-xs border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveCaption(photo.id);
                          if (e.key === 'Escape') setEditingCaption(null);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCaption(photo.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-2.5 py-1.5 rounded-lg"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingCaption(photo.id); setCaptionValue(photo.caption); }}
                      className="w-full text-left text-xs transition-colors"
                    >
                      {photo.caption ? (
                        <span className="text-stone-600 italic">"{photo.caption}"</span>
                      ) : (
                        <span className="text-stone-300 hover:text-amber-400">+ Beschriftung hinzufügen</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-300">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-stone-400">Noch keine Fotos. Lade dein erstes Foto hoch!</p>
          </div>
        )}

        {book.photos.length > 0 && (
          <div className="mt-14 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100">
            <h3 className="font-semibold text-stone-800 text-lg mb-1">🔗 Fotobuch teilen</h3>
            <p className="text-sm text-stone-500 mb-4">
              Dieser Link ist für alle sichtbar – teile ihn mit Freunden und Familie.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-stone-500 focus:outline-none"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleShare}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Kopiert!' : 'Kopieren'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
