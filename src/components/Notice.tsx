import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, createStyles } from '../theme';
import { Btn } from './Bits';
import { Txt } from './Txt';

// 저장된 진도를 읽지 못했을 때: 빈 상태로 시작해 기록을 덮어쓰지 않도록 다시 시도만 받는다
export function LoadErrorScreen({ onRetry }: { onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.full, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) }]}>
      <Txt size={22} weight={700} style={{ textAlign: 'center' }}>
        학습 기록을 불러오지 못했어요
      </Txt>
      <Txt size={15} color={colors.muted} lineHeight={1.5} style={{ textAlign: 'center' }}>
        저장된 기록은 그대로 있어요. 잠시 뒤 다시 시도해 주세요. 계속 안 되면 기기 저장 공간이 부족하지 않은지 확인해 주세요.
      </Txt>
      <Btn label="다시 시도" primary onPress={onRetry} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}

// 진도를 저장하지 못했을 때 화면 아래에 띄운다
export function SaveErrorBanner({ onRetry }: { onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.banner, { bottom: Math.max(insets.bottom, 12) + 72 }]} accessibilityLiveRegion="polite">
      <Txt size={13} weight={500} color="#FFFFFF" style={{ flex: 1 }}>
        학습 기록을 저장하지 못했어요. 앱을 닫으면 사라질 수 있어요.
      </Txt>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
        <Txt size={13} weight={700} color={colors.bad}>
          다시 저장
        </Txt>
      </Pressable>
    </View>
  );
}

// 저장된 기록이 깨져서 읽지 못해 새로 시작했을 때 알린다
export function ResetNoticeBanner({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.banner, { bottom: Math.max(insets.bottom, 12) + 72, backgroundColor: colors.accent }]} accessibilityLiveRegion="polite">
      <Txt size={13} weight={500} color="#FFFFFF" style={{ flex: 1 }}>
        저장된 학습 기록을 읽지 못해 새로 시작했어요. 원래 기록은 기기에 따로 보관해 두었어요.
      </Txt>
      <Pressable accessibilityRole="button" onPress={onClose} style={[styles.retry, { backgroundColor: '#FFFFFF' }]}>
        <Txt size={13} weight={700} color={colors.accent}>
          확인
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = createStyles(() => ({
  full: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 28 },
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bad,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  retry: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
}));
