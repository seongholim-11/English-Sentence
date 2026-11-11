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
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, BackHandler, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Tab } from './src/components/BottomNav';
import { stopSpeech } from './src/speech';
import { LoadErrorScreen, ResetNoticeBanner, SaveErrorBanner } from './src/components/Notice';
import { CardDeckId, DeckId, applySetSize, deckMeta } from './src/data/decks';
import { dialogues } from './src/data/dialogues';
import { RoundResult, SetRef, dateKey, dueIds, isFavorite, roundState, useProgress } from './src/progress';
import { DialogueScreen, HideMode } from './src/screens/DialogueScreen';
import { DecksScreen } from './src/screens/DecksScreen';
import { DialogueListScreen } from './src/screens/DialogueListScreen';
import { DoneScreen } from './src/screens/DoneScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SetsScreen } from './src/screens/SetsScreen';
import { weakIds } from './src/weak';
import { StatsScreen } from './src/screens/StatsScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { applyTheme, colors, createStyles, fontState } from './src/theme';

const REVIEW_MAX = 20;
const FONT_WAIT_MS = 8000;

// 학습·복습 화면이 보여 주는 카드가 속한 덱
const DECK_OF = (s: Screen): CardDeckId => (s.name === 'study' ? s.set.deck : s.name === 'review' ? s.deck : 'words');

