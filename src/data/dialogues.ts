import { moreDialogues } from './more/dialogues';

export type Line = {
  who: 'A' | 'B';
  speaker: string;
  en: string;
  ko: string;
};

export type Dialogue = {
  id: string;
  title: string;
  // 이 대화에 쓰인 단어·구동사 (영단어·구동사 덱과 같은 표현)
  expressions: string[];
  lines: Line[];
};

const A = (speaker: string, en: string, ko: string): Line => ({ who: 'A', speaker, en, ko });
const B = (en: string, ko: string): Line => ({ who: 'B', speaker: 'Me', en, ko });

const baseDialogues: Dialogue[] = [
  {
    id: 'cafe',
    title: '카페에서 주문하기',
    expressions: ['grab', 'mind'],
    lines: [
      A('Barista', 'Hi, what can I get for you?', '안녕하세요, 뭐 드릴까요?'),
      B('Can I grab a medium iced latte, please?', '아이스 라테 미디엄 하나 주세요.'),
      A('Barista', 'Sure. For here or to go?', '네. 드시고 가세요, 가져가세요?'),
      B('To go, please. Would you mind making it with oat milk?', '가져갈게요. 귀리 우유로 만들어 주실 수 있을까요?'),
      A('Barista', "No problem. That'll be six twenty-five.", '그럼요. 6달러 25센트입니다.'),
      B('Here you go. Thanks!', '여기요. 감사합니다!'),
    ],
  },
  {
    id: 'reschedule',
    title: '약속 미루기',
    expressions: ['come up', 'push back', 'swamped', 'put off'],
    lines: [
      A('Jamie', 'Are we still on for dinner tonight?', '오늘 저녁 약속 그대로지?'),
      B("Actually, something came up at work. Can we push it back an hour?", '사실 회사에 일이 좀 생겼어. 한 시간만 미룰 수 있을까?'),
      A('Jamie', 'Sure. Are you okay? You sound stressed.', '그럼. 괜찮아? 목소리가 좀 지쳐 보여.'),
      B("I'm totally swamped this week.", '이번 주에 일이 너무 많아.'),
      A('Jamie', "We can put it off till the weekend if that's easier.", '그게 편하면 주말로 미뤄도 돼.'),
      B("No, I'll be there. I really need a break.", '아니야, 갈게. 진짜 좀 쉬어야 해.'),
    ],
  },
  {
    id: 'weekend',
    title: '주말에 뭐 했어?',
    expressions: ['hang out', 'end up', 'literally', 'hilarious'],
    lines: [
      A('Chris', 'How was your weekend?', '주말 어땠어?'),
      B('Pretty good! I hung out with some friends from college.', '꽤 좋았어! 대학 친구들이랑 놀았어.'),
      A('Chris', 'Nice. What did you guys do?', '좋네. 뭐 했어?'),
      B('We were supposed to go hiking, but we ended up staying in and playing board games.', '등산 가기로 했는데 결국 집에서 보드게임 했어.'),
      A('Chris', 'Ha, that sounds fun.', '하하, 재밌었겠다.'),
      B('It was hilarious. I was literally crying from laughing.', '진짜 웃겼어. 웃다가 말 그대로 눈물 났다니까.'),
    ],
  },
  {
    id: 'bug',
    title: '회사에서 문제 해결하기',
    expressions: ['run into', 'look into', 'figure out', 'sort out'],
    lines: [
      A('Coworker', 'Hey, we ran into a problem with the login page.', '저기, 로그인 페이지에 문제가 생겼어요.'),
      B("Really? That's weird. It was working this morning.", '정말요? 이상하네요. 오늘 아침엔 됐는데.'),
      A('Coworker', "Users can't sign in on their phones.", '사용자들이 폰에서 로그인을 못 해요.'),
      B("Okay, I'll look into it right now.", '알겠어요, 바로 확인해 볼게요.'),
      A('Coworker', 'Thanks. Let me know once you figure out what happened.', '고마워요. 원인 알아내면 알려 주세요.'),
      B("Will do. I'm sure we can sort it out by lunch.", '그럴게요. 점심 전엔 해결할 수 있을 거예요.'),
    ],
  },
  {
    id: 'catchup',
    title: '오랜만에 만난 친구',
    expressions: ['catch up', 'apparently', 'find out', 'drop by'],
    lines: [
      A('Sam', "Oh my gosh, it's been forever! How have you been?", '세상에, 진짜 오랜만이다! 어떻게 지냈어?'),
      B("Good! We should grab a coffee and catch up sometime.", '잘 지냈지! 언제 커피 마시면서 밀린 얘기 좀 하자.'),
      A('Sam', 'Definitely. Did you hear about Mina?', '당연하지. 미나 소식 들었어?'),
      B('No, what happened?', '아니, 무슨 일인데?'),
      A('Sam', 'Apparently, she moved to Canada. I just found out last week.', '듣자 하니 캐나다로 이사 갔대. 나도 지난주에 알았어.'),
      B("No way! I'll text her. And drop by anytime, okay?", '말도 안 돼! 연락해 봐야겠다. 그리고 언제든 놀러 와, 알았지?'),
    ],
  },
  {
    id: 'gym',
    title: '운동 이야기',
    expressions: ['work out', 'give up', 'exhausted', 'struggle'],
    lines: [
      A('Alex', 'Do you still work out every morning?', '아직도 매일 아침 운동해?'),
      B("I'm trying to, but I've been struggling lately.", '하려고는 하는데 요즘 좀 힘들어.'),
      A('Alex', 'Yeah? What happened?', '그래? 무슨 일 있어?'),
      B("I'm just exhausted after work. I kind of want to give up.", '퇴근하면 그냥 녹초야. 좀 포기하고 싶기도 해.'),
      A('Alex', "Don't give up! Try shorter workouts. Even twenty minutes helps.", '포기하지 마! 짧게 해 봐. 20분만 해도 도움 돼.'),
      B("That's a good idea. I'll give it a shot.", '좋은 생각이다. 한번 해 볼게.'),
    ],
  },
  {
    id: 'visit',
    title: '친구 집에 놀러 가기',
    expressions: ['mind', 'chill', 'stick around', 'head out'],
    lines: [
      A('Host', 'Come on in! Make yourself at home.', '들어와! 편하게 있어.'),
      B('Thanks! Do you mind if I take off my jacket?', '고마워! 재킷 좀 벗어도 될까?'),
      A('Host', "Of course not. We're just having a chill night tonight.", '당연하지. 오늘은 그냥 편하게 노는 거야.'),
      B('I love the vibe of your place. It feels so cozy.', '너네 집 분위기 너무 좋다. 진짜 아늑해.'),
      A('Host', 'Thanks! Can you stick around for dinner?', '고마워! 저녁 먹고 갈 수 있어?'),
      B("I'd love to, but I have to head out by eight.", '그러고 싶은데 8시까지는 나가 봐야 해.'),
    ],
  },
  {
    id: 'shop',
    title: '수상한 가게',
    expressions: ['check out', 'sketchy', 'legit', 'come across'],
    lines: [
      A('Dana', 'I came across a website that sells sneakers for half price.', '운동화를 반값에 파는 사이트를 우연히 찾았어.'),
      B('Half price? That sounds kind of sketchy.', '반값? 좀 수상한데.'),
      A('Dana', "I know, but the reviews look legit.", '그치, 근데 후기는 진짜 같아 보여.'),
      B('Let me check it out. What is it called?', '나도 한번 볼게. 이름이 뭐야?'),
      A('Dana', "I'll send you the link. Tell me what you think.", '링크 보내 줄게. 어떤지 말해 줘.'),
      B("Honestly, if it's too good to be true, it probably is.", '솔직히 너무 좋아 보이면 대개 사기더라.'),
    ],
  },
  {
    id: 'comfort',
    title: '친구 위로하기',
    expressions: ['calm down', 'cheer up', 'get over', 'mess up'],
    lines: [
      A('Taylor', 'I totally messed up my interview today.', '오늘 면접 완전 망쳤어.'),
      B('Oh no. Calm down and tell me what happened.', '저런. 진정하고 무슨 일인지 말해 봐.'),
      A('Taylor', 'I froze on the first question. It was so awkward.', '첫 질문에서 얼어 버렸어. 너무 어색했어.'),
      B("Hey, it's no big deal. Everyone has bad days.", '야, 별일 아니야. 누구나 그런 날 있어.'),
      A('Taylor', "I know. I just can't get over it.", '알아. 그냥 계속 마음에 걸려.'),
      B('Cheer up. Let me buy you dinner tonight.', '기운 내. 오늘 저녁은 내가 살게.'),
    ],
  },
  {
    id: 'deadline',
    title: '마감 마무리하기',
    expressions: ['wrap up', 'go over', 'nail', 'overwhelmed'],
    lines: [
      A('Manager', 'Can we wrap up the report by tomorrow?', '보고서 내일까지 마무리할 수 있을까요?'),
      B("I think so. I'm a little overwhelmed, but it's almost done.", '될 것 같아요. 좀 벅차긴 한데 거의 다 했어요.'),
      A('Manager', "Great. Let's go over it together this afternoon.", '좋아요. 오후에 같이 검토해 봐요.'),
      B('Sounds good. Is three convenient for you?', '좋아요. 3시 괜찮으세요?'),
      A('Manager', 'Three works. By the way, you nailed the client meeting.', '3시 좋아요. 그런데 고객 미팅 정말 잘했어요.'),
      B("Thanks! That means a lot. I won't let you down.", '감사합니다! 큰 힘이 되네요. 실망시키지 않을게요.'),
    ],
  },
  {
    id: 'groceries',
    title: '장 보러 가기',
    expressions: ['run out of', 'pick up', 'crave', 'grab'],
    lines: [
      A('Roommate', "We've run out of eggs again.", '계란 또 다 떨어졌어.'),
      B("I'll pick some up on my way home.", '집에 오는 길에 사 올게.'),
      A('Roommate', 'Thanks! Could you grab some ice cream too?', '고마워! 아이스크림도 좀 사 올 수 있어?'),
      B('Ha, are you craving something sweet again?', '하하, 또 단 거 당겨?'),
      A('Roommate', "Always. I'm obsessed with that chocolate one.", '항상 그렇지. 그 초콜릿 맛에 완전 빠졌어.'),
      B("Got it. I'll text you if they're out of it.", '알았어. 없으면 문자할게.'),
    ],
  },
  {
    id: 'meeting',
    title: '아이디어 회의',
    expressions: ['come up with', 'bring up', 'basically', 'figure'],
    lines: [
      A('Teammate', 'Did anyone come up with a name for the new app?', '새 앱 이름 생각해 낸 사람 있어요?'),
      B('I have one idea, but it might sound a little cheesy.', '하나 있는데 좀 오글거릴 수도 있어요.'),
      A('Teammate', "That's okay. Go ahead and bring it up.", '괜찮아요. 편하게 말해 봐요.'),
      B("Basically, it's a word that means 'see it again.'", "한마디로 '다시 본다'는 뜻의 단어예요."),
      A('Teammate', "I like that. I figured we'd need something simple.", '좋은데요. 단순한 게 필요하다고 생각했거든요.'),
      B("Great. Let's go over it with the team tomorrow.", '좋아요. 내일 팀이랑 같이 검토해 봐요.'),
    ],
  },
];

export const dialogues: Dialogue[] = [...baseDialogues, ...moreDialogues];
