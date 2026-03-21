import { useState, useEffect, useCallback } from 'react';
import type { AIModel, ForgedModel } from './lib/db';
import {
  getAllModels, saveModel,
  getAllForgedModels, saveForgedModel, deleteForgedModel as dbDeleteForgedModel
} from './lib/db';
import { DEFAULT_MODELS } from './lib/models';
import { detectDevice, getStorageEstimate } from './lib/device';
import type { DeviceInfo } from './lib/device';
import {
  IconDashboard, IconModels, IconForge, IconDevice, IconDownload, IconCheck,
  IconTrash, IconEdit, IconImage, IconMenu, IconWifi, IconWifiOff,
  IconCpu, IconPlay, IconStop, IconSend, IconChevron
} from './components/Icons';

type Page = 'dashboard' | 'models' | 'forge' | 'device' | 'chat';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [models, setModels] = useState<AIModel[]>([]);
  const [forgedModels, setForgedModels] = useState<ForgedModel[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const stored = await getAllModels();
      if (stored.length === 0) {
        for (const m of DEFAULT_MODELS) {
          await saveModel(m);
        }
        setModels(DEFAULT_MODELS);
      } else {
        setModels(stored);
      }
      const forged = await getAllForgedModels();
      setForgedModels(forged);

      const info = detectDevice();
      const storage = await getStorageEstimate();
      setDeviceInfo({ ...info, storageEstimate: storage });
    };
    init();

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const refreshModels = async () => {
    setModels(await getAllModels());
    setForgedModels(await getAllForgedModels());
  };

  const downloadedModels = models.filter(m => m.downloaded);
  const totalSize = downloadedModels.reduce((a, m) => a + m.sizeBytes, 0);
  const forgedCount = forgedModels.filter(f => f.status === 'ready').length;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface-100 border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">NeuralForge</h1>
              <p className="text-xs text-slate-500 font-mono">v2.0.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {([
            ['dashboard', 'Dashboard', IconDashboard],
            ['models', 'Model Hub', IconModels],
            ['forge', 'Model Forge', IconForge],
            ['device', 'System Info', IconDevice],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => { setPage(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${page === key ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Icon className="w-5 h-5" />
              {label}
              {key === 'models' && downloadedModels.length > 0 && (
                <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{downloadedModels.length}</span>
              )}
              {key === 'forge' && forgedCount > 0 && (
                <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{forgedCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {isOnline ? <IconWifi className="w-4 h-4 text-green-400" /> : <IconWifiOff className="w-4 h-4 text-red-400" />}
              <span className="text-xs font-medium text-slate-400">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>
            <div className="text-xs text-slate-500">
              <p>{downloadedModels.length} models ready</p>
              <p>{(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB used</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <IconMenu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-white capitalize">{page === 'chat' ? 'AI Chat' : page === 'forge' ? 'Model Forge' : page === 'device' ? 'System Information' : page === 'models' ? 'Model Hub' : 'Dashboard'}</h2>
          <div className="ml-auto flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-500 hidden sm:block">{isOnline ? 'Connected' : 'Offline'}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {page === 'dashboard' && (
            <DashboardPage
              models={models}
              forgedModels={forgedModels}
              deviceInfo={deviceInfo}
              isOnline={isOnline}
              onNavigate={setPage}
              onStartChat={(id) => { setActiveChat(id); setPage('chat'); }}
            />
          )}
          {page === 'models' && (
            <ModelsPage
              models={models}
              onRefresh={refreshModels}
              onNotify={showNotification}
              onStartChat={(id) => { setActiveChat(id); setPage('chat'); }}
            />
          )}
          {page === 'forge' && (
            <ForgePage
              models={models}
              forgedModels={forgedModels}
              onRefresh={refreshModels}
              onNotify={showNotification}
            />
          )}
          {page === 'device' && <DevicePage deviceInfo={deviceInfo} />}
          {page === 'chat' && (
            <ChatPage
              models={models}
              forgedModels={forgedModels}
              activeModelId={activeChat}
              onSelectModel={setActiveChat}
            />
          )}
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 glass rounded-xl px-6 py-3 text-sm font-medium text-white border border-blue-500/30 animate-fade-up">
          {notification}
        </div>
      )}
    </div>
  );
}

/* ========== DASHBOARD ========== */
function DashboardPage({ models, forgedModels, deviceInfo, isOnline, onNavigate, onStartChat }: {
  models: AIModel[];
  forgedModels: ForgedModel[];
  deviceInfo: DeviceInfo | null;
  isOnline: boolean;
  onNavigate: (p: Page) => void;
  onStartChat: (id: string) => void;
}) {
  const downloaded = models.filter(m => m.downloaded);
  const totalSize = downloaded.reduce((a, m) => a + m.sizeBytes, 0);
  const readyForged = forgedModels.filter(f => f.status === 'ready');

  return (
    <div className="hero-gradient min-h-full">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-surface-200 via-surface-100 to-surface-200 p-8 lg:p-12">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl" />
          </div>
          <div className="relative">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              AI Model Forge
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-6">
              Download, manage, and merge state-of-the-art AI models. Run inference locally with full offline support. Forge multiple models into one custom powerhouse.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigate('models')} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors">
                Browse Models
              </button>
              <button onClick={() => onNavigate('forge')} className="px-6 py-3 bg-surface-400 hover:bg-surface-500 text-white rounded-xl font-medium text-sm transition-colors border border-white/10">
                Open Forge
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Available Models', value: models.length.toString(), color: 'text-blue-400' },
            { label: 'Downloaded', value: downloaded.length.toString(), color: 'text-green-400' },
            { label: 'Forged Models', value: readyForged.length.toString(), color: 'text-purple-400' },
            { label: 'Storage Used', value: `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`, color: 'text-cyan-400' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-5 glass-hover transition-all cursor-default">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Downloaded Models */}
        {downloaded.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Ready to Use</h3>
              <button onClick={() => onNavigate('models')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <IconChevron className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloaded.map(m => (
                <div key={m.id} className="glass rounded-xl p-5 glass-hover transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={m.customIcon || m.logoUrl} alt={m.name} className="model-logo" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect width="56" height="56" rx="14" fill="#1c2340"/><text x="28" y="35" text-anchor="middle" fill="#3b82f6" font-size="20" font-family="sans-serif">AI</text></svg>'); }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{m.name}</h4>
                      <p className="text-xs text-slate-500">{m.provider} -- {m.parameters} params</p>
                    </div>
                  </div>
                  <button onClick={() => onStartChat(m.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-500/20">
                    <IconPlay className="w-4 h-4" /> Run Model
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forged Models */}
        {readyForged.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Forged Models</h3>
              <button onClick={() => onNavigate('forge')} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                Open Forge <IconChevron className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyForged.map(f => (
                <div key={f.id} className="glass rounded-xl p-5 gradient-border glass-hover transition-all">
                  <div className="flex items-start gap-4 mb-3">
                    {f.customIcon ? (
                      <img src={f.customIcon} alt={f.name} className="model-logo" />
                    ) : (
                      <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border-2 border-purple-500/20">
                        <IconForge className="w-7 h-7 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{f.name}</h4>
                      <p className="text-xs text-slate-500">{f.sourceModelNames.join(' + ')}</p>
                      <p className="text-xs text-purple-400 mt-1">Forged Model -- {f.size}</p>
                    </div>
                  </div>
                  <button onClick={() => {}} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/20">
                    <IconPlay className="w-4 h-4" /> Run Forged Model
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System overview */}
        {deviceInfo && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Overview</h3>
              <button onClick={() => onNavigate('device')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Details <IconChevron className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Device</p>
                <p className="text-white font-medium capitalize">{deviceInfo.type}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">OS</p>
                <p className="text-white font-medium">{deviceInfo.os}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">CPU Cores</p>
                <p className="text-white font-medium">{deviceInfo.cores}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Status</p>
                <p className={`font-medium ${isOnline ? 'text-green-400' : 'text-orange-400'}`}>
                  {isOnline ? 'Online' : 'Offline Ready'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== MODELS PAGE ========== */
function ModelsPage({ models, onRefresh, onNotify, onStartChat }: {
  models: AIModel[];
  onRefresh: () => void;
  onNotify: (m: string) => void;
  onStartChat: (id: string) => void;
}) {
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const handleDownload = async (model: AIModel) => {
    setDownloading(d => ({ ...d, [model.id]: true }));
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        await saveModel({ ...model, downloaded: true, downloadProgress: 100, downloadedAt: Date.now() });
        setDownloading(d => ({ ...d, [model.id]: false }));
        onRefresh();
        onNotify(`${model.name} downloaded successfully`);
      } else {
        await saveModel({ ...model, downloadProgress: Math.min(progress, 99) });
        onRefresh();
      }
    }, 200);
  };

  const handleDelete = async (model: AIModel) => {
    await saveModel({ ...model, downloaded: false, downloadProgress: 0, downloadedAt: undefined });
    onRefresh();
    onNotify(`${model.name} removed`);
  };

  const handleRename = async (model: AIModel) => {
    if (renameValue.trim()) {
      await saveModel({ ...model, name: renameValue.trim() });
      onRefresh();
      onNotify(`Model renamed to ${renameValue.trim()}`);
    }
    setRenaming(null);
  };

  const handleIconChange = async (model: AIModel, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      await saveModel({ ...model, customIcon: dataUrl });
      onRefresh();
      onNotify('Model icon updated');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Available AI Models</h2>
        <p className="text-slate-400">Download and manage state-of-the-art AI models for local inference</p>
      </div>

      <div className="space-y-4">
        {models.map((model, idx) => (
          <div
            key={model.id}
            className="glass rounded-2xl overflow-hidden glass-hover transition-all animate-fade-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start gap-5">
                {/* Logo + icon change */}
                <div className="relative group flex-shrink-0">
                  <img
                    src={model.customIcon || model.logoUrl}
                    alt={model.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-blue-500/40 transition-colors"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1c2340"/><text x="32" y="40" text-anchor="middle" fill="#3b82f6" font-size="22" font-family="sans-serif">AI</text></svg>'); }}
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <IconImage className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleIconChange(model, e.target.files[0])} />
                  </label>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      {renaming === model.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRename(model)}
                            className="bg-surface-300 text-white px-3 py-1.5 rounded-lg text-sm border border-blue-500/30 outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button onClick={() => handleRename(model)} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Save</button>
                          <button onClick={() => setRenaming(null)} className="text-slate-500 hover:text-slate-400 text-sm">Cancel</button>
                        </div>
                      ) : (
                        <h3 className="text-xl font-bold text-white">{model.name}</h3>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-400">{model.provider}</span>
                        <span className="text-xs text-slate-600">|</span>
                        <span className="text-xs font-mono text-blue-400">{model.parameters} params</span>
                        <span className="text-xs text-slate-600">|</span>
                        <span className="text-xs font-mono text-slate-500">{model.size}</span>
                        <span className="text-xs text-slate-600">|</span>
                        <span className="text-xs text-slate-500">v{model.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setRenaming(model.id); setRenameValue(model.name); }} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Rename">
                        <IconEdit className="w-4 h-4" />
                      </button>
                      {model.downloaded && (
                        <>
                          <button onClick={() => onStartChat(model.id)} className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all" title="Run">
                            <IconPlay className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(model)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Remove">
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{model.description}</p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {model.capabilities.slice(0, expandedModel === model.id ? undefined : 4).map(cap => (
                      <span key={cap} className="px-2.5 py-1 text-xs font-medium bg-surface-300 text-slate-300 rounded-lg border border-white/5">{cap}</span>
                    ))}
                    {model.capabilities.length > 4 && expandedModel !== model.id && (
                      <button onClick={() => setExpandedModel(model.id)} className="px-2.5 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded-lg">+{model.capabilities.length - 4} more</button>
                    )}
                  </div>

                  {/* Download / Status */}
                  {!model.downloaded && !downloading[model.id] && model.downloadProgress === 0 && (
                    <button onClick={() => handleDownload(model)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                      <IconDownload className="w-4 h-4" /> Download ({model.size})
                    </button>
                  )}

                  {(downloading[model.id] || (model.downloadProgress > 0 && model.downloadProgress < 100)) && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Downloading...</span>
                        <span>{Math.round(model.downloadProgress)}%</span>
                      </div>
                      <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                        <div className="h-full progress-animated rounded-full transition-all duration-200" style={{ width: `${model.downloadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {model.downloaded && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <IconCheck className="w-4 h-4" />
                      <span className="font-medium">Downloaded</span>
                      {model.downloadedAt && (
                        <span className="text-xs text-slate-500 ml-2">
                          {new Date(model.downloadedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedModel === model.id && (
                <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Architecture</p>
                    <p className="text-white font-mono text-xs">{model.architecture}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Quantization</p>
                    <p className="text-white font-mono text-xs">{model.quantization}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Context Window</p>
                    <p className="text-white font-mono text-xs">{model.contextWindow} tokens</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Parameters</p>
                    <p className="text-white font-mono text-xs">{model.parameters}</p>
                  </div>
                  <button onClick={() => setExpandedModel(null)} className="col-span-full text-xs text-slate-500 hover:text-slate-400 text-center pt-2">
                    Collapse details
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== FORGE PAGE ========== */
function ForgePage({ models, forgedModels, onRefresh, onNotify }: {
  models: AIModel[];
  forgedModels: ForgedModel[];
  onRefresh: () => void;
  onNotify: (m: string) => void;
}) {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [forgeName, setForgeName] = useState('');
  const [mergeStrategy, setMergeStrategy] = useState('weighted_average');
  const [quantization, setQuantization] = useState('Q4_K_M');
  const [forging, setForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [editingForged, setEditingForged] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const downloaded = models.filter(m => m.downloaded);

  const toggleModel = (id: string) => {
    setSelectedModels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const startForge = async () => {
    if (selectedModels.length < 2) {
      onNotify('Select at least 2 models to forge');
      return;
    }
    if (!forgeName.trim()) {
      onNotify('Enter a name for your forged model');
      return;
    }

    setForging(true);
    setForgeProgress(0);

    const sourceNames = selectedModels.map(id => models.find(m => m.id === id)?.name || id);
    const totalSize = selectedModels.reduce((a, id) => {
      const m = models.find(x => x.id === id);
      return a + (m?.sizeBytes || 0);
    }, 0);

    const forgedModel: ForgedModel = {
      id: `forged-${Date.now()}`,
      name: forgeName.trim(),
      description: `Forged from ${sourceNames.join(', ')} using ${mergeStrategy} strategy`,
      sourceModels: selectedModels,
      sourceModelNames: sourceNames,
      createdAt: Date.now(),
      size: `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`,
      sizeBytes: totalSize,
      status: 'forging',
      forgeProgress: 0,
      config: {
        mergeStrategy,
        weightDistribution: Object.fromEntries(selectedModels.map(id => [id, 1 / selectedModels.length])),
        quantization,
        contextWindow: '128K',
      },
    };

    await saveForgedModel(forgedModel);
    onRefresh();

    // Simulate forging
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.random() * 5 + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        await saveForgedModel({ ...forgedModel, status: 'ready', forgeProgress: 100 });
        setForging(false);
        setForgeProgress(0);
        setSelectedModels([]);
        setForgeName('');
        onRefresh();
        onNotify(`${forgeName} forged successfully!`);
      } else {
        setForgeProgress(progress);
        await saveForgedModel({ ...forgedModel, forgeProgress: progress });
      }
    }, 300);
  };

  const handleDeleteForged = async (id: string) => {
    await dbDeleteForgedModel(id);
    onRefresh();
    onNotify('Forged model deleted');
  };

  const handleRenameForged = async (model: ForgedModel) => {
    if (editName.trim()) {
      await saveForgedModel({ ...model, name: editName.trim() });
      onRefresh();
      onNotify(`Renamed to ${editName.trim()}`);
    }
    setEditingForged(null);
  };

  const handleForgedIcon = async (model: ForgedModel, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      await saveForgedModel({ ...model, customIcon: e.target?.result as string });
      onRefresh();
      onNotify('Forged model icon updated');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Forge Interface */}
      <div className="glass rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <IconForge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Forged Model</h2>
            <p className="text-sm text-slate-400">Merge multiple models into a single custom model</p>
          </div>
        </div>

        {downloaded.length < 2 ? (
          <div className="text-center py-12 text-slate-500">
            <IconModels className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Download at least 2 models to start forging</p>
            <p className="text-sm mt-1">Go to Model Hub to download models</p>
          </div>
        ) : (
          <>
            {/* Select Models */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Select Models to Forge</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {downloaded.map(model => {
                  const selected = selectedModels.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                        selected
                          ? 'bg-purple-500/10 border-purple-500/40 text-white'
                          : 'bg-surface-200 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <img src={model.customIcon || model.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{model.name}</p>
                        <p className="text-xs text-slate-500">{model.parameters} params -- {model.size}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selected ? 'bg-purple-500 border-purple-500' : 'border-slate-600'}`}>
                        {selected && <IconCheck className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Config */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Model Name</label>
                <input
                  type="text"
                  value={forgeName}
                  onChange={e => setForgeName(e.target.value)}
                  placeholder="e.g. HyperMind-7B"
                  className="w-full bg-surface-200 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-purple-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Merge Strategy</label>
                <select
                  value={mergeStrategy}
                  onChange={e => setMergeStrategy(e.target.value)}
                  className="w-full bg-surface-200 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-purple-500/50 text-sm"
                >
                  <option value="weighted_average">Weighted Average (SLERP)</option>
                  <option value="ties_merging">TIES Merging</option>
                  <option value="dare_ties">DARE-TIES</option>
                  <option value="linear">Linear Interpolation</option>
                  <option value="passthrough">Passthrough (Stack)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quantization</label>
                <select
                  value={quantization}
                  onChange={e => setQuantization(e.target.value)}
                  className="w-full bg-surface-200 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-purple-500/50 text-sm"
                >
                  <option value="Q4_K_M">Q4_K_M (Recommended)</option>
                  <option value="Q5_K_M">Q5_K_M (Better Quality)</option>
                  <option value="Q8_0">Q8_0 (High Quality)</option>
                  <option value="F16">F16 (Full Precision)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={startForge}
                  disabled={forging || selectedModels.length < 2}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    forging || selectedModels.length < 2
                      ? 'bg-surface-400 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600 forge-glow'
                  }`}
                >
                  <IconForge className="w-5 h-5" />
                  {forging ? 'Forging...' : `Forge ${selectedModels.length} Models`}
                </button>
              </div>
            </div>

            {/* Forge Progress */}
            {forging && (
              <div className="bg-surface-200 rounded-xl p-5 border border-purple-500/20">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-purple-400 font-medium">Forging in progress...</span>
                  <span className="text-slate-400 font-mono">{Math.round(forgeProgress)}%</span>
                </div>
                <div className="h-3 bg-surface-400 rounded-full overflow-hidden">
                  <div className="h-full progress-animated rounded-full transition-all duration-300" style={{ width: `${forgeProgress}%` }} />
                </div>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p>{forgeProgress < 20 ? 'Loading model weights...' : forgeProgress < 50 ? 'Merging attention layers...' : forgeProgress < 75 ? 'Applying merge strategy...' : forgeProgress < 95 ? 'Quantizing output...' : 'Finalizing...'}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Forged Models List */}
      {forgedModels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Your Forged Models</h3>
          <div className="space-y-4">
            {forgedModels.map(fm => (
              <div key={fm.id} className="glass rounded-2xl p-6 glass-hover transition-all">
                <div className="flex items-start gap-4">
                  <div className="relative group flex-shrink-0">
                    {fm.customIcon ? (
                      <img src={fm.customIcon} alt={fm.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/20" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border-2 border-purple-500/20">
                        <IconForge className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <IconImage className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleForgedIcon(fm, e.target.files[0])} />
                    </label>
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingForged === fm.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleRenameForged(fm)}
                          className="bg-surface-300 text-white px-3 py-1.5 rounded-lg text-sm border border-purple-500/30 outline-none"
                          autoFocus
                        />
                        <button onClick={() => handleRenameForged(fm)} className="text-purple-400 text-sm font-medium">Save</button>
                        <button onClick={() => setEditingForged(null)} className="text-slate-500 text-sm">Cancel</button>
                      </div>
                    ) : (
                      <h4 className="text-lg font-bold text-white">{fm.name}</h4>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Sources: {fm.sourceModelNames.join(' + ')}</p>
                    <p className="text-xs text-slate-500">Strategy: {fm.config.mergeStrategy} -- Quantization: {fm.config.quantization}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${fm.status === 'ready' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : fm.status === 'forging' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {fm.status === 'ready' ? 'Ready' : fm.status === 'forging' ? 'Forging...' : 'Error'}
                      </span>
                      <span className="text-xs text-slate-500">{fm.size}</span>
                      <span className="text-xs text-slate-500">{new Date(fm.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingForged(fm.id); setEditName(fm.name); }} className="p-2 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
                      <IconEdit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteForged(fm.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== DEVICE PAGE ========== */
function DevicePage({ deviceInfo }: { deviceInfo: DeviceInfo | null }) {
  if (!deviceInfo) return <div className="p-8 text-slate-500">Detecting device...</div>;

  const sections = [
    {
      title: 'Device',
      items: [
        { label: 'Type', value: deviceInfo.type, color: 'text-blue-400' },
        { label: 'Operating System', value: deviceInfo.os, color: 'text-white' },
        { label: 'Browser', value: deviceInfo.browser, color: 'text-white' },
        { label: 'Screen Resolution', value: deviceInfo.screenRes, color: 'text-white' },
        { label: 'Touch Support', value: deviceInfo.touchSupport ? 'Yes' : 'No', color: deviceInfo.touchSupport ? 'text-green-400' : 'text-slate-500' },
      ]
    },
    {
      title: 'Hardware',
      items: [
        { label: 'CPU Cores', value: `${deviceInfo.cores} cores`, color: 'text-cyan-400' },
        { label: 'System Memory', value: deviceInfo.memory ? `${deviceInfo.memory} GB` : 'Not reported', color: 'text-cyan-400' },
        { label: 'GPU', value: deviceInfo.gpu, color: 'text-white' },
        { label: 'Storage', value: deviceInfo.storageEstimate, color: 'text-white' },
      ]
    },
    {
      title: 'Runtime Environment',
      items: [
        { label: 'Electron.js', value: deviceInfo.isElectron ? 'Detected' : 'Not detected', color: deviceInfo.isElectron ? 'text-green-400' : 'text-slate-500' },
        { label: 'Capacitor', value: deviceInfo.isCapacitor ? 'Detected' : 'Not detected', color: deviceInfo.isCapacitor ? 'text-green-400' : 'text-slate-500' },
        { label: 'PWA Mode', value: deviceInfo.isPWA ? 'Active' : 'Browser', color: deviceInfo.isPWA ? 'text-green-400' : 'text-slate-500' },
        { label: 'Network', value: deviceInfo.isOnline ? 'Online' : 'Offline', color: deviceInfo.isOnline ? 'text-green-400' : 'text-orange-400' },
      ]
    },
  ];

  // Compute compatibility score
  const score = Math.min(100, Math.round(
    (deviceInfo.cores >= 4 ? 25 : deviceInfo.cores >= 2 ? 15 : 5) +
    (deviceInfo.memory >= 8 ? 25 : deviceInfo.memory >= 4 ? 15 : deviceInfo.memory > 0 ? 8 : 10) +
    (deviceInfo.gpu !== 'Unknown' && deviceInfo.gpu !== 'Not available' ? 25 : 10) +
    (deviceInfo.type === 'desktop' ? 25 : deviceInfo.type === 'tablet' ? 15 : 10)
  ));

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <IconCpu className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">System Information</h2>
      </div>

      {/* Compatibility Score */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">AI Inference Compatibility</h3>
            <p className="text-sm text-slate-400">Based on detected hardware capabilities</p>
          </div>
          <div className={`text-4xl font-bold ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {score}%
          </div>
        </div>
        <div className="h-3 bg-surface-300 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {score >= 70 ? 'Your device is well-suited for local AI model inference.' : score >= 40 ? 'Your device can run smaller quantized models. Consider Q4 quantization for best performance.' : 'Limited hardware detected. Cloud-based inference recommended for larger models.'}
        </p>
      </div>

      {sections.map(section => (
        <div key={section.title} className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white">{section.title}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`text-sm font-medium font-mono ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* User Agent */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-3">Raw User Agent</h3>
        <div className="bg-surface-200 rounded-xl p-4 overflow-x-auto">
          <code className="text-xs text-slate-400 font-mono break-all">{navigator.userAgent}</code>
        </div>
      </div>
    </div>
  );
}

/* ========== CHAT PAGE ========== */
function ChatPage({ models, forgedModels, activeModelId, onSelectModel }: {
  models: AIModel[];
  forgedModels: ForgedModel[];
  activeModelId: string | null;
  onSelectModel: (id: string | null) => void;
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);

  const allReady = [
    ...models.filter(m => m.downloaded).map(m => ({ id: m.id, name: m.name, icon: m.customIcon || m.logoUrl, type: 'base' as const })),
    ...forgedModels.filter(f => f.status === 'ready').map(f => ({ id: f.id, name: f.name, icon: f.customIcon || '', type: 'forged' as const })),
  ];

  const activeModel = allReady.find(m => m.id === activeModelId);

  const generateResponse = (userMsg: string): string => {
    const responses = [
      `I've analyzed your input: "${userMsg.slice(0, 50)}${userMsg.length > 50 ? '...' : ''}"\n\nBased on my training data and inference capabilities, here's my response:\n\nThis is a demonstration of local AI model inference running directly on your device. In a production environment with actual model weights loaded, I would process your query through transformer attention layers, generating tokens auto-regressively.\n\nKey technical details:\n- Running in offline-capable mode\n- Using quantized weights for efficient inference\n- Processing through local WebGPU/WASM runtime`,
      `Processing your request through the neural network...\n\nYour query touches on interesting aspects. Let me break this down:\n\n1. The input has been tokenized and embedded\n2. Multi-head attention mechanisms are analyzing context\n3. Feed-forward layers are generating the response\n\nIn a fully deployed version, this would leverage WebGPU for hardware-accelerated inference, achieving near-native performance on supported browsers and Electron/Capacitor runtimes.`,
      `Inference complete.\n\nRegarding "${userMsg.slice(0, 40)}${userMsg.length > 40 ? '...' : ''}":\n\nThis response is generated locally to demonstrate the chat interface. With actual GGUF model weights loaded via WebAssembly (similar to llama.cpp), this would provide real AI-generated responses.\n\nThe architecture supports:\n- Streaming token generation\n- Context window management\n- KV-cache optimization\n- Batched inference for throughput`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || generating) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setGenerating(true);

    // Simulate streaming
    const response = generateResponse(userMsg);
    let current = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    for (let i = 0; i < response.length; i++) {
      await new Promise(r => setTimeout(r, 8 + Math.random() * 12));
      current += response[i];
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: current };
        return next;
      });
    }
    setGenerating(false);
  };

  if (allReady.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div>
          <IconModels className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold text-white mb-2">No Models Available</h3>
          <p className="text-slate-400 max-w-md">Download or forge a model first to start chatting. Go to the Model Hub to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Model selector */}
      <div className="px-4 lg:px-8 py-3 border-b border-white/5 bg-surface-100/50">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {allReady.map(m => (
            <button
              key={m.id}
              onClick={() => { onSelectModel(m.id); setMessages([]); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeModelId === m.id ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-surface-300 text-slate-400 hover:text-white border border-white/5'}`}
            >
              {m.icon ? (
                <img src={m.icon} alt="" className="w-5 h-5 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <IconForge className="w-4 h-4" />
              )}
              {m.name}
              {m.type === 'forged' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">FORGED</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 lg:px-8 py-6 space-y-6">
        {!activeModel ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <IconPlay className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-slate-400">Select a model above to start chatting</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                {activeModel.icon ? (
                  <img src={activeModel.icon} alt="" className="w-10 h-10 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <IconForge className="w-8 h-8 text-purple-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{activeModel.name}</h3>
              <p className="text-slate-400 text-sm">Model loaded. Type a message to begin.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-500/10 text-white border border-blue-500/20'
                  : 'glass border border-white/5 text-slate-300'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                    {activeModel.icon ? (
                      <img src={activeModel.icon} alt="" className="w-4 h-4 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <IconForge className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="text-xs font-medium text-slate-500">{activeModel.name}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}{generating && i === messages.length - 1 && msg.role === 'assistant' ? '\u2588' : ''}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      {activeModel && (
        <div className="px-4 lg:px-8 py-4 border-t border-white/5 bg-surface-100/50">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message ${activeModel.name}...`}
                rows={1}
                className="w-full bg-surface-200 text-white px-4 py-3 pr-12 rounded-xl border border-white/10 outline-none focus:border-blue-500/50 resize-none text-sm"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || generating}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${input.trim() && !generating ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-surface-400 text-slate-600 cursor-not-allowed'}`}
            >
              {generating ? <IconStop className="w-5 h-5" /> : <IconSend className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
