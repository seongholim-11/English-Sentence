import { colors } from '../theme';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Props = { size?: number; color?: string; strokeWidth?: number };

const base = (size: number, color: string, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const FlameIcon = ({ size = 16, color = '#E8752A', strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 0 2 1 3.2 2.5 3.2 0-3.2-1-5.2 0-8.2z" />
  </Svg>
);

export const ArrowRightIcon = ({ size = 18, color = '#FFFFFF', strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const BackIcon = ({ size = 20, color = colors.ink, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const CloseIcon = ({ size = 18, color = colors.ink, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const TapIcon = ({ size = 16, color = colors.muted, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M9 11V5a2 2 0 0 1 4 0v6M13 10a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7H9a5 5 0 0 1-4-2l-1.5-2.5a1.6 1.6 0 0 1 2.7-1.7L9 14" />
  </Svg>
);

export const AgainIcon = ({ size = 18, color = colors.ink, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 12a9 9 0 1 0 3-6.7" />
    <Path d="M3 4v5h5" />
  </Svg>
);

export const CheckIcon = ({ size = 18, color = '#FFFFFF', strokeWidth = 2.2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M5 12l5 5 9-10" />
  </Svg>
);

export const SpeakerIcon = ({ size = 16, color = colors.muted, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M11 5L6 9H3v6h3l5 4z" />
    <Path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </Svg>
);

export const HomeIcon = ({ size = 22, color = colors.ink, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  </Svg>
);

export const DecksIcon = ({ size = 22, color = colors.navMuted, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Rect x="4" y="7" width="13" height="13" rx="3" />
    <Path d="M8 3h9a3 3 0 0 1 3 3v9" />
  </Svg>
);

export const StatsIcon = ({ size = 22, color = colors.navMuted, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M5 20V11M12 20V5M19 20v-6" />
  </Svg>
);

export const SettingsIcon = ({ size = 22, color = colors.navMuted, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <Circle cx="16" cy="7" r="2" />
    <Circle cx="10" cy="17" r="2" />
  </Svg>
);

export const StarIcon = ({ size = 18, color = colors.muted, strokeWidth = 2, filled = false }: Props & { filled?: boolean }) => (
  <Svg {...base(size, color, strokeWidth)} fill={filled ? color : 'none'}>
    <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z" />
  </Svg>
);

export const SearchIcon = ({ size = 18, color = colors.muted, strokeWidth = 2 }: Props) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx="11" cy="11" r="6.5" />
    <Path d="M16 16l4.5 4.5" />
  </Svg>
);
