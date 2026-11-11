import { cardDecks } from './decks';

export type ExpressionInfo = {
  term: string;
  meaning: string;
  ex: string;
  exKo: string;
};

// 영단어·구동사 덱에 없는 대화문 표현: 소문자 표현 → [뜻, 예문, 예문 해석]
// 덱에 있는 표현은 그 카드의 뜻과 예문을 그대로 쓴다 (explainExpression 참고)
const glossary: Record<string, [string, string, string]> = {
  'make an appointment': ['예약을 잡다 (병원·미용실 등)', "I'd like to make an appointment for Monday.", '월요일로 예약하고 싶어요.'],
  'sore throat': ['목이 아픈 증상, 인후통', 'I have a sore throat and a cough.', '목이 아프고 기침이 나요.'],
  'come down with': ['(병에) 걸리다', "I think I'm coming down with a cold.", '감기에 걸리려나 봐.'],
  prescription: ['처방전, 처방약', "You'll need a prescription for that.", '그건 처방전이 있어야 해요.'],
  'twice a day': ['하루에 두 번', 'Take one pill twice a day.', '하루에 두 번, 한 알씩 드세요.'],
  'after meals': ['식후에', 'Take this after meals.', '식후에 드세요.'],
  'call in sick': ['아프다고 전화해서 쉬다', 'She called in sick this morning.', '걔 오늘 아침에 아프다고 전화하고 쉬었어.'],
  'take it easy': ['쉬엄쉬엄 하다, 무리하지 않다', 'Take it easy for a few days.', '며칠은 무리하지 말고 쉬세요.'],
  'how to get to': ['~에 가는 방법', 'Do you know how to get to the station?', '역에 어떻게 가는지 알아요?'],
  'within walking distance': ['걸어갈 수 있는 거리에', 'The hotel is within walking distance of the beach.', '그 호텔은 해변에서 걸어갈 수 있는 거리야.'],
  'head to': ['~로 향하다, 가다', "Let's head to the airport.", '공항으로 가자.'],
  'drop off': ['내려 주다, 맡기다', 'Can you drop me off at the corner?', '저 모퉁이에서 내려 줄래요?'],
  'check in': ['체크인하다, 탑승·투숙 수속을 밟다', 'We need to check in by three.', '3시까지 체크인해야 해.'],
  reservation: ['예약', 'I have a reservation under Kim.', '김 이름으로 예약했어요.'],
  'wake-up call': ['모닝콜', 'Could I get a wake-up call at seven?', '7시에 모닝콜 해 주실 수 있나요?'],
  'carry-on': ['기내 반입 가방', 'I only have a carry-on.', '저는 기내 가방 하나뿐이에요.'],
  'boarding pass': ['탑승권', 'Please show your boarding pass.', '탑승권을 보여 주세요.'],
  'look for': ['찾다', "I'm looking for my keys.", '내 열쇠를 찾고 있어.'],
  'turn up': ['(잃어버린 것이) 나타나다, 불쑥 나오다', "Don't worry, it'll turn up.", '걱정 마, 나올 거야.'],
  refund: ['환불', "I'd like a refund, please.", '환불해 주세요.'],
  receipt: ['영수증', 'Do you want the receipt?', '영수증 드릴까요?'],
  'move in': ['이사 들어오다', 'She moves in next week.', '걔는 다음 주에 이사 와.'],
  'keep it down': ['소리를 낮추다, 조용히 하다', "Could you keep it down? I'm on a call.", '조용히 해 줄래? 통화 중이야.'],
  'swing by': ['잠깐 들르다', "I'll swing by after work.", '퇴근하고 잠깐 들를게.'],
  'count on': ['~를 믿고 의지하다', 'You can count on me.', '나만 믿어.'],
  'in the mood for': ['~하고 싶은 기분인', "I'm in the mood for pizza.", '피자가 먹고 싶은 기분이야.'],
  'party of': ['~명 일행', 'A table for a party of four, please.', '4명 자리로 부탁해요.'],
  'be seated': ['자리에 앉다, 안내받다', "You'll be seated in ten minutes.", '10분 뒤에 자리를 안내해 드릴게요.'],
  'split the bill': ['계산을 나눠 내다 (더치페이)', "Let's split the bill.", '나눠서 내자.'],
  'on me': ['내가 살게, 내가 낼게', 'Dinner is on me tonight.', '오늘 저녁은 내가 살게.'],
  'stuck in traffic': ['차가 막혀 꼼짝 못 하는', "Sorry, I'm stuck in traffic.", '미안, 차가 막혀서 꼼짝 못 하고 있어.'],
  'running late': ['늦어지고 있는', "I'm running late. Start without me.", '나 늦어. 먼저 시작해.'],
  'make it': ['시간에 맞춰 가다, 해내다', "I can't make it tonight.", '오늘 밤엔 못 가.'],
  'tell me about': ['~에 대해 말해 줘', 'Tell me about your trip.', '여행 얘기 해 줘.'],
  'grab lunch': ['점심을 (가볍게) 먹다', 'Want to grab lunch?', '점심 같이 먹을래?'],
  'up to you': ['네가 정해, 네 마음이야', 'Pizza or pasta? It\'s up to you.', '피자나 파스타? 네가 정해.'],
  craving: ['몹시 당김, 먹고 싶음', "I'm craving something sweet.", '단 게 엄청 당겨.'],
  'give a hand': ['도와주다', 'Can you give me a hand?', '나 좀 도와줄래?'],
  'take time off': ['휴가를 내다, 쉬다', "I'm taking Friday off.", '금요일에 쉬려고.'],
  'cover for': ['~를 대신해 맡아 주다', 'Can you cover for me tomorrow?', '내일 나 대신 좀 맡아 줄래?'],
  'run through': ['처음부터 쭉 해 보다, 훑어보다', "Let's run through the plan once more.", '계획을 한 번 더 쭉 훑어보자.'],
  'breaking up': ['(전화·화상 연결이) 끊기다', "You're breaking up. I can't hear you.", '소리가 끊겨요. 안 들려요.'],
  mute: ['음소거 (하다)', "You're on mute.", '음소거 되어 있어요.'],
  'pull an all-nighter': ['밤을 새우다', 'I pulled an all-nighter to finish it.', '그거 끝내려고 밤을 새웠어.'],
  'take care of': ['처리하다, 돌보다', "I'll take care of it.", '내가 처리할게.'],
  'split up': ['나누다, 헤어지다', 'We need to split up the work.', '우리 일을 나눠야 해.'],
  deadline: ['마감, 기한', 'The deadline is Friday.', '마감은 금요일이야.'],
  'my bad': ['내 잘못이야, 미안', 'Oh, my bad. I thought it was yours.', '아, 내 잘못이야. 네 건 줄 알았어.'],
  'make it up to': ['~에게 만회하다, 보상하다', "I'll make it up to you.", '내가 만회할게.'],
  'hang in there': ['버텨, 힘내', 'Hang in there. It gets better.', '힘내. 곧 나아질 거야.'],
  'get promoted': ['승진하다', 'She got promoted last month.', '걔 지난달에 승진했어.'],
  'have in common': ['공통점이 있다', 'We have a lot in common.', '우린 공통점이 많아.'],
  'work things out': ['문제를 잘 해결하다', 'I hope you two can work things out.', '너희 둘이 잘 풀었으면 좋겠다.'],
  'give it time': ['시간을 두고 지켜보다', 'Just give it time.', '시간을 좀 두고 봐.'],
  'what do you do': ['무슨 일 하세요? (직업 묻기)', 'So, what do you do?', '그래서 무슨 일 하세요?'],
  'where are you from': ['어디 출신이에요?', 'Where are you from originally?', '원래 어디 출신이에요?'],
  'nice to meet': ['만나서 반가워요 (nice to meet you)', 'Nice to meet you.', '만나서 반가워요.'],
  'looks like': ['~인 것 같다', "Looks like it's going to rain.", '비 올 것 같아.'],
  umbrella: ['우산', "Don't forget your umbrella.", '우산 잊지 마.'],
  freezing: ['얼어붙을 듯이 추운', "It's freezing outside.", '밖이 엄청 추워.'],
  'up to': ['(what are you up to) 뭐 하고 지내', 'What are you up to this weekend?', '이번 주말에 뭐 해?'],
  'get in shape': ['몸을 만들다, 건강해지다', 'I want to get in shape this year.', '올해는 몸을 만들고 싶어.'],
  sore: ['(근육이) 쑤시는, 아픈', 'My legs are sore from running.', '달리기를 해서 다리가 쑤셔.'],
  refill: ['리필, 다시 채우기', 'Can I get a refill?', '리필 되나요?'],
  'leave a message': ['메시지를 남기다', 'Can I leave a message?', '메시지를 남겨도 될까요?'],
  'wrong number': ['잘못 건 전화', 'Sorry, wrong number.', '죄송해요, 잘못 걸었어요.'],
  'sign for': ['(수령 확인) 서명하다', 'Could you sign for the package?', '택배 수령 서명 좀 해 주실래요?'],
  'leave it': ['그냥 두다, 놔두다', 'Just leave it on the table.', '그냥 테이블 위에 놔둬.'],
};

export const glossaryEntries = glossary;

let cardIndex: Map<string, ExpressionInfo> | null = null;

// 영단어·구동사 덱의 카드를 앞면(소문자) 기준으로 찾을 수 있게 한 번만 만든다
function cards() {
  if (!cardIndex) {
    cardIndex = new Map();
    for (const deck of ['phrasal', 'words'] as const) {
      for (const c of cardDecks[deck]) {
        const key = c.front.toLowerCase();
        if (!cardIndex.has(key)) cardIndex.set(key, { term: c.front, meaning: c.back, ex: c.ex, exKo: c.exKo });
      }
    }
  }
  return cardIndex;
}

// 대화문의 표현 하나에 대한 뜻과 예문. 못 찾으면 null
export function explainExpression(expression: string): ExpressionInfo | null {
  const key = expression.trim().toLowerCase();
  const g = glossary[key];
  if (g) return { term: expression, meaning: g[0], ex: g[1], exKo: g[2] };
  return cards().get(key) ?? null;
}
