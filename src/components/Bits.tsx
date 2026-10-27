import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme';
import { BackIcon, CloseIcon } from './Icons';
import { Txt } from './Txt';

export function Bar({ pct, color, track, height }: { pct: number; color: string; track: string; height: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, pct))}%`,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

// iOS는 한쪽 테두리만 점선으로 그리지 못해서, 전체 점선 테두리의 윗변만 잘라 보여 준다
export function DashedLine({ color = colors.borderStrong }: { color?: string }) {
  return (
    <View style={{ height: 1, overflow: 'hidden' }}>
      <View style={{ height: 3, borderWidth: 1, borderColor: color, borderStyle: 'dashed' }} />
    </View>
  );
}

export function IconButton({
  label,
  onPress,
  kind = 'back',
}: {
  label: string;
  onPress: () => void;
  kind?: 'back' | 'close';
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconBtn}>
      {kind === 'back' ? <BackIcon /> : <CloseIcon />}
    </Pressable>
  );
}

export function Chip({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Txt size={12} weight={600} color={fg}>
        {label}
      </Txt>
    </View>
  );
}

export function Btn({
  label,
  onPress,
  primary,
  accent = colors.accent,
  height = 58,
  size = 16,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  accent?: string;
  height?: number;
  size?: number;
  icon?: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { height },
        primary ? { backgroundColor: accent } : styles.btnGhost,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon}
      <Txt size={size} weight={600} color={primary ? colors.white : colors.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  btn: {
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  btnGhost: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
