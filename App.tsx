import {
  IBMPlexSansKR_400Regular,
  IBMPlexSansKR_500Medium,
  IBMPlexSansKR_600SemiBold,
  IBMPlexSansKR_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-kr';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Tab } from './src/components/BottomNav';
import { CardDeckId, DeckId } from './src/data/decks';
import { dialogues } from './src/data/dialogues';
import { RoundResult, SetRef, roundState, useProgress } from './src/progress';
import { DialogueScreen, HideMode } from './src/screens/DialogueScreen';
import { DecksScreen } from './src/screens/DecksScreen';
import { DoneScreen } from './src/screens/DoneScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SetsScreen } from './src/screens/SetsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { colors } from './src/theme';

type Screen =
  | { name: Tab }
  | { name: 'sets'; deck: CardDeckId }
  | { name: 'study'; set: SetRef }
  | { name: 'dialogue' }
  | { name: 'done'; result: RoundResult };

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_600SemiBold,
    IBMPlexSansKR_700Bold,
  });
  const { progress, setLastDeck, openSet, mark, completeDialogue, setGoal } = useProgress();

  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [revealed, setRevealed] = useState(false);
  const [hide, setHide] = useState<HideMode>('en');
  const [shown, setShown] = useState<Record<number, boolean>>({});

  const goHome = () => {
    Speech.stop();
    setScreen({ name: 'home' });
  };

  const goTab = (t: Tab) => {
    Speech.stop();
    setScreen({ name: t });
  };

  const goSets = (deck: CardDeckId) => {
    Speech.stop();
    setScreen({ name: 'sets', deck });
  };

  // 안드로이드 뒤로 가기: 학습·완료 → 세트 목록 → 홈
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'home') return false;
      if (screen.name === 'study') goSets(screen.set.deck);
      else if (screen.name === 'done') goSets(screen.result.deck);
      else goHome();
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  if (!fontsLoaded || !progress) return <View style={styles.root} />;

  const openDeck = (id: DeckId) => {
    setLastDeck(id);
    if (id === 'dialogue') {
      setHide('en');
      setShown({});
      setScreen({ name: 'dialogue' });
    } else {
      setScreen({ name: 'sets', deck: id });
    }
  };

  const startSet = (s: SetRef) => {
    openSet(s);
    setRevealed(false);
    setScreen({ name: 'study', set: s });
  };

  const onMark = (s: SetRef, knew: boolean) => {
    Speech.stop();
    const result = mark(s, knew);
    setRevealed(false);
    if (result) setScreen({ name: 'done', result });
  };

  const onDialogueDone = () => {
    Speech.stop();
    const roundFinished = completeDialogue();
    setShown({});
    if (roundFinished) goHome();
  };

  let body;
  switch (screen.name) {
    case 'home':
      body = <HomeScreen progress={progress} onOpenDeck={openDeck} onOpenSet={startSet} onNavigate={goTab} />;
      break;
    case 'decks':
      body = <DecksScreen progress={progress} onOpenDeck={openDeck} onNavigate={goTab} />;
      break;
    case 'stats':
      body = <StatsScreen progress={progress} onNavigate={goTab} />;
      break;
    case 'settings':
      body = <SettingsScreen progress={progress} onSetGoal={setGoal} onNavigate={goTab} />;
      break;
    case 'sets':
      body = <SetsScreen deck={screen.deck} progress={progress} onOpenSet={startSet} onHome={goHome} />;
      break;
    case 'study': {
      const s = screen.set;
      body = (
        <StudyScreen
          deck={s.deck}
          set={s.set}
          state={roundState(progress, s)}
          revealed={revealed}
          onToggle={() => setRevealed((r) => !r)}
          onMark={(knew) => onMark(s, knew)}
          onBack={() => goSets(s.deck)}
        />
      );
      break;
    }
    case 'dialogue':
      body = (
        <DialogueScreen
          dialogue={dialogues[progress.dialogue.pos]}
          index={progress.dialogue.pos}
          count={dialogues.length}
          round={progress.dialogue.round}
          hide={hide}
          shown={shown}
          onHide={(m) => {
            setHide(m);
            setShown({});
          }}
          onToggleLine={(i) => setShown((s) => ({ ...s, [i]: !s[i] }))}
          onReset={() => setShown({})}
          onDone={onDialogueDone}
          onHome={goHome}
        />
      );
      break;
    case 'done':
      body = (
        <DoneScreen
          result={screen.result}
          onNext={() => startSet({ deck: screen.result.deck, set: screen.result.set })}
          onBack={() => goSets(screen.result.deck)}
        />
      );
      break;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        {body}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
