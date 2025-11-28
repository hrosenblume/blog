import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LABELS } from './constants';
import { api } from './api/client';
import { Loader2 } from 'lucide-react';

const WriterDashboard = lazy(() => import('./components/WriterDashboard'));
const Editor = lazy(() => import('./components/Editor'));

type Page = 'dashboard' | 'editor';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const status = await api.checkAuth();
        setIsAuthenticated(status.authenticated);
        setUserEmail(status.email || null);
        
        if (!status.authenticated) {
          api.redirectToLogin();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        api.redirectToLogin();
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigateToEditor = useCallback((articleId?: string) => {
    setCurrentArticleId(articleId);
    setCurrentPage('editor');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentArticleId(undefined);
    setCurrentPage('dashboard');
  }, []);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  const handleLogout = useCallback(() => {
    api.logout();
  }, []);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <p className={darkMode ? 'text-white' : 'text-gray-900'}>Redirecting to login...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <WriterDashboard 
            onNavigateToEditor={handleNavigateToEditor}
            onNavigateToEssay={() => {}} // Not used - view live opens in new tab
            darkMode={darkMode} 
          />
        );
      case 'editor':
        return (
          <Editor 
            onNavigateBack={handleBackToDashboard} 
            darkMode={darkMode}
            articleId={currentArticleId}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className={darkMode ? 'dark' : ''}>
        {/* Simple header with user info and controls */}
        <header className={`fixed top-0 left-0 right-0 z-50 border-b ${
          darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <button 
              onClick={handleBackToDashboard}
              className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Writer
            </button>
            
            <div className="flex items-center gap-4">
              {userEmail && (
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userEmail}
                </span>
              )}
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="pt-14">
          <Suspense fallback={
            <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
              <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-white' : 'text-gray-900'}`} />
            </div>
          }>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}
