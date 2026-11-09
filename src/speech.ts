import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// iPhone은 무음 스위치가 켜져 있으면 기본 오디오 세션에서 발음이 나지 않는다.
// 재생 세션으로 바꿔 무음 모드에서도 들리게 한다 (한 번만 설정).
let audioReady: Promise<void> | null = null;
const prepareAudio = () => {
  if (Platform.OS !== 'ios') return Promise.resolve();
  audioReady ??= setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  return audioReady;
};

// 오디오 준비를 기다리는 사이 stop·새 호출이 오면 이전 요청은 재생하지 않는다
let latest = 0;

export function speak(text: string, rate: number) {
  const id = ++latest;
  Speech.stop();
  prepareAudio().then(() => {
    if (id === latest) Speech.speak(text, { language: 'en-US', rate });
  });
}

export function stopSpeech() {
  latest++;
  Speech.stop();
}
