import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export type Mode = 'light' | 'dark';

const light = {
  bg: '#F3F3EF',
  ink: '#15171C',
  white: '#FFFFFF',
  muted: '#5D616B',
  navMuted: '#6B6F78',
  border: '#E4E4DE',
  borderStrong: '#D9DAD4',
  track: '#EDEDE8',
  segment: '#E8E8E3',
  exampleBg: '#F6F6F2',
  hiddenBg: '#EFEFEA',
  hiddenBorder: '#CFD0CA',
  accent: '#2F5BFF',
  accentSoft: '#9DB2FF',
  accentTint: '#E7ECFF',
  streak: '#E8752A',
  heroBg: '#15171C',
  onHero: '#FFFFFF',
  heroSub: '#B9BCC4',
  heroFaint: '#8E929B',
  onDarkHint: '#C9CCD3',
  good: '#1A9E7A',
  goodSoft: '#DDF3EC',
  bad: '#D4452F',
  badSoft: '#FBE4DF',
};

export type Palette = typeof light;

// 어두운 테마에서도 ink(글자·진한 면)와 white(카드 면)가 서로 짝을 이루도록 뒤집어 둔다
const dark: Palette = {
  bg: '#101216',
  ink: '#F2F2EE',
  white: '#1B1E24',
  muted: '#A3A7B0',
  navMuted: '#8A8E97',
  border: '#2A2E36',
  borderStrong: '#3A3F49',
  track: '#2A2E36',
  segment: '#2A2E36',
  exampleBg: '#22262D',
  hiddenBg: '#22262D',
  hiddenBorder: '#3A3F49',
  accent: '#5B7DFF',
  accentSoft: '#3A4B8C',
  accentTint: '#222B52',
  streak: '#F08A45',
  heroBg: '#2A2F3A',
  onHero: '#FFFFFF',
  heroSub: '#B9BCC4',
  heroFaint: '#8E929B',
  onDarkHint: '#C9CCD3',
  good: '#2DB892',
  goodSoft: '#17342C',
  bad: '#F0654F',
  badSoft: '#3A1E19',
};

// 지금 적용된 색. applyTheme이 값을 바꾸고, 화면은 렌더할 때마다 읽는다
export const colors: Palette & { mode: Mode } = { ...light, mode: 'light' };

// 글자 크기 배율
export const fontScale = { value: 1 };

export function applyTheme(mode: Mode, scale: number) {
  Object.assign(colors, mode === 'dark' ? dark : light, { mode });
  fontScale.value = scale;
}

type Style = ViewStyle | TextStyle | ImageStyle;

// 테마가 바뀌어도 스타일이 새 색으로 다시 만들어지도록, 접근할 때마다 현재 테마의 스타일을 돌려준다
export function createStyles<T extends Record<string, Style>>(factory: () => T): T {
  const cache: Record<string, T> = {};
  return new Proxy({} as T, {
    get(_, prop) {
      const s = (cache[`${colors.mode}-${fontScale.value}`] ??= StyleSheet.create(factory()));
      return s[prop as keyof T];
    },
  });
}

export const DAILY_GOAL = 30;
