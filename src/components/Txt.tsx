import { Children, ReactNode } from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { colors } from '../theme';

export type Weight = 400 | 500 | 600 | 700;

const latin: Record<Weight, string> = {
  400: 'SpaceGrotesk_400Regular',
  500: 'SpaceGrotesk_500Medium',
  600: 'SpaceGrotesk_600SemiBold',
  700: 'SpaceGrotesk_700Bold',
};

const korean: Record<Weight, string> = {
  400: 'IBMPlexSansKR_400Regular',
  500: 'IBMPlexSansKR_500Medium',
  600: 'IBMPlexSansKR_600SemiBold',
  700: 'IBMPlexSansKR_700Bold',
};

const HANGUL = /[ㄱ-ㆎ가-힣]/;

const textOf = (children: ReactNode): string =>
  Children.toArray(children)
    .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
    .join('');

type Props = TextProps & {
  size?: number;
  weight?: Weight;
  color?: string;
  lineHeight?: number;
  tabular?: boolean;
  style?: TextStyle | TextStyle[];
};

// 디자인의 font-family: 'Space Grotesk', 'IBM Plex Sans KR'.
// React Native에는 글꼴 폴백 체인이 없어서, 한글이 들어간 문자열은 IBM Plex Sans KR로 그린다.
export function Txt({ size = 14, weight = 400, color = colors.ink, lineHeight, tabular, style, children, ...rest }: Props) {
  const family = HANGUL.test(textOf(children)) ? korean[weight] : latin[weight];
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: family, fontSize: size, color },
        lineHeight ? { lineHeight: size * lineHeight } : null,
        tabular ? styles.tabular : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
});
