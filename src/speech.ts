import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { VoiceSlot, audioFiles } from './audio/manifest';

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
// 지금 재생 중인 음성 파일이 끝까지 재생되면 부를 함수
let onFileDone: (() => void) | null = null;
// 음성 파일을 불러오거나 재생하다 실패했을 때 (비동기로 알려 온다) 부를 함수
let onFileError: (() => void) | null = null;

function playFile(source: number, rate: number) {
  if (!player) {
    player = createAudioPlayer(source);
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.error) {
        const fail = onFileError;
        onFileDone = null;
        onFileError = null;
        fail?.();
        return;
      }
      // 웹은 끝 지점에서 didJustFinish가 빠질 수 있어, 끝까지 재생하고 멈춘 상태도 끝으로 본다
      const atEnd = !status.playing && status.duration > 0 && status.currentTime >= status.duration - 0.05;
      if (status.didJustFinish || atEnd) {
        const done = onFileDone;
        onFileDone = null;
        onFileError = null;
        done?.();
      }
    });
  } else player.replace(source);
  player.setPlaybackRate(rate / NORMAL_RATE, 'high');
  player.play();
}

function stopFile() {
  onFileDone = null;
  onFileError = null;
  try {
    player?.pause();
  } catch {
    // 이미 해제됐으면 무시
  }
}

// 오디오 준비를 기다리는 사이 stop·새 호출이 오면 이전 요청은 재생하지 않는다
let latest = 0;

// 미리 만든 음성이 있으면 그것을, 없거나 재생에 실패하면 기기 내장 음성으로 읽는다.
// voice: 기본 목소리는 main, 대화문에서 나(B)는 alt
// onDone: 끝까지 읽었을 때만 부른다 (다른 발음이 시작되거나 stopSpeech로 끊기면 부르지 않는다)
export function speak(text: string, rate: number, voice: VoiceSlot = 'main', onDone?: () => void) {
  const id = ++latest;
  Speech.stop();
  stopFile();
  prepareAudio().then(() => {
    if (id !== latest) return;
    const file = audioFiles[voice][text];
    const finish = () => {
      if (id === latest) onDone?.();
    };
    const builtIn = () => {
      onFileDone = null;
      onFileError = null;
      Speech.speak(text, { language: 'en-US', rate, onDone: finish, onError: finish });
    };
    if (file != null) {
      try {
        onFileDone = finish;
        // 파일이 불러와지지 않거나 재생 중 오류가 나면 내장 음성으로 대신 읽는다
        onFileError = () => {
          if (id === latest) builtIn();
        };
        playFile(file, rate);
        return;
      } catch {
        // 아래에서 내장 음성으로 대신한다
      }
    }
    builtIn();
  });
}

export function stopSpeech() {
  latest++;
  Speech.stop();
  stopFile();
}