type Screen =
  | { name: Tab }
  | { name: 'sets'; deck: CardDeckId }
  | { name: 'study'; set: SetRef }
  | { name: 'quiz'; set: SetRef }
  | { name: 'search'; favorites: boolean }
  | { name: 'review'; deck: CardDeckId; queue: string[]; pos: number; weak?: boolean }
  | { name: 'dialogues' }
  | { name: 'dialogue'; index: number }
  | { name: 'done'; result: RoundResult };

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_600SemiBold,
    IBMPlexSansKR_700Bold,
  });
  // 글꼴이 오류로 못 뜨거나 너무 오래 걸리면 기본 글꼴로 시작한다
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), FONT_WAIT_MS);
    return () => clearTimeout(t);
  }, []);
  fontState.fallback = !fontsLoaded && (!!fontError || fontTimeout);

  const { progress, loadError, saveError, resetNotice, dismissResetNotice, lastGrade, undoLastGrade, clearLastGrade, resetAll, retryLoad, retrySave, toggleFavorite, setPrefs, setSetSize, setLastDeck, openSet, mark, review, quizAnswer, recordQuiz, completeDialogue, setGoal } = useProgress();

  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [revealed, setRevealed] = useState(false);
  const [hide, setHide] = useState<HideMode>('en');
  const [shown, setShown] = useState<Record<number, boolean>>({});

  // 앱을 켜 둔 채 자정이 지나거나 다시 앞으로 오면 홈의 날짜·복습 장수를 새로 그린다
  const [, setDay] = useState(dateKey());
  useEffect(() => {
    const check = () => setDay((d) => (dateKey() === d ? d : dateKey()));
    const sub = AppState.addEventListener('change', (st) => st === 'active' && check());
    const t = setInterval(check, 60000);
    return () => {
      sub.remove();
      clearInterval(t);
    };
  }, []);

  const goHome = () => {
    stopSpeech();
    clearLastGrade();
    setScreen({ name: 'home' });
  };

  const goTab = (t: Tab) => {
    stopSpeech();
    clearLastGrade();
    setScreen({ name: t });
  };

  const goSets = (deck: CardDeckId) => {
    stopSpeech();
    clearLastGrade();
    setScreen({ name: 'sets', deck });
  };

  const goDialogues = () => {
    stopSpeech();
    setScreen({ name: 'dialogues' });
  };

  // 안드로이드 뒤로 가기: 학습·완료 → 세트 목록 → 홈
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'home') return false;
      if (screen.name === 'study' || screen.name === 'quiz') goSets(screen.set.deck);
      else if (screen.name === 'done') goSets(screen.result.deck);
      else if (screen.name === 'sets' || screen.name === 'search' || screen.name === 'dialogues') goTab('decks');
      else if (screen.name === 'dialogue') goDialogues();
      else goHome();
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  // 테마와 글자 크기를 이번 렌더에 적용한다. 화면들은 렌더할 때마다 현재 값을 읽는다
  const scheme = useColorScheme();
  const themePref = progress?.prefs.theme ?? 'system';
  applySetSize(progress?.prefs.setSize);
  applyTheme(themePref === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : themePref, progress?.prefs.fontScale ?? 1);

  if (!fontsLoaded && !fontState.fallback) return <Loading />;
  if (loadError) return <SafeAreaProvider><LoadErrorScreen onRetry={retryLoad} /></SafeAreaProvider>;
  if (!progress) return <Loading />;

  const openDeck = (id: DeckId) => {
    setLastDeck(id);
    if (id === 'dialogue') {
      setScreen({ name: 'dialogues' });
    } else {
      setScreen({ name: 'sets', deck: id });
    }
  };

  // 대화문 하나를 연다. 홈의 '이어서'는 지금 차례(pos)의 대화문으로 바로 간다
  const openDialogue = (index: number) => {
    setLastDeck('dialogue');
    setHide('en');
    setShown({});
    setScreen({ name: 'dialogue', index });
  };

  const startSet = (s: SetRef) => {
    openSet(s);
    setRevealed(false);
    setScreen({ name: 'study', set: s });
  };

  const onMark = (s: SetRef, knew: boolean) => {
    stopSpeech();
    // 화면에 보이는 카드의 위치를 함께 넘긴다: 빠르게 두 번 눌러도 보지 않은 다음 카드는 채점되지 않는다
    const { round, pos } = roundState(progress, s);
    const result = mark(s, knew, { round, pos });
    setRevealed(false);
    if (result) setScreen({ name: 'done', result });
  };

  const startQuiz = (s: SetRef) => {
    setLastDeck(s.deck);
    setScreen({ name: 'quiz', set: s });
  };

  // 홈의 복습 카드: 오늘 복습할 카드를 최대 20장까지 보여 준다. 없으면 그 덱의 세트 목록으로
  const onReview = (id: DeckId) => {
    if (id === 'dialogue') return openDialogue(progress.dialogue.pos);
    const queue = dueIds(progress, id).slice(0, REVIEW_MAX);
    if (queue.length === 0) return openDeck(id);
    setRevealed(false);
    setScreen({ name: 'review', deck: id, queue, pos: 0 });
  };

  // 세트 목록의 '헷갈린 카드 복습': 상자가 0번인 카드를 최대 20장
  const onWeak = (deck: CardDeckId) => {
    const queue = weakIds(progress, deck).slice(0, REVIEW_MAX);
    if (queue.length === 0) return;
    setRevealed(false);
    setScreen({ name: 'review', deck, queue, pos: 0, weak: true });
  };

  const onReviewMark = (s: { deck: CardDeckId; queue: string[]; pos: number }, knew: boolean) => {
    stopSpeech();
    // s는 카드를 넘길 때마다 새로 만들어지는 화면 상태라, 같은 s로 두 번 오면(빠른 연타) 두 번째는 무시된다
    if (!review(s.deck, s.queue[s.pos], knew, s)) return;
    setRevealed(false);
    if (s.pos + 1 >= s.queue.length) goHome();
    else setScreen({ ...s, name: 'review', pos: s.pos + 1 });
  };

  // 어느 편을 외웠든 기록하고, 아직 안 한 다음 편으로 간다. 50편을 다 끝내면 홈으로
  const onDialogueDone = (index: number) => {
    stopSpeech();
    setShown({});
    const next = completeDialogue(index);
    if (next === null) goHome();
    else setScreen({ name: 'dialogue', index: next });
  };

  let body;
  switch (screen.name) {
    case 'home':
      body = <HomeScreen progress={progress} onReview={onReview} onOpenDeck={(id) => (id === 'dialogue' ? openDialogue(progress.dialogue.pos) : openDeck(id))} onOpenSet={startSet} onNavigate={goTab} />;
      break;
    case 'decks':
      body = <DecksScreen
          progress={progress}
          onOpenDeck={openDeck}
          onSearch={(favorites) => {
            stopSpeech();
            setScreen({ name: 'search', favorites });
          }}
          onNavigate={goTab}
        />;
      break;
    case 'stats':
      body = <StatsScreen progress={progress} onNavigate={goTab} />;
      break;
    case 'settings':
      body = <SettingsScreen progress={progress} onSetGoal={setGoal} onSetPrefs={setPrefs} onSetSetSize={setSetSize} onResetAll={resetAll} onNavigate={goTab} />;
      break;
    case 'sets':
      body = (
        <SetsScreen
          deck={screen.deck}
          progress={progress}
          onStudy={startSet}
          onQuiz={startQuiz}
          onWeak={onWeak}
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
          canUndo={!!lastGrade && lastGrade.deck === s.deck && state.pos > 0 && state.queue[state.pos - 1] === lastGrade.id}
          onUndo={() => {
            undoLastGrade();
            setRevealed(false);
          }}
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
          subtitle={`${r.weak ? '헷갈린 카드 복습' : '오늘 복습'} · 남은 카드 ${r.queue.length - r.pos}장`}
          queue={r.queue}
          pos={r.pos}
          revealed={revealed}
          rate={progress.prefs.speechRate}
          autoSpeak={progress.prefs.autoSpeak}
          isFavorite={(id) => isFavorite(progress, DECK_OF(screen), id)}
          onFavorite={(id) => toggleFavorite(DECK_OF(screen), id)}
          onToggle={() => setRevealed((x) => !x)}
          onMark={(knew) => onReviewMark(r, knew)}
          canUndo={!!lastGrade && lastGrade.deck === r.deck && r.pos > 0 && r.queue[r.pos - 1] === lastGrade.id}
          onUndo={() => {
            undoLastGrade();
            setRevealed(false);
            // 새 객체로 바꿔야 되돌린 카드를 다시 채점할 수 있다
            setScreen({ ...r, pos: r.pos - 1 });
          }}
          onBack={goHome}
        />
      );
      break;
    }
    case 'dialogues':
      body = <DialogueListScreen progress={progress} onOpen={openDialogue} onBack={() => goTab('decks')} />;
      break;
    case 'dialogue':
      body = (
        <DialogueScreen
          dialogue={dialogues[screen.index]}
          index={screen.index}
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
          onDone={() => onDialogueDone(screen.index)}
          onBack={goDialogues}
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
        <StatusBar style={colors.mode === 'dark' ? 'light' : 'dark'} />
        {body}
        {saveError && <SaveErrorBanner onRetry={retrySave} />}
        {resetNotice && !saveError && <ResetNoticeBanner onClose={dismissResetNotice} />}
      </View>
    </SafeAreaProvider>
  );
}

// 글꼴·학습 기록을 불러오는 동안 빈 화면 대신 보여 준다
function Loading() {
  return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.muted} accessibilityLabel="불러오는 중" />
    </View>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1, backgroundColor: colors.bg },
}));
