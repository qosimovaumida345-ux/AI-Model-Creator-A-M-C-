import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForgeStore } from '@/stores/forgeStore';

export default function StepDataset() {
  const {
    datasets, selectedDatasetId, setDataset,
    uploadDataset, pasteDataset, deleteDataset,
    loadDatasets, isUploading, prevStep, nextStep,
  } = useForgeStore();

  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteName, setPasteName] = useState('');
  const [pasteFormat, setPasteFormat] = useState<'jsonl' | 'txt'>('jsonl');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDatasets(); }, [loadDatasets]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadDataset(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadDataset(file);
  };

  const handlePaste = () => {
    if (!pasteContent.trim()) return;
    pasteDataset(pasteContent, pasteName || 'Pasted dataset', pasteFormat);
    setPasteContent('');
    setPasteName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Training Data</h2>
        <p className="text-sm text-white/40">Upload a JSONL, CSV, or TXT file, or paste samples directly</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {(['upload', 'paste'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === m ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white/60'}`}
          >
            {m === 'upload' ? 'Upload File' : 'Paste Text'}
          </button>
        ))}
      </div>

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'}`}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".jsonl,.csv,.txt,.json" className="hidden" onChange={handleFileSelect} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </motion.div>
              <span className="text-sm text-white/60">Uploading...</span>
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-white/20 mb-3">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p className="text-sm text-white/40">Drag and drop a file here, or click to browse</p>
              <p className="text-xs text-white/20 mt-1">JSONL, CSV, TXT — max 100MB</p>
            </>
          )}
        </div>
      )}

      {/* Paste mode */}
      {mode === 'paste' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              value={pasteName}
              onChange={(e) => setPasteName(e.target.value)}
              placeholder="Dataset name"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
            <select
              value={pasteFormat}
              onChange={(e) => setPasteFormat(e.target.value as 'jsonl' | 'txt')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         focus:outline-none focus:border-cyan-500/50"
            >
              <option value="jsonl">JSONL</option>
              <option value="txt">Plain Text</option>
            </select>
          </div>

          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder={pasteFormat === 'jsonl'
              ? '{"instruction": "What is AI?", "output": "AI stands for..."}\n{"instruction": "Explain ML", "output": "Machine learning is..."}'
              : 'Paste your training text here.\n\nSeparate samples with blank lines.'
            }
            rows={8}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                       font-mono placeholder-white/20 resize-none focus:outline-none focus:border-cyan-500/50"
          />

          <button
            onClick={handlePaste}
            disabled={!pasteContent.trim() || isUploading}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium
                       disabled:opacity-30 hover:bg-white/15 transition-colors"
          >
            Save Dataset
          </button>
        </div>
      )}

      {/* Dataset list */}
      <AnimatePresence>
        {datasets.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <h3 className="text-xs text-white/40 uppercase tracking-wider">Your Datasets</h3>
            {datasets.map((ds) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedDatasetId === ds.id
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/5'
                  }`}
                onClick={() => setDataset(ds.id)}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold
                  ${selectedDatasetId === ds.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/30'}`}>
                  {ds.format.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{ds.name}</div>
                  <div className="text-[10px] text-white/30">
                    {ds.sampleCount} samples · {(ds.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteDataset(ds.id); }}
                  className="p-1.5 rounded hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={prevStep} className="px-6 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!selectedDatasetId}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                     text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed
                     hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          Next: Configure
        </button>
      </div>
    </div>
  );
}