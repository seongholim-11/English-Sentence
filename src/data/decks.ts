import { frequencyParts } from './frequency';
import { colors } from '../theme';
import { phrasalRows } from './more/phrasal';
import { sentenceRows } from './more/sentences';

export type Card = {
  id: string;
  tag: string;
  front: string;
  hint: string;
  back: string;
  ex: string;
  exKo: string;
};

export type CardDeckId = 'words' | 'phrasal' | 'sentences';
export type DeckId = CardDeckId | 'dialogue';

export type DeckMeta = {
  id: DeckId;
  name: string;
  sub: string;
  mono: string;
  color: string;
  soft: string;
  deep: string;
  bigFront: boolean;
};

const card = (tag: string, front: string, hint: string, back: string, ex: string, exKo: string): Card => ({
  id: front,
  tag,
  front,
  hint,
  back,
  ex,
  exKo,
});

// 원어민이 일상 회화에서 자주 쓰는 단어 (빈도순 단어 뒤에 붙는다)
const conversationWords: Card[] = [
  card('adverb', 'literally', '/ˈlɪtərəli/', '말 그대로, 진짜로 (강조)', 'I literally just got here.', '나 진짜 방금 도착했어.'),
  card('adverb', 'honestly', '/ˈɑːnɪstli/', '솔직히, 진심으로', "Honestly, I don't think it's worth it.", '솔직히 그럴 가치는 없는 것 같아.'),
  card('adverb', 'basically', '/ˈbeɪsɪkli/', '한마디로, 기본적으로', "So basically, we're starting over.", '그러니까 한마디로, 처음부터 다시 하는 거야.'),
  card('adverb', 'actually', '/ˈæktʃuəli/', '사실은, 실은', "Actually, I've changed my mind.", '사실 나 마음 바꿨어.'),
  card('adverb', 'totally', '/ˈtoʊtəli/', '완전히, 당연히', 'I totally forgot about that.', '그거 완전히 까먹고 있었어.'),
  card('adverb', 'pretty', '/ˈprɪti/', '꽤, 상당히', "The movie was pretty good, actually.", '영화 사실 꽤 괜찮았어.'),
  card('adverb', 'definitely', '/ˈdefɪnətli/', '확실히, 당연하지', "I'm definitely coming to your party.", '네 파티에 당연히 갈 거야.'),
  card('adverb', 'apparently', '/əˈpærəntli/', '듣자 하니, 보아하니', "Apparently, the store's closed today.", '듣자 하니 그 가게 오늘 문 닫았대.'),
  card('adverb', 'eventually', '/ɪˈventʃuəli/', '결국, 마침내', "Don't worry, you'll get used to it eventually.", '걱정 마, 결국엔 익숙해질 거야.'),
  card('adverb', 'kind of', '/ˈkaɪnd əv/', '좀, 약간', "I'm kind of tired today.", '오늘 좀 피곤해.'),
  card('adjective', 'awkward', '/ˈɔːkwərd/', '어색한, 곤란한', 'That was so awkward.', '그거 진짜 어색했다.'),
  card('adjective', 'random', '/ˈrændəm/', '뜬금없는, 아무', 'A random guy just started talking to me.', '웬 모르는 남자가 갑자기 말을 걸었어.'),
  card('adjective', 'weird', '/wɪrd/', '이상한, 묘한', "That's weird. It was working a minute ago.", '이상하네. 아까는 됐는데.'),
  card('adjective', 'swamped', '/swɑːmpt/', '(일이) 엄청 바쁜', "I'm swamped with work this week.", '이번 주에 일이 산더미야.'),
  card('adjective', 'exhausted', '/ɪɡˈzɔːstɪd/', '녹초가 된, 기진맥진한', "I'm exhausted. I'm going straight to bed.", '완전 녹초야. 바로 잘래.'),
  card('adjective', 'hilarious', '/hɪˈleriəs/', '엄청 웃긴', 'His story was hilarious.', '걔 얘기 진짜 웃겼어.'),
  card('adjective', 'annoying', '/əˈnɔɪɪŋ/', '짜증 나는, 거슬리는', 'That noise is so annoying.', '저 소리 너무 거슬려.'),
  card('adjective', 'obsessed', '/əbˈsest/', '(~에) 푹 빠진', "I'm obsessed with this song.", '나 이 노래에 완전 꽂혔어.'),
  card('adjective', 'chill', '/tʃɪl/', '느긋한, 편한', 'It was a chill weekend.', '편하게 쉰 주말이었어.'),
  card('adjective', 'sketchy', '/ˈsketʃi/', '수상한, 미심쩍은', 'That website looks kind of sketchy.', '그 사이트 좀 수상해 보여.'),
  card('adjective', 'legit', '/ləˈdʒɪt/', '진짜인, 제대로인', 'This place is legit. The food is amazing.', '여기 진짜 맛집이야. 음식 대박이야.'),
  card('adjective', 'overwhelmed', '/ˌoʊvərˈwelmd/', '벅찬, 정신없는', "I'm a little overwhelmed right now.", '지금 좀 벅차.'),
  card('adjective', 'brutal', '/ˈbruːtl/', '혹독한, 너무 힘든', 'The traffic this morning was brutal.', '오늘 아침 교통 체증 장난 아니었어.'),
  card('adjective', 'cheesy', '/ˈtʃiːzi/', '오글거리는, 유치한', 'I know it sounds cheesy, but I mean it.', '오글거리게 들리겠지만 진심이야.'),
  card('adjective', 'convenient', '/kənˈviːniənt/', '편리한, (시간이) 괜찮은', 'Is Friday convenient for you?', '금요일 괜찮아?'),
  card('verb', 'grab', '/ɡræb/', '(간단히) 먹다, 사 오다', 'Want to grab a coffee?', '커피 한잔할래?'),
  card('verb', 'crave', '/kreɪv/', '몹시 먹고 싶다, 갈망하다', "I'm craving something sweet.", '단 게 너무 당겨.'),
  card('verb', 'bother', '/ˈbɑːðər/', '신경 쓰이게 하다, 귀찮게 하다', "Does it bother you if I turn on the music?", '음악 틀어도 신경 안 쓰여?'),
  card('verb', 'mind', '/maɪnd/', '꺼리다, 언짢아하다', 'Do you mind if I sit here?', '여기 앉아도 될까요?'),
  card('verb', 'struggle', '/ˈstrʌɡl/', '애먹다, 고생하다', "I'm struggling to stay awake.", '깨어 있기가 너무 힘들어.'),
  card('verb', 'figure', '/ˈfɪɡjər/', '생각하다, 판단하다', 'I figured you might be hungry.', '너 배고플 것 같아서.'),
  card('verb', 'nail', '/neɪl/', '완벽하게 해내다', 'You nailed the presentation!', '발표 완전 잘했어!'),
  card('noun', 'vibe', '/vaɪb/', '분위기, 느낌', 'I love the vibe of this place.', '여기 분위기 너무 좋다.'),
  card('noun', 'stuff', '/stʌf/', '것들, 물건, 일', "I've got a lot of stuff to do today.", '오늘 할 일이 많아.'),
  card('noun', 'deal', '/diːl/', '일, 문제 (big deal)', "Relax, it's no big deal.", '진정해, 별일 아니야.'),
  card('phrase', 'supposed to', '/səˈpoʊst tə/', '~하기로 되어 있다', "We're supposed to meet at seven.", '우리 7시에 만나기로 했잖아.'),
];

