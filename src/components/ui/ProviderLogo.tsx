import { cn } from '@/utils/cn';

const PROVIDER_CONFIGS: Record<string, { color: string; bg: string; paths?: string }> = {
  'OpenAI': { color: '#10A37F', bg: '#10A37F15' },
  'Anthropic': { color: '#D4A574', bg: '#D4A57415' },
  'Google': { color: '#4285F4', bg: '#4285F415' },
  'Google DeepMind': { color: '#4285F4', bg: '#4285F415' },
  'Meta': { color: '#0668E1', bg: '#0668E115' },
  'Mistral AI': { color: '#FF7000', bg: '#FF700015' },
  'Microsoft': { color: '#00A4EF', bg: '#00A4EF15' },
  'xAI': { color: '#FFFFFF', bg: '#FFFFFF10' },
  'Alibaba': { color: '#FF6A00', bg: '#FF6A0015' },
  'DeepSeek': { color: '#4D6BFE', bg: '#4D6BFE15' },
  '01.AI': { color: '#00DC82', bg: '#00DC8215' },
  'Cohere': { color: '#39594D', bg: '#39594D25' },
  'AI21 Labs': { color: '#9B5DE5', bg: '#9B5DE515' },
  'TII': { color: '#C4A35A', bg: '#C4A35A15' },
  'Stability AI': { color: '#A855F7', bg: '#A855F715' },
  'Black Forest Labs': { color: '#FFFFFF', bg: '#FFFFFF10' },
  'Runway': { color: '#00D4FF', bg: '#00D4FF15' },
  'Pika Labs': { color: '#FF6B9D', bg: '#FF6B9D15' },
  'ElevenLabs': { color: '#FFFFFF', bg: '#FFFFFF10' },
  'AssemblyAI': { color: '#0055FF', bg: '#0055FF15' },
  'NVIDIA': { color: '#76B900', bg: '#76B90015' },
  'Samsung': { color: '#1428A0', bg: '#1428A015' },
  'Apple': { color: '#FFFFFF', bg: '#FFFFFF10' },
  'Salesforce': { color: '#00A1E0', bg: '#00A1E015' },
  'HuggingFace': { color: '#FFD21E', bg: '#FFD21E15' },
  'BigCode': { color: '#FFD21E', bg: '#FFD21E15' },
  'NousResearch': { color: '#FF4444', bg: '#FF444415' },
  'Cognitive Computations': { color: '#06B6D4', bg: '#06B6D415' },
  'Community': { color: '#8B5CF6', bg: '#8B5CF615' },
};

interface ProviderLogoProps {
  provider: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProviderLogo({ provider, size = 'md', className }: ProviderLogoProps) {
  const config = PROVIDER_CONFIGS[provider] || { color: '#00D4FF', bg: '#00D4FF15' };
  const initials = provider
    .split(/[\s.]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
  };

  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center font-bold shrink-0',
        'border border-white/[0.08]',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        boxShadow: `0 0 12px ${config.color}15`,
      }}
      title={provider}
    >
      {renderProviderSVG(provider, config.color) || initials}
    </div>
  );
}

function renderProviderSVG(provider: string, color: string): React.ReactNode {
  switch (provider) {
    case 'OpenAI':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={color}>
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      );
    case 'Google':
    case 'Google DeepMind':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case 'Meta':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={color}>
          <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 0 0 1.227 2.31c.586.592 1.33.89 2.228.89.637 0 1.222-.178 1.775-.534.553-.356 1.109-.83 1.676-1.436.567-.607 1.163-1.347 1.79-2.22.142-.197.295-.413.46-.65l1.087 1.747c.706 1.122 1.37 1.973 1.995 2.554.625.58 1.316.87 2.075.87.894 0 1.632-.3 2.218-.894a4.932 4.932 0 0 0 1.227-2.312c.14-.605.21-1.268.21-1.974 0-2.566-.704-5.24-2.044-7.306C15.598 5.31 13.883 4.03 11.915 4.03c-.946 0-1.822.356-2.612 1.064l-.003.002C8.718 5.559 8.2 6.2 7.726 6.958 7.26 6.2 6.737 5.559 6.158 5.096 5.384 4.39 4.508 4.03 3.562 4.03h3.353zm0 0" />
        </svg>
      );
    case 'Microsoft':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
          <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
        </svg>
      );
    case 'NVIDIA':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={color}>
          <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.417 3.396 6.417 3.396s-2.75 3.87-5.685 3.87a3.39 3.39 0 0 1-1.156-.196v-4.31c1.528.195 1.836.958 2.747 2.615l2.038-1.712s-1.654-2.36-3.873-2.36c-.31 0-.606.037-.912.145zm0-5.053V5.87c-.152.007-.304.019-.456.034C4.36 6.269 1.8 9.752 1.8 9.752s3.276 4.544 7.102 4.544c.148 0 .293-.01.438-.025v-1.665a3.39 3.39 0 0 1-.438.03c-2.344 0-4.093-2.204-4.093-2.204s1.46-2.093 3.646-2.295c.152-.015.328-.023.493-.023v-.037c-.155 0-.314.009-.462.026V5.867c.158-.011.31-.019.462-.022v-2.1zm0 10.463v1.548c-4.522-.402-7.148-4.664-7.148-4.664s2.033-2.727 4.612-3.235v1.617c-1.296.442-2.236 1.607-2.236 1.607s1.37 2.327 4.006 2.756c.244.04.501.064.766.071zm3.2-5.456s-2.75 3.87-5.685 3.87" />
        </svg>
      );
    default:
      return null;
  }
}