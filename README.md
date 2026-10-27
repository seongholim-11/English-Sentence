# 다시봄 — 영어 회독 앱

원어민이 일상 회화에서 자주 쓰는 **단어**와 **구동사**를 카드로 외우고, 그 표현으로 만든 **문장**과 **대화문**으로 복습하는 React Native(Expo) 앱입니다.

## 콘텐츠

| 덱 | 내용 | 수 |
| --- | --- | --- |
| 영단어 | 영화·드라마 대사 빈도순 회화 단어 + literally, swamped 같은 회화 단어 · 발음기호 · 예문 | 2,072장 |
| 구동사 | put off, figure out, run into, catch up 같은 구동사 · 예문 | 100장 |
| 문장 | 한국어를 보고 영어로 말해 보기 (위 단어·구동사 활용) | 500장 |
| 대화문 | 상황별 6줄 대화, 영어/한국어 가리기 | 50편 |

콘텐츠는 `src/data/decks.ts`, `src/data/dialogues.ts`에 있어서 카드를 쉽게 추가할 수 있습니다.

영단어 덱의 빈도순 단어는 `src/data/frequency/part1~4.ts`에 `[단어, 품사, 발음기호, 뜻, 예문, 예문 해석]` 형식으로 들어 있습니다.
단어 선정은 OpenSubtitles 영어 자막 빈도 목록([FrequencyWords](https://github.com/hermitdave/FrequencyWords))을 원형 기준으로 묶어 순위를 매기고,
관사·대명사 같은 기초 기능어, 감탄사, 인명, 비속어는 뺐습니다. 발음기호는 [CMU 발음 사전](https://github.com/cmusphinx/cmudict)의 미국식 발음을 IPA로 변환했습니다.

## 학습 방식

- 영단어·구동사·문장 덱은 50장씩 세트로 나뉩니다. 덱을 누르면 세트 목록이 스크롤 없이 한 화면에 보입니다. (구동사 2세트, 문장 10세트)
- 카드를 탭하면 뜻과 예문이 나옵니다. **알아요 / 다시 볼래요**로 채점합니다.
- 세트 한 바퀴(회독)가 끝나면 **다시 볼 카드만** 다음 회독에 남습니다.
- 대화문은 영어 또는 한국어를 가리고, 말풍선을 탭해서 하나씩 확인합니다.
- 스피커 버튼이나 대화 말풍선을 누르면 영어 발음을 들려줍니다 (`expo-speech`).
- 회독 진행, 오늘 본 카드 수, 연속 학습일은 기기에 저장됩니다 (AsyncStorage).

## 실행

```bash
npm install
npm start          # Expo Go 앱으로 QR 코드를 스캔
npm run web        # 브라우저에서 보기
npm run typecheck
```

## 구조

```
App.tsx                  화면 전환, 폰트 로딩
src/theme.ts             디자인 색상 토큰, 하루 목표
src/progress.ts          회독·진도 저장 로직
src/data/                단어·구동사·문장·대화문 데이터
src/components/          공통 텍스트(폰트), 아이콘, 버튼
src/screens/             홈 · 세트 목록 · 학습 · 대화문 · 회독 완료
```

디자인은 첨부된 HTML 시안(홈, 학습 앞면, 뜻 보기, 대화문, 회독 완료)을 그대로 옮겼습니다. 폰트는 Space Grotesk와 IBM Plex Sans KR을 씁니다.