// 원어민이 매일 쓰는 구동사
const basePhrasal: Card[] = [
  card('phrasal verb', 'put off', 'put + off', '미루다, 연기하다', 'We had to put off the meeting until Friday.', '회의를 금요일로 미뤄야 했어요.'),
  card('phrasal verb', 'figure out', 'figure + out', '알아내다, 이해하다', "I can't figure out how this works.", '이게 어떻게 되는 건지 모르겠어.'),
  card('phrasal verb', 'come across', 'come + across', '우연히 발견하다, 마주치다', 'I came across an old photo of us.', '우리 옛날 사진을 우연히 찾았어.'),
  card('phrasal verb', 'run into', 'run + into', '우연히 만나다, (문제에) 부딪히다', 'I ran into Sarah at the mall.', '쇼핑몰에서 사라랑 우연히 마주쳤어.'),
  card('phrasal verb', 'look into', 'look + into', '조사하다, 알아보다', "I'll look into it and get back to you.", '확인해 보고 다시 연락드릴게요.'),
  card('phrasal verb', 'catch up', 'catch + up', '근황을 나누다, 따라잡다', "Let's grab dinner and catch up.", '저녁 먹으면서 그동안 얘기 좀 하자.'),
  card('phrasal verb', 'hang out', 'hang + out', '같이 놀다, 어울리다', 'Do you want to hang out this weekend?', '이번 주말에 같이 놀래?'),
  card('phrasal verb', 'show up', 'show + up', '나타나다, 오다', 'He showed up an hour late.', '걔 한 시간 늦게 나타났어.'),
  card('phrasal verb', 'end up', 'end + up', '결국 ~하게 되다', 'We ended up staying out till 2 a.m.', '결국 새벽 2시까지 밖에 있었어.'),
  card('phrasal verb', 'give up', 'give + up', '포기하다, 끊다', "Don't give up now. You're almost there.", '지금 포기하지 마. 거의 다 왔어.'),
  card('phrasal verb', 'work out', 'work + out', '운동하다, (일이) 잘 풀리다', "Don't worry, it'll all work out.", '걱정 마, 다 잘될 거야.'),
  card('phrasal verb', 'turn down', 'turn + down', '거절하다, (소리를) 줄이다', 'She turned down the job offer.', '그녀는 그 일자리 제안을 거절했어.'),
  card('phrasal verb', 'pick up', 'pick + up', '사 오다, 데리러 가다, 익히다', 'Can you pick up some milk on your way home?', '집에 오는 길에 우유 좀 사 올 수 있어?'),
  card('phrasal verb', 'drop by', 'drop + by', '잠깐 들르다', 'Feel free to drop by anytime.', '언제든 편하게 들러.'),
  card('phrasal verb', 'come up', 'come + up', '(일이) 생기다, (화제가) 나오다', 'Something came up, so I have to leave early.', '일이 좀 생겨서 일찍 가 봐야 해.'),
  card('phrasal verb', 'push back', 'push + back', '(일정을) 뒤로 미루다', 'Can we push it back an hour?', '한 시간만 미룰 수 있을까?'),
  card('phrasal verb', 'freak out', 'freak + out', '기겁하다, 멘붕 오다', "Don't freak out, but I lost your charger.", '놀라지 마, 근데 네 충전기 잃어버렸어.'),
  card('phrasal verb', 'calm down', 'calm + down', '진정하다', 'Calm down. We still have time.', '진정해. 아직 시간 있어.'),
  card('phrasal verb', 'check out', 'check + out', '확인하다, 구경하다', 'You should check out that new café.', '그 새로 생긴 카페 꼭 가 봐.'),
  card('phrasal verb', 'sort out', 'sort + out', '해결하다, 정리하다', "Let me sort out a few things first.", '먼저 몇 가지만 정리할게.'),
  card('phrasal verb', 'get along', 'get + along', '(사이좋게) 잘 지내다', 'Do you get along with your roommate?', '룸메이트랑 잘 지내?'),
  card('phrasal verb', 'look forward to', 'look + forward + to', '~을 고대하다', "I'm really looking forward to the trip.", '여행 정말 기대돼.'),
  card('phrasal verb', 'find out', 'find + out', '알아내다, 알게 되다', 'I just found out she moved to Busan.', '걔 부산으로 이사 간 거 방금 알았어.'),
  card('phrasal verb', 'come up with', 'come + up + with', '(아이디어를) 생각해 내다', 'Who came up with this idea?', '이 아이디어 누가 낸 거야?'),
  card('phrasal verb', 'run out of', 'run + out + of', '~이 다 떨어지다', "We've run out of coffee.", '커피가 다 떨어졌어.'),
  card('phrasal verb', 'go over', 'go + over', '검토하다, 살펴보다', "Let's go over the plan one more time.", '계획 한 번만 더 검토하자.'),
  card('phrasal verb', 'bring up', 'bring + up', '(화제를) 꺼내다', "I didn't want to bring it up at dinner.", '저녁 먹을 때 그 얘기 꺼내고 싶지 않았어.'),
  card('phrasal verb', 'hold on', 'hold + on', '잠깐 기다리다', 'Hold on, let me grab my keys.', '잠깐만, 열쇠 좀 챙길게.'),
  card('phrasal verb', 'wrap up', 'wrap + up', '마무리하다', "Let's wrap this up and go home.", '이거 마무리하고 집에 가자.'),
  card('phrasal verb', 'set up', 'set + up', '준비하다, 설치하다, 잡다', 'I set up a meeting for Monday.', '월요일로 미팅 잡아 놨어.'),
  card('phrasal verb', 'mess up', 'mess + up', '망치다, 실수하다', "I totally messed up the order.", '주문을 완전 잘못했어.'),
  card('phrasal verb', 'let down', 'let + down', '실망시키다', "I won't let you down.", '실망시키지 않을게.'),
  card('phrasal verb', 'cheer up', 'cheer + up', '기운 내다, 기운 나게 하다', 'Cheer up! It could be worse.', '기운 내! 더 나쁠 수도 있었어.'),
  card('phrasal verb', 'get over', 'get + over', '극복하다, (병이) 낫다', "It took me a while to get over it.", '그걸 털어내는 데 시간이 좀 걸렸어.'),
  card('phrasal verb', 'stick around', 'stick + around', '(가지 않고) 더 머무르다', 'Can you stick around for a bit?', '조금만 더 있다 갈 수 있어?'),
  card('phrasal verb', 'head out', 'head + out', '나가다, 출발하다', "I'm going to head out now. See you tomorrow.", '나 이제 가 볼게. 내일 봐.'),
];

