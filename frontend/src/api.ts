const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getPhotoUrl = (filename: string) => `${API}/uploads/${filename}`;

export async function createBook(title: string, description: string) {
  const res = await fetch(`${API}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ id: string; editToken: string; title: string; createdAt: string }>;
}

export async function getBook(id: string) {
  const res = await fetch(`${API}/api/books/${id}`);
  if (!res.ok) throw new Error('Fotobuch nicht gefunden');
  return res.json();
}

export async function updateBook(id: string, editToken: string, data: { title?: string; description?: string }) {
  const res = await fetch(`${API}/api/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, editToken }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadPhotos(bookId: string, editToken: string, files: File[]) {
  const formData = new FormData();
  files.forEach(f => formData.append('photos', f));
  const res = await fetch(`${API}/api/books/${bookId}/photos`, {
    method: 'POST',
    headers: { 'x-edit-token': editToken },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCaption(bookId: string, photoId: string, editToken: string, caption: string) {
  const res = await fetch(`${API}/api/books/${bookId}/photos/${photoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption, editToken }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePhoto(bookId: string, photoId: string, editToken: string) {
  const res = await fetch(`${API}/api/books/${bookId}/photos/${photoId}`, {
    method: 'DELETE',
    headers: { 'x-edit-token': editToken },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
