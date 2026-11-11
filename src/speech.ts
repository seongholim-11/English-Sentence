import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { audioFiles } from './audio/manifest';

// iPhone은 무음 스위치가 켜져 있으면 기본 오디오 세션에서 발음이 나지 않는다.
// 재생 세션으로 바꿔 무음 모드에서도 들리게 한다 (한 번만 설정).
let audioReady: Promise<void> | null = null;
const prepareAudio = () => {
  if (Platform.OS !== 'ios') return Promise.resolve();
  audioReady ??= setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  return audioReady;
};

// 설정의 발음 속도(기기 내장 음성 기준 0.7 / 0.9 / 1.1)를 미리 만든 음성의 재생 속도로 바꾼다.
// 보통(0.9)이 녹음된 속도 그대로가 되고, 음높이는 유지한다.
const NORMAL_RATE = 0.9;

let player: AudioPlayer | null = null;

function playFile(source: number, rate: number) {
  if (!player) player = createAudioPlayer(source);
  else player.replace(source);
  player.setPlaybackRate(rate / NORMAL_RATE, 'high');
  player.play();
}

function stopFile() {
  try {
    player?.pause();
  } catch {
    // 이미 해제됐으면 무시
  }
}

// 오디오 준비를 기다리는 사이 stop·새 호출이 오면 이전 요청은 재생하지 않는다
let latest = 0;

// 미리 만든 음성이 있으면 그것을, 없거나 재생에 실패하면 기기 내장 음성으로 읽는다
export function speak(text: string, rate: number) {
  const id = ++latest;
  Speech.stop();
  stopFile();
  prepareAudio().then(() => {
    if (id !== latest) return;
    const file = audioFiles[text];
    if (file != null) {
      try {
        playFile(file, rate);
        return;
      } catch {
        // 아래에서 내장 음성으로 대신한다
      }
    }
    Speech.speak(text, { language: 'en-US', rate });
  });
}

export function stopSpeech() {
  latest++;
  Speech.stop();
  stopFile();
}