const phrasal: Card[] = [
  ...basePhrasal,
  ...phrasalRows.map(([front, back, ex, exKo]) => card('phrasal verb', front, front.split(' ').join(' + '), back, ex, exKo)),
];

// 한국어 → 영어 말하기: 위 단어·구동사로 만든 문장
const baseSentences: Card[] = [
  card('한국어 → 영어', '지금은 그 얘기 안 하고 싶어.', '영어로 말해 보세요', "I'd rather not get into that right now.", 'get into = (이야기·주제를) 꺼내다', "I'd rather not ~ : 차라리 ~하지 않을래"),
  card('한국어 → 영어', '무슨 일 생기면 알려줘.', '영어로 말해 보세요', 'Let me know if anything comes up.', 'come up = (일이) 생기다', '일정·문제 모두에 쓸 수 있어요.'),
  card('한국어 → 영어', '그런 뜻으로 한 말 아니야.', '영어로 말해 보세요', "I didn't mean it that way.", 'mean it = 진심으로 그 뜻이다', '오해를 풀 때 자주 쓰는 표현'),
  card('한국어 → 영어', '말이야 쉽지.', '영어로 말해 보세요', "That's easier said than done.", 'easier said than done', '행동보다 말이 쉽다'),
  card('한국어 → 영어', '한 시간만 미룰 수 있을까?', '영어로 말해 보세요', 'Can we push it back an hour?', 'push back = (일정을) 뒤로 미루다', '반대는 move up (앞당기다)'),
  card('한국어 → 영어', '별거 아닌데 쌓이면 커.', '영어로 말해 보세요', "It's not a big deal, but it adds up.", 'add up = 쌓이다, 합쳐져 커지다', '비용·피로 등에 자주 써요'),
  card('한국어 → 영어', '이번 주에 일이 너무 많아서 정신없어.', '영어로 말해 보세요', "I'm totally swamped this week.", 'swamped = (일이) 엄청 바쁜', 'busy보다 훨씬 자연스러운 회화체'),
  card('한국어 → 영어', '나 진짜 방금 일어났어.', '영어로 말해 보세요', 'I literally just woke up.', 'literally = 진짜로 (강조)', 'just = 방금'),
  card('한국어 → 영어', '커피 한잔하면서 얘기 좀 하자.', '영어로 말해 보세요', "Let's grab a coffee and catch up.", 'grab + catch up', 'catch up = 밀린 근황을 나누다'),
  card('한국어 → 영어', '결국 집에서 영화 봤어.', '영어로 말해 보세요', 'We ended up watching a movie at home.', 'end up + -ing', '계획과 다르게 그렇게 됐을 때'),
  card('한국어 → 영어', '이거 어떻게 하는지 도저히 모르겠어.', '영어로 말해 보세요', "I can't figure out how to do this.", 'figure out = 알아내다', 'how to ~ : ~하는 방법'),
  card('한국어 → 영어', '마트에서 예전 동료를 우연히 만났어.', '영어로 말해 보세요', 'I ran into an old coworker at the grocery store.', 'run into = 우연히 마주치다', '과거형 ran into'),
  card('한국어 → 영어', '확인해 보고 다시 알려줄게.', '영어로 말해 보세요', "I'll look into it and let you know.", 'look into = 알아보다', '업무 회화 필수 표현'),
  card('한국어 → 영어', '오는 길에 빵 좀 사다 줄 수 있어?', '영어로 말해 보세요', 'Could you pick up some bread on your way?', 'pick up = 사 오다', 'on your way = 오는 길에'),
  card('한국어 → 영어', '우유가 다 떨어졌어.', '영어로 말해 보세요', "We've run out of milk.", 'run out of = ~이 다 떨어지다', "We're out of milk. 도 같은 뜻"),
  card('한국어 → 영어', '근처 오면 한번 들러.', '영어로 말해 보세요', "Drop by if you're ever in the area.", 'drop by = 잠깐 들르다', 'in the area = 근처에'),
  card('한국어 → 영어', '여기 앉아도 될까요?', '영어로 말해 보세요', 'Do you mind if I sit here?', 'Do you mind if ~?', '대답이 "괜찮아요"면 No, go ahead.'),
  card('한국어 → 영어', '솔직히 좀 어색했어.', '영어로 말해 보세요', 'Honestly, it was kind of awkward.', 'honestly + kind of + awkward', 'kind of = 좀, 약간'),
  card('한국어 → 영어', '이 노래에 완전 꽂혔어.', '영어로 말해 보세요', "I'm obsessed with this song.", 'be obsessed with = ~에 푹 빠지다', '음식·드라마·사람 모두 OK'),
  card('한국어 → 영어', '단 게 너무 당겨.', '영어로 말해 보세요', "I'm craving something sweet.", 'crave = 몹시 먹고 싶다', '진행형으로 자주 써요'),
  card('한국어 → 영어', '듣자 하니 그 식당 진짜 맛있대.', '영어로 말해 보세요', 'Apparently, that restaurant is legit.', 'apparently + legit', 'legit = 진짜 괜찮은'),
  card('한국어 → 영어', '포기하지 마, 결국엔 잘될 거야.', '영어로 말해 보세요', "Don't give up. It'll work out eventually.", 'give up + work out + eventually', 'work out = (일이) 잘 풀리다'),
  card('한국어 → 영어', '놀라지 마, 근데 나 폰 잃어버렸어.', '영어로 말해 보세요', "Don't freak out, but I lost my phone.", 'freak out = 기겁하다', "Don't freak out, but ~ : 놀라지 말고 들어"),
  card('한국어 → 영어', '이 아이디어 누가 생각해 낸 거야?', '영어로 말해 보세요', 'Who came up with this idea?', 'come up with = 생각해 내다', '칭찬할 때도 따질 때도 써요'),
  card('한국어 → 영어', '이거 마무리하고 밥 먹으러 가자.', '영어로 말해 보세요', "Let's wrap this up and grab lunch.", 'wrap up + grab', 'wrap up = 마무리하다'),
  card('한국어 → 영어', '발표 완전 잘했어!', '영어로 말해 보세요', 'You totally nailed the presentation!', 'nail = 완벽하게 해내다', 'You nailed it! 만으로도 OK'),
  card('한국어 → 영어', '우리 7시에 만나기로 했잖아.', '영어로 말해 보세요', 'We were supposed to meet at seven.', 'be supposed to = ~하기로 되어 있다', '과거형은 약속이 안 지켜졌다는 뉘앙스'),
  card('한국어 → 영어', '그 얘기는 저녁 먹을 때 꺼내지 마.', '영어로 말해 보세요', "Don't bring it up at dinner.", 'bring up = (화제를) 꺼내다', 'it이 가운데로 들어가요'),
  card('한국어 → 영어', '조금만 더 있다 가.', '영어로 말해 보세요', 'Stick around for a bit.', 'stick around = 더 머무르다', 'for a bit = 잠깐'),
  card('한국어 → 영어', '나 이제 가 볼게.', '영어로 말해 보세요', "I'm going to head out.", 'head out = 나가다, 출발하다', "I'm gonna head out. 처럼 줄여 말해요"),
  card('한국어 → 영어', '그 일은 털어내는 데 시간이 좀 걸렸어.', '영어로 말해 보세요', 'It took me a while to get over it.', 'get over = 극복하다', 'It took me a while to ~ : ~하는 데 시간이 걸렸다'),
  card('한국어 → 영어', '실망시키지 않을게.', '영어로 말해 보세요', "I won't let you down.", 'let down = 실망시키다', '약속할 때 자주 쓰는 말'),
];

