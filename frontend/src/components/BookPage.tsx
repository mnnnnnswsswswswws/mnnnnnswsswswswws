import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook } from '../api';
import { Book } from '../types';
import BookEditor from './BookEditor';
import BookViewer from './BookViewer';

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const editToken = id ? localStorage.getItem(`editToken_${id}`) : null;

  useEffect(() => {
    if (!id) return;
    getBook(id)
      .then(setBook)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center text-stone-400">
          <div className="text-5xl mb-4 animate-pulse">📸</div>
          <p>Lade Fotobuch…</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-stone-700">Fotobuch nicht gefunden</h2>
          <p className="text-stone-400 mt-2">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 text-amber-500 hover:text-amber-600 font-medium"
          >
            ← Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  if (editToken) {
    return <BookEditor book={book} editToken={editToken} onUpdate={setBook} />;
  }

  return <BookViewer book={book} />;
}
