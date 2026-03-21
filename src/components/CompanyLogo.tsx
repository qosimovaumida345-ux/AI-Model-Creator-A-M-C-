import { useState } from 'react';
import { COMPANY_LOGOS } from '../data/aiModels';

interface Props {
  company: string;
  size?: number;
  className?: string;
}

export default function CompanyLogo({ company, size = 40, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const url = COMPANY_LOGOS[company];

  if (!url || failed) {
    // Fallback: generate colored initials
    const initials = company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = [
      '#10a37f', '#d4a574', '#4285f4', '#0668E1', '#f97316',
      '#76b900', '#4f6bed', '#9333ea', '#ef4444', '#ec4899',
      '#0f62fe', '#ff9900', '#00a1e0', '#ff3621', '#8b5cf6'
    ];
    const colorIndex = company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

    return (
      <div
        className={`flex items-center justify-center rounded-xl font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: colors[colorIndex],
          fontSize: size * 0.35,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={company}
      className={`rounded-xl object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
