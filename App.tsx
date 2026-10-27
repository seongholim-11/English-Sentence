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
import { CardDeckId, DeckId, deckMeta } from './src/data/decks';
import { dialogues } from './src/data/dialogues';
import { RoundResult, SetRef, dueIds, isFavorite, roundState, useProgress } from './src/progress';
import { DialogueScreen, HideMode } from './src/screens/DialogueScreen';
import { DecksScreen } from './src/screens/DecksScreen';
import { DoneScreen } from './src/screens/DoneScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SetsScreen } from './src/screens/SetsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { colors } from './src/theme';

const REVIEW_MAX = 20;

// 학습·복습 화면이 보여 주는 카드가 속한 덱
const DECK_OF = (s: Screen): CardDeckId => (s.name === 'study' ? s.set.deck : s.name === 'review' ? s.deck : 'words');

type Screen =
  | { name: Tab }
  | { name: 'sets'; deck: CardDeckId }
  | { name: 'study'; set: SetRef }
  | { name: 'quiz'; set: SetRef }
  | { name: 'search'; favorites: boolean }
  | { name: 'review'; deck: CardDeckId; queue: string[]; pos: number }
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
  const { progress, toggleFavorite, setPrefs, setLastDeck, openSet, mark, review, quizAnswer, recordQuiz, completeDialogue, setGoal } = useProgress();

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
      if (screen.name === 'study' || screen.name === 'quiz') goSets(screen.set.deck);
      else if (screen.name === 'done') goSets(screen.result.deck);
      else if (screen.name === 'sets' || screen.name === 'search') goTab('decks');
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

  const startQuiz = (s: SetRef) => {
    setLastDeck(s.deck);
    setScreen({ name: 'quiz', set: s });
  };

  // 홈의 복습 카드: 오늘 복습할 카드를 최대 20장까지 보여 준다. 없으면 그 덱의 세트 목록으로
  const onReview = (id: DeckId) => {
    if (id === 'dialogue') return openDeck(id);
    const queue = dueIds(progress, id).slice(0, REVIEW_MAX);
    if (queue.length === 0) return openDeck(id);
    setRevealed(false);
    setScreen({ name: 'review', deck: id, queue, pos: 0 });
  };

  const onReviewMark = (s: { deck: CardDeckId; queue: string[]; pos: number }, knew: boolean) => {
    Speech.stop();
    review(s.deck, s.queue[s.pos], knew);
    setRevealed(false);
    if (s.pos + 1 >= s.queue.length) goHome();
    else setScreen({ ...s, name: 'review', pos: s.pos + 1 });
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
      body = <HomeScreen progress={progress} onReview={onReview} onOpenDeck={openDeck} onOpenSet={startSet} onNavigate={goTab} />;
      break;
    case 'decks':
      body = <DecksScreen
          progress={progress}
          onOpenDeck={openDeck}
          onSearch={(favorites) => {
            Speech.stop();
            setScreen({ name: 'search', favorites });
          }}
          onNavigate={goTab}
        />;
      break;
    case 'stats':
      body = <StatsScreen progress={progress} onNavigate={goTab} />;
      break;
    case 'settings':
      body = <SettingsScreen progress={progress} onSetGoal={setGoal} onSetPrefs={setPrefs} onNavigate={goTab} />;
      break;
    case 'sets':
      body = (
        <SetsScreen
          deck={screen.deck}
          progress={progress}
          onStudy={startSet}
          onQuiz={startQuiz}
          onBack={() => goTab('decks')}
        />
      );
      break;
    case 'study': {
      const s = screen.set;
      const state = roundState(progress, s);
      body = (
        <StudyScreen
          deck={s.deck}
          title={`${deckMeta(s.deck).name} · ${s.set + 1}세트`}
          subtitle={`${state.round}회독 · 남은 카드 ${state.queue.length - state.pos}장`}
          queue={state.queue}
          pos={state.pos}
          revealed={revealed}
          rate={progress.prefs.speechRate}
          autoSpeak={progress.prefs.autoSpeak}
          isFavorite={(id) => isFavorite(progress, DECK_OF(screen), id)}
          onFavorite={(id) => toggleFavorite(DECK_OF(screen), id)}
          onToggle={() => setRevealed((r) => !r)}
          onMark={(knew) => onMark(s, knew)}
          onBack={() => goSets(s.deck)}
        />
      );
      break;
    }
    case 'search':
      body = (
        <SearchScreen
          progress={progress}
          initialFavorites={screen.favorites}
          onToggleFavorite={toggleFavorite}
          onBack={() => goTab('decks')}
        />
      );
      break;
    case 'quiz': {
      const s = screen.set;
      body = (
        <QuizScreen
          key={`${s.deck}:${s.set}`}
          deck={s.deck}
          set={s.set}
          onAnswer={(id, correct) => quizAnswer(s.deck, id, correct)}
          onFinish={(score, total) => recordQuiz(s, score, total)}
          onBack={() => goSets(s.deck)}
        />
      );
      break;
    }
    case 'review': {
      const r = screen;
      body = (
        <StudyScreen
          deck={r.deck}
          title={`${deckMeta(r.deck).name} 복습`}
          subtitle={`오늘 복습 · 남은 카드 ${r.queue.length - r.pos}장`}
          queue={r.queue}
          pos={r.pos}
          revealed={revealed}
          rate={progress.prefs.speechRate}
          autoSpeak={progress.prefs.autoSpeak}
          isFavorite={(id) => isFavorite(progress, DECK_OF(screen), id)}
          onFavorite={(id) => toggleFavorite(DECK_OF(screen), id)}
          onToggle={() => setRevealed((x) => !x)}
          onMark={(knew) => onReviewMark(r, knew)}
          onBack={goHome}
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
          rate={progress.prefs.speechRate}
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
