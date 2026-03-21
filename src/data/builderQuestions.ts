export interface QuestionOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface BuilderQuestion {
  id: string;
  title: string;
  subtitle: string;
  multi?: boolean;
  options: QuestionOption[];
}

export const BUILDER_QUESTIONS: BuilderQuestion[] = [
  {
    id: 'purpose',
    title: "What is your AI's purpose?",
    subtitle: 'Choose the primary mission for your model',
    options: [
      { id: 'general', label: 'General Assistant', icon: '🌐', description: 'Jack of all trades AI' },
      { id: 'creative', label: 'Creative Engine', icon: '🎨', description: 'Art, writing, music' },
      { id: 'coding', label: 'Code Wizard', icon: '💻', description: 'Programming & debugging' },
      { id: 'research', label: 'Research Brain', icon: '🔬', description: 'Analysis & discovery' },
      { id: 'business', label: 'Business Pro', icon: '💼', description: 'Enterprise solutions' },
      { id: 'education', label: 'Teacher AI', icon: '📚', description: 'Learning & tutoring' },
    ]
  },
  {
    id: 'personality',
    title: "Choose your AI's personality",
    subtitle: 'How should your model interact with users?',
    options: [
      { id: 'professional', label: 'Professional', icon: '👔', description: 'Formal and precise' },
      { id: 'friendly', label: 'Friendly', icon: '😊', description: 'Warm and approachable' },
      { id: 'witty', label: 'Witty', icon: '😏', description: 'Clever and humorous' },
      { id: 'mentor', label: 'Mentor', icon: '🧙', description: 'Wise and guiding' },
      { id: 'creative_p', label: 'Creative', icon: '✨', description: 'Imaginative and bold' },
      { id: 'analytical', label: 'Analytical', icon: '🔍', description: 'Data-driven and logical' },
    ]
  },
  {
    id: 'intelligence',
    title: 'Set intelligence level',
    subtitle: 'How powerful should the brain be?',
    options: [
      { id: 'genius', label: 'Genius (10T)', icon: '🧠', description: '10 trillion parameters' },
      { id: 'expert', label: 'Expert (1T)', icon: '🎓', description: '1 trillion parameters' },
      { id: 'advanced', label: 'Advanced (200B)', icon: '🚀', description: '200 billion parameters' },
      { id: 'standard', label: 'Standard (70B)', icon: '💡', description: '70 billion parameters' },
      { id: 'efficient', label: 'Efficient (13B)', icon: '⚡', description: '13 billion parameters' },
      { id: 'lightweight', label: 'Light (7B)', icon: '🪶', description: '7 billion parameters' },
    ]
  },
  {
    id: 'modality',
    title: 'Select modalities',
    subtitle: 'What types of content can it handle?',
    options: [
      { id: 'text', label: 'Text Only', icon: '📝', description: 'Pure language model' },
      { id: 'multimodal', label: 'Multimodal', icon: '🌐', description: 'Text + images + audio' },
      { id: 'vision', label: 'Vision', icon: '👁️', description: 'Image understanding' },
      { id: 'audio', label: 'Audio', icon: '🎵', description: 'Speech & sound' },
      { id: 'code', label: 'Code', icon: '💻', description: 'Programming focused' },
      { id: 'creative_gen', label: 'Creative Gen', icon: '🎨', description: 'Generate art & media' },
    ]
  },
  {
    id: 'permissions',
    title: 'Set AI Permissions & Safety',
    subtitle: 'Control what your AI can and cannot do',
    multi: true,
    options: [
      { id: 'internet', label: 'Internet Access', icon: '🌐', description: 'Can browse & search web' },
      { id: 'files', label: 'File System', icon: '📁', description: 'Read/write local files' },
      { id: 'camera', label: 'Camera Access', icon: '📸', description: 'Use device camera' },
      { id: 'microphone', label: 'Microphone', icon: '🎤', description: 'Listen & transcribe' },
      { id: 'location', label: 'Location', icon: '📍', description: 'Access GPS location' },
      { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Send push alerts' },
      { id: 'contacts', label: 'Contacts', icon: '👥', description: 'Access contact list' },
      { id: 'execute', label: 'Run Code', icon: '⚙️', description: 'Execute scripts locally' },
    ]
  },
  {
    id: 'superpower',
    title: 'Give it a superpower!',
    subtitle: 'One special ability to stand out',
    options: [
      { id: 'reasoning', label: 'Deep Reasoning', icon: '🔮', description: 'Chain-of-thought mastery' },
      { id: 'realtime', label: 'Real-time', icon: '⚡', description: 'Instant responses' },
      { id: 'memory', label: 'Perfect Memory', icon: '🧠', description: 'Never forgets context' },
      { id: 'speed', label: 'Ultra Speed', icon: '🏎️', description: 'Fastest inference ever' },
      { id: 'safety', label: 'Ultra Safe', icon: '🛡️', description: 'Maximum alignment' },
      { id: 'multilingual', label: 'Polyglot', icon: '🌍', description: '200+ languages' },
    ]
  },
  {
    id: 'style',
    title: "Name your AI's style",
    subtitle: 'Choose the naming convention',
    options: [
      { id: 'mythical', label: 'Mythical', icon: '🐉', description: 'Phoenix, Hydra, Titan' },
      { id: 'cosmic', label: 'Cosmic', icon: '🌌', description: 'Nova, Nebula, Quasar' },
      { id: 'tech', label: 'Tech', icon: '🔧', description: 'Nexus, Cipher, Cortex' },
      { id: 'nature', label: 'Nature', icon: '🌿', description: 'Aurora, Sage, Storm' },
      { id: 'abstract', label: 'Abstract', icon: '🔷', description: 'Zenith, Echo, Prism' },
      { id: 'elemental', label: 'Elemental', icon: '🔥', description: 'Blaze, Frost, Thunder' },
    ]
  }
];

export interface SavedModel {
  id: string;
  name: string;
  version: string;
  sourceModels: string[];
  answers: Record<string, string>;
  permissions: string[];
  createdAt: number;
  installed: boolean;
  installProgress: number;
  size: number;
  deviceFormat: string;
}
