export type CurrencyType = 'coins' | 'cash' | 'gems' | 'stones' | 'cells' | 'medals' | 'shards';

interface CurrencyConfig {
  name: string;
  symbol?: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  imageSrc: string;
  webpSrc: string;
  svgSrc?: string;
}

export const CURRENCY_CONFIG: Record<CurrencyType, CurrencyConfig> = {
  coins: {
    name: 'Coins',
    symbol: '🪙',
    color: '#eab308',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-950/20',
    imageSrc: '/assets/currencies/coins.png',
    webpSrc: '/assets/currencies/coins.webp',
    svgSrc: '/assets/currencies/coins.svg',
  },
  cash: {
    name: 'Cash',
    symbol: '$',
    color: '#22c55e',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-950/20',
    imageSrc: '/assets/currencies/cash.png',
    webpSrc: '/assets/currencies/cash.webp',
    svgSrc: '/assets/currencies/cash.svg',
  },
  gems: {
    name: 'Gems',
    symbol: '💎',
    color: '#10b981',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-950/20',
    imageSrc: '/assets/currencies/gems.png',
    webpSrc: '/assets/currencies/gems.webp',
    svgSrc: '/assets/currencies/gems.svg',
  },
  stones: {
    name: 'Power Stones',
    symbol: '💠',
    color: '#14b8a6',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-950/20',
    imageSrc: '/assets/currencies/stones.png',
    webpSrc: '/assets/currencies/stones.webp',
    svgSrc: '/assets/currencies/stones.svg',
  },
  cells: {
    name: 'Elite Cells',
    symbol: '▲',
    color: '#f59e0b',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-950/20',
    imageSrc: '/assets/currencies/cells.png',
    webpSrc: '/assets/currencies/cells.webp',
    svgSrc: '/assets/currencies/cells.svg',
  },
  medals: {
    name: 'Medals',
    symbol: '🎖️',
    color: '#f43f5e',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-950/20',
    imageSrc: '/assets/currencies/medals.png',
    webpSrc: '/assets/currencies/medals.webp',
  },
  shards: {
    name: 'Reroll Shards',
    symbol: '🎲',
    color: '#a855f7',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-950/20',
    imageSrc: '/assets/currencies/shards.png',
    webpSrc: '/assets/currencies/shards.webp',
  },
};

export interface CurrencyIconProps {
  currency: CurrencyType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  title?: string;
  glow?: boolean;
}

const SIZE_MAP = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

export function CurrencyIcon({
  currency,
  size = 'md',
  className = '',
  title,
  glow = false,
}: CurrencyIconProps) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.coins;

  const sizeClass = typeof size === 'number' 
    ? '' 
    : SIZE_MAP[size] || SIZE_MAP.md;

  const inlineStyle = typeof size === 'number' 
    ? { width: `${size}px`, height: `${size}px` } 
    : undefined;

  return (
    <picture className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <source srcSet={config.webpSrc} type="image/webp" />
      <img
        src={config.imageSrc}
        alt={config.name}
        title={title || config.name}
        style={inlineStyle}
        className={`object-contain inline-block transition-transform filter drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.45)] dark:drop-shadow-none contrast-[1.1] ${sizeClass} ${
          glow ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : ''
        }`}
        loading="lazy"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.currentTarget;
          if (config.svgSrc && target.src !== config.svgSrc) {
            target.src = config.svgSrc;
          }
        }}
      />
    </picture>
  );
}

/**
 * A handy badge that renders the currency icon + value together
 */
export function CurrencyBadge({
  currency,
  value,
  formattedValue,
  size = 'sm',
  className = '',
}: {
  currency: CurrencyType;
  value?: number | string;
  formattedValue?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.coins;
  const displayVal = formattedValue !== undefined ? formattedValue : value;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono font-medium border ${config.bgColor} ${config.borderColor} ${config.textColor} ${className}`}
      title={config.name}
    >
      <CurrencyIcon currency={currency} size={size} />
      <span>{displayVal}</span>
    </span>
  );
}
