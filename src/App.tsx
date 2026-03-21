import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ParticleBackground from './components/ParticleBackground';
import Landing from './components/Landing';
import ModelCatalog from './components/ModelCatalog';
import BuilderWizard from './components/BuilderWizard';
import ModelResult from './components/ModelResult';
import MyModels from './components/MyModels';
import ChatPage from './components/ChatPage';
import type { SavedModel } from './data/builderQuestions';

type Page = 'landing' | 'catalog' | 'wizard' | 'result' | 'mymodels' | 'chat';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatModel, setChatModel] = useState<SavedModel | null>(null);

  const goToPage = (p: Page) => setPage(p);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <ParticleBackground />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {page === 'landing' && (
            <Landing
              onStart={() => goToPage('catalog')}
              onMyModels={() => goToPage('mymodels')}
            />
          )}

          {page === 'catalog' && (
            <ModelCatalog
              onNext={(ids) => {
                setSelectedModelIds(ids);
                goToPage('wizard');
              }}
              onBack={() => goToPage('landing')}
            />
          )}

          {page === 'wizard' && (
            <BuilderWizard
              onComplete={(ans) => {
                setAnswers(ans);
                goToPage('result');
              }}
              onBack={() => goToPage('catalog')}
            />
          )}

          {page === 'result' && (
            <ModelResult
              selectedModelIds={selectedModelIds}
              answers={answers}
              onBack={() => goToPage('wizard')}
              onHome={() => goToPage('landing')}
              onMyModels={() => goToPage('mymodels')}
            />
          )}

          {page === 'mymodels' && (
            <MyModels
              onBack={() => goToPage('landing')}
              onChat={(model) => {
                setChatModel(model);
                goToPage('chat');
              }}
            />
          )}

          {page === 'chat' && chatModel && (
            <ChatPage
              model={chatModel}
              onBack={() => goToPage('mymodels')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
