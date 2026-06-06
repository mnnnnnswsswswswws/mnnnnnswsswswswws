import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import BookPage from './components/BookPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/books/:id" element={<BookPage />} />
    </Routes>
  );
}
