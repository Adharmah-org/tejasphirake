import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LayoutShell } from './components/LayoutShell';
import { CatalogProvider } from './context/CatalogContext';
import { ReaderProvider } from './context/ReaderContext';
import { TranslationProvider } from './context/TranslationContext';
import { AuthorPage } from './pages/AuthorPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { BookReaderPage } from './pages/BookReaderPage';
import { BooksPage } from './pages/BooksPage';
import { HomePage } from './pages/HomePage';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { JournalPage } from './pages/JournalPage';
import { MidnightPage } from './pages/MidnightPage';
import { MoodsPage } from './pages/MoodsPage';
import { PoemDetailPage } from './pages/PoemDetailPage';
import { PoetryPage } from './pages/PoetryPage';
import { SavedPage } from './pages/SavedPage';
import { StoryArchivesPage } from './pages/StoryArchivesPage';
import { TheatrePage } from './pages/TheatrePage';
import { UndefinedArchivePage } from './pages/UndefinedArchivePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <CatalogProvider>
      <ReaderProvider>
        <BrowserRouter>
          <TranslationProvider>
            <ScrollToTop />
            <Routes>
            <Route
              path="/"
              element={
                <LayoutShell>
                  <HomePage />
                </LayoutShell>
              }
            />
            <Route
              path="/books"
              element={
                <LayoutShell>
                  <BooksPage />
                </LayoutShell>
              }
            />
            <Route
              path="/library"
              element={
                <LayoutShell>
                  <BooksPage />
                </LayoutShell>
              }
            />
            <Route
              path="/books/:slug"
              element={
                <LayoutShell>
                  <BookDetailPage />
                </LayoutShell>
              }
            />
            <Route
              path="/read/:slug"
              element={
                <LayoutShell hideChrome>
                  <BookReaderPage />
                </LayoutShell>
              }
            />
            <Route
              path="/poetry"
              element={
                <LayoutShell>
                  <PoetryPage />
                </LayoutShell>
              }
            />
            <Route
              path="/poetry-room"
              element={
                <LayoutShell>
                  <PoetryPage />
                </LayoutShell>
              }
            />
            <Route
              path="/poetry/:slug"
              element={
                <LayoutShell>
                  <PoemDetailPage />
                </LayoutShell>
              }
            />
            <Route
              path="/stories"
              element={
                <LayoutShell>
                  <StoryArchivesPage />
                </LayoutShell>
              }
            />
            <Route
              path="/theatre"
              element={
                <LayoutShell>
                  <TheatrePage />
                </LayoutShell>
              }
            />
            <Route
              path="/journal"
              element={
                <LayoutShell>
                  <JournalPage />
                </LayoutShell>
              }
            />
            <Route
              path="/unsaid-journal"
              element={
                <LayoutShell>
                  <JournalPage />
                </LayoutShell>
              }
            />
            <Route
              path="/journal/:slug"
              element={
                <LayoutShell>
                  <JournalDetailPage />
                </LayoutShell>
              }
            />
            <Route
              path="/author"
              element={
                <LayoutShell>
                  <AuthorPage />
                </LayoutShell>
              }
            />
            <Route
              path="/about"
              element={
                <LayoutShell>
                  <AuthorPage />
                </LayoutShell>
              }
            />
            <Route
              path="/author-archive"
              element={
                <LayoutShell>
                  <AuthorPage />
                </LayoutShell>
              }
            />
            <Route
              path="/midnight-page"
              element={
                <LayoutShell>
                  <MidnightPage />
                </LayoutShell>
              }
            />
            <Route
              path="/moods"
              element={
                <LayoutShell>
                  <MoodsPage />
                </LayoutShell>
              }
            />
            <Route
              path="/saved"
              element={
                <LayoutShell>
                  <SavedPage />
                </LayoutShell>
              }
            />
            <Route
              path="/bookshelf"
              element={
                <LayoutShell>
                  <SavedPage />
                </LayoutShell>
              }
            />
            <Route
              path="/undefined"
              element={
                <LayoutShell>
                  <UndefinedArchivePage />
                </LayoutShell>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TranslationProvider>
        </BrowserRouter>
      </ReaderProvider>
    </CatalogProvider>
  );
}