const sentences: Card[] = [
  ...baseSentences,
  ...sentenceRows.map(([ko, en, note, tip]) => card('한국어 → 영어', ko, '영어로 말해 보세요', en, note, tip)),
];

// 영단어 덱: 회화 빈도순 단어 다음에, 거기 없는 회화 단어를 이어 붙인다
const frequencyWords = frequencyParts.flat();
const seen = new Set(frequencyWords.map((c) => c.id.toLowerCase()));
const words = [...frequencyWords, ...conversationWords.filter((c) => !seen.has(c.id.toLowerCase()))];

export const cardDecks: Record<CardDeckId, Card[]> = { words, phrasal, sentences };

// 어두운 테마에서는 연한 배경 대신 어두운 톤을 쓴다
const deckMeta0 = (
  m: Omit<DeckMeta, 'soft' | 'deep'>,
  light: { soft: string; deep: string },
  dark: { soft: string; deep: string },
): DeckMeta => ({
  ...m,
  get soft() {
    return colors.mode === 'dark' ? dark.soft : light.soft;
  },
  get deep() {
    return colors.mode === 'dark' ? dark.deep : light.deep;
  },
});

export const decks: DeckMeta[] = [
  deckMeta0({ id: 'words', name: '영단어', sub: 'Vocabulary', mono: 'Aa', color: '#2F5BFF', bigFront: true }, { soft: '#E7ECFF', deep: '#2140C4' }, { soft: '#1F2A52', deep: '#9DB2FF' }),
  deckMeta0({ id: 'phrasal', name: '구동사', sub: 'Phrasal verbs', mono: 'PV', color: '#E8752A', bigFront: true }, { soft: '#FDEBDD', deep: '#A84A10' }, { soft: '#3D2A1B', deep: '#F5A872' }),
  deckMeta0({ id: 'sentences', name: '문장', sub: 'Sentences', mono: 'S.', color: '#1A9E7A', bigFront: false }, { soft: '#DDF3EC', deep: '#0F6E54' }, { soft: '#18362D', deep: '#6FD6B5' }),
  deckMeta0({ id: 'dialogue', name: '대화문', sub: 'Dialogues', mono: 'A·B', color: '#7A4DE0', bigFront: false }, { soft: '#ECE4FB', deep: '#5630B0' }, { soft: '#2D2347', deep: '#B9A0F5' }),
];

export const deckMeta = (id: DeckId): DeckMeta => decks.find((d) => d.id === id) ?? decks[1];

// 카드 덱은 50장씩 세트로 나눠 공부한다
export const SET_SIZE = 50;

export const setCount = (deck: CardDeckId) => Math.ceil(cardDecks[deck].length / SET_SIZE);

export const setCards = (deck: CardDeckId, set: number) => cardDecks[deck].slice(set * SET_SIZE, (set + 1) * SET_SIZE);

// 학습 카드에서 읽어 줄 영어: 문장 덱은 앞면이 한국어라 뒷면을 읽는다
export const speakText = (deck: CardDeckId, c: Card): string => (deck === 'sentences' ? c.back : c.front);
