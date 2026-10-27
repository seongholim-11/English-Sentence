import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, createStyles } from '../theme';
import { DecksIcon, HomeIcon, SettingsIcon, StatsIcon } from './Icons';
import { Txt } from './Txt';

export type Tab = 'home' | 'decks' | 'stats' | 'settings';

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: 'home', label: '홈', Icon: HomeIcon },
  { id: 'decks', label: '덱', Icon: DecksIcon },
  { id: 'stats', label: '기록', Icon: StatsIcon },
  { id: 'settings', label: '설정', Icon: SettingsIcon },
];

export function BottomNav({ active, onNavigate }: { active: Tab; onNavigate: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {TABS.map(({ id, label, Icon }) => {
        const on = id === active;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => !on && onNavigate(id)}
            style={styles.tab}
          >
            <Icon color={on ? colors.ink : colors.navMuted} />
            <Txt size={11} weight={on ? 600 : 500} color={on ? colors.ink : colors.navMuted}>
              {label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = createStyles(() => ({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { width: 72, height: 52, alignItems: 'center', justifyContent: 'center', gap: 3 },
}));
