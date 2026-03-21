// Simple JSON file-based DB for development (MongoDB swap in Phase 5)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

interface StoredSession {
  id: string;
  modelId: string;
  modelName: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
  settings: Record<string, unknown>;
  isForgedModel: boolean;
}

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  generationTime?: number;
  model?: string;
  error?: boolean;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSessions(): StoredSession[] {
  ensureDir();
  if (!fs.existsSync(SESSIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSessions(sessions: StoredSession[]) {
  ensureDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export const sessionStore = {
  getAll(): StoredSession[] {
    return readSessions().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getById(id: string): StoredSession | undefined {
    return readSessions().find((s) => s.id === id);
  },

  create(session: StoredSession): StoredSession {
    const sessions = readSessions();
    sessions.push(session);
    writeSessions(sessions);
    return session;
  },

  update(id: string, patch: Partial<StoredSession>): StoredSession | undefined {
    const sessions = readSessions();
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    sessions[idx] = { ...sessions[idx], ...patch, updatedAt: new Date().toISOString() };
    writeSessions(sessions);
    return sessions[idx];
  },

  addMessage(sessionId: string, message: StoredMessage): StoredMessage | undefined {
    const sessions = readSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return undefined;
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    if (session.messages.filter((m) => m.role === 'user').length === 1 && message.role === 'user') {
      session.title = message.content.slice(0, 80) + (message.content.length > 80 ? '...' : '');
    }
    writeSessions(sessions);
    return message;
  },

  delete(id: string): boolean {
    const sessions = readSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === sessions.length) return false;
    writeSessions(filtered);
    return true;
  },

  deleteAll(): void {
    writeSessions([]);
  },
};