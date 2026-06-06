import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBook } from '../api';
import { LocalBook } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [myBooks, setMyBooks] = useState<LocalBook[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('myBooks');
    if (stored) setMyBooks(JSON.parse(stored));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const book = await createBook(title.trim(), description.trim());
      const localBook: LocalBook = {
        id: book.id,
        editToken: book.editToken,
        title: book.title,
        createdAt: book.createdAt,
      };
      const existing: LocalBook[] = JSON.parse(localStorage.getItem('myBooks') || '[]');
      const updated = [localBook, ...existing];
      localStorage.setItem('myBooks', JSON.stringify(updated));
      localStorage.setItem(`editToken_${book.id}`, book.editToken);
      navigate(`/books/${book.id}`);
    } catch {
      alert('Fehler beim Erstellen des Fotobuchs. Ist der Server gestartet?');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setShowCreate(false);
    setTitle('');
    setDescription('');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-stone-800">📸 Fotobuch</span>
        </div>
      </header>

      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-extrabold text-stone-800 mb-4 tracking-tight">
            Deine Erinnerungen,
            <br />
            <span className="text-amber-500">schön geteilt.</span>
          </h1>
          <p className="text-lg text-stone-500 mb-10 max-w-xl mx-auto">
            Erstelle ein Fotobuch, lade deine schönsten Bilder hoch und teile es mit einem Klick.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            + Neues Fotobuch erstellen
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {myBooks.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold text-stone-700 mb-6">Meine Fotobücher</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {myBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-stone-800 truncate mb-1">{book.title}</h3>
                  <p className="text-xs text-stone-400">
                    {new Date(book.createdAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-stone-300">
            <div className="text-8xl mb-6">📷</div>
            <p className="text-xl font-medium text-stone-400">Noch keine Fotobücher</p>
            <p className="text-sm mt-2 text-stone-300">Erstelle dein erstes Fotobuch oben!</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-stone-800 mb-6">Neues Fotobuch</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Titel *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="z.B. Sommerurlaub 2024"
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-stone-800"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Beschreibung <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Eine kurze Beschreibung..."
                  rows={3}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-stone-800"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 border border-stone-300 text-stone-600 font-medium px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Wird erstellt…' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
