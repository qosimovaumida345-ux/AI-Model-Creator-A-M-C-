import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const ModelsPage = lazy(() => import('@/pages/ModelsPage'));
const ModelDetailPage = lazy(() => import('@/pages/ModelDetailPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ForgePage = lazy(() => import('@/pages/ForgePage'));
const MyModelsPage = lazy(() => import('@/pages/MyModelsPage'));
const InstallPage = lazy(() => import('@/pages/InstallPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function LoadingFallback() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center animate-pulse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Model Forge...
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/chat');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/model/:id" element={<ModelDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:sessionId" element={<ChatPage />} />
          <Route path="/forge" element={<ForgePage />} />
          <Route path="/my-models" element={<MyModelsPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/downloads" element={<InstallPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}