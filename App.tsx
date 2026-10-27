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

import { CardDeckId, DeckId } from './src/data/decks';
import { dialogues } from './src/data/dialogues';
import { RoundResult, useProgress } from './src/progress';
import { DialogueScreen, HideMode } from './src/screens/DialogueScreen';
import { DoneScreen } from './src/screens/DoneScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { colors } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'study'; deck: CardDeckId }
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
  const { progress, setLastDeck, mark, completeDialogue } = useProgress();

  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [revealed, setRevealed] = useState(false);
  const [hide, setHide] = useState<HideMode>('en');
  const [shown, setShown] = useState<Record<number, boolean>>({});

  const goHome = () => {
    Speech.stop();
    setScreen({ name: 'home' });
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'home') return false;
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [screen.name]);

  if (!fontsLoaded || !progress) return <View style={styles.root} />;

  const openDeck = (id: DeckId) => {
    setLastDeck(id);
    if (id === 'dialogue') {
      setHide('en');
      setShown({});
      setScreen({ name: 'dialogue' });
    } else {
      setRevealed(false);
      setScreen({ name: 'study', deck: id });
    }
  };

  const onMark = (deck: CardDeckId, knew: boolean) => {
    Speech.stop();
    const result = mark(deck, knew);
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
      body = <HomeScreen progress={progress} onOpenDeck={openDeck} />;
      break;
    case 'study':
      body = (
        <StudyScreen
          deck={screen.deck}
          state={progress.decks[screen.deck]}
          revealed={revealed}
          onToggle={() => setRevealed((r) => !r)}
          onMark={(knew) => onMark(screen.deck, knew)}
          onHome={goHome}
        />
      );
      break;
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
          onNext={() => openDeck(screen.result.deck)}
          onHome={goHome}
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
