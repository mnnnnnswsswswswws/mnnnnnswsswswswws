import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_FILE = path.join(dataDir, 'books.json');

function loadBooks() {
  if (!fs.existsSync(DB_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveBooks(books) {
  fs.writeFileSync(DB_FILE, JSON.stringify(books, null, 2));
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Create a new book
app.post('/api/books', (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const books = loadBooks();
  const id = uuidv4();
  const editToken = uuidv4();

  books[id] = {
    id,
    editToken,
    title: title.trim(),
    description: (description || '').trim(),
    createdAt: new Date().toISOString(),
    photos: [],
  };

  saveBooks(books);
  res.json(books[id]);
});

// Get book (public – editToken is never exposed)
app.get('/api/books/:id', (req, res) => {
  const books = loadBooks();
  const book = books[req.params.id];
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const { editToken, ...publicBook } = book;
  res.json(publicBook);
});

// Update book metadata
app.put('/api/books/:id', (req, res) => {
  const books = loadBooks();
  const book = books[req.params.id];
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const { title, description, editToken } = req.body;
  if (editToken !== book.editToken) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (title && title.trim()) book.title = title.trim();
  if (description !== undefined) book.description = description.trim();

  saveBooks(books);
  const { editToken: _, ...publicBook } = book;
  res.json(publicBook);
});

// Upload photos
app.post('/api/books/:id/photos', upload.array('photos', 50), (req, res) => {
  const books = loadBooks();
  const book = books[req.params.id];
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const editToken = req.headers['x-edit-token'];
  if (editToken !== book.editToken) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const newPhotos = (req.files || []).map((file, index) => ({
    id: uuidv4(),
    filename: file.filename,
    caption: '',
    order: book.photos.length + index,
    uploadedAt: new Date().toISOString(),
  }));

  book.photos.push(...newPhotos);
  saveBooks(books);
  res.json(newPhotos);
});

// Update photo caption
app.put('/api/books/:id/photos/:photoId', (req, res) => {
  const books = loadBooks();
  const book = books[req.params.id];
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const { caption, editToken } = req.body;
  if (editToken !== book.editToken) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const photo = book.photos.find(p => p.id === req.params.photoId);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  photo.caption = caption || '';
  saveBooks(books);
  res.json(photo);
});

// Delete photo
app.delete('/api/books/:id/photos/:photoId', (req, res) => {
  const books = loadBooks();
  const book = books[req.params.id];
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const editToken = req.headers['x-edit-token'];
  if (editToken !== book.editToken) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const idx = book.photos.findIndex(p => p.id === req.params.photoId);
  if (idx === -1) return res.status(404).json({ error: 'Photo not found' });

  const [photo] = book.photos.splice(idx, 1);
  const filePath = path.join(uploadsDir, photo.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  saveBooks(books);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`📸 Fotobuch-Server läuft auf http://localhost:${PORT}`);
});
