# App Review 답변 자료 (Guideline 2.1 — Information Needed)

심사팀이 요청한 정보입니다. **앱 코드는 바꿀 필요 없이** 아래 3가지를 하면 돼요.

1. **화면 녹화 영상**을 실기기에서 찍는다(직접 해야 함) → 아래 "녹화 시나리오"
2. App Store Connect의 **앱 심사 정보 → 메모(Notes)**에 아래 영문 메모를 붙여 넣는다(영상은 첨부 또는 링크)
3. **재제출**한다

## 1. 녹화 시나리오 (2~3분, 실제 iPhone, 최신 iOS)

요건: 앱 실행부터 시작해서 일반적인 사용 흐름을 보여 줄 것. 계정·UGC·유료 기능은 이 앱에 없으니 "없음"을 메모에 적으면 됨.

iPhone에서 제어 센터의 **화면 기록**을 켜고(소리 포함 권장) 아래 순서로 진행하세요.

1. 홈 화면에서 **링고루프 앱 아이콘을 눌러 실행**(첫 화면부터 녹화)
2. 홈 — "처음이세요?" 안내(새 설치 상태라면) → **영단어 1세트 시작하기**
3. 학습 카드: **뜻 보기** → **발음 듣기**(소리가 나도록 볼륨을 켬) → 예문 옆 스피커 → **알아요** / **다시 볼래요** → 위쪽 **되돌리기** 아이콘으로 직전 채점 취소
4. 뒤로 → 세트 목록 → **퀴즈**: 문제 2~3개 풀기(정답·오답 표시 보여 주기)
5. **덱** 탭 → **대화문** → 한 편 열기 → 말풍선 탭, **표현 칩**을 눌러 뜻·예문 보기, **전체 듣기**
6. **기록** 탭(연속 학습일, 최근 7일)
7. **설정** → 복습 알림 켜기(권한 팝업이 뜨면 허용) → 백업·데이터 → **백업 내보내기** 공유 시트 → 출처·라이선스 페이지
8. **비행기 모드**를 켠 채로 학습 카드의 발음 듣기가 재생되는 것(오프라인 동작)을 보여 주고 마무리

촬영 팁: 학습 기록이 비어 있는 새 설치 상태에서 시작하면 첫 실행 안내부터 보여 줄 수 있어요. 영상은 파일로 첨부하거나(App Review Information의 첨부 칸이 있으면), 없으면 비공개(링크가 있는 사람만) 링크를 메모에 적으세요. **링크는 심사가 끝날 때까지 열어 두세요.**

## 2. 붙여 넣을 메모 (영문)

```
Thank you for the review. Below is the information requested for Guideline 2.1.

1) SCREEN RECORDING
A screen recording captured on a physical iPhone (latest iOS) is attached to this submission in the App Review Information attachment field. It starts from launching the app and shows the typical flow: onboarding hint, flashcard study, quiz, dialogues, stats, settings (reminder permission, backup export, licenses) and offline playback in airplane mode. The app has NO account registration, login, account deletion, user-generated content, or paid content/features, so those flows do not exist.

2) PURPOSE AND TARGET AUDIENCE
"Lingoloop - English" (링고루프) is an offline English study app for Korean-speaking learners (the UI is in Korean). Problem: learners forget what they study. The app lets them review cards repeatedly (rounds of 50 cards; only unknown cards return in the next round) with spaced repetition (1, 3, 7, 14, 30 days) and quizzes. Content: 2,072 vocabulary words, 100 phrasal verbs, 500 sentences and 50 six-line dialogues, each with Korean meanings, examples and bundled audio. Audience: teens and adults studying conversational English. Free, no ads, no in-app purchases, no account, no data collection.

3) ACCESSING THE MAIN FEATURES (no login or sample files needed)
Tabs: Home (홈), Decks (덱), Stats (기록), Settings (설정).
- Study: Decks > Vocabulary (영단어) > "암기" (Study) on a set. Tap "뜻 보기" (Show meaning); "발음 듣기" plays audio; "알아요" = I know it, "다시 볼래요" = Review again; the arrow icon on the card undoes the last answer.
- Quiz: Decks > a deck > "퀴즈" on a set.
- Dialogues: Decks > Dialogues (대화문) > open one; tap bubbles to reveal text, tap an expression chip for its meaning, "전체 듣기" plays all lines.
- Review: Home > "오늘의 복습" (today's review) cards.
- Settings: goals, set size, speech speed, optional daily reminder (a local notification; the permission prompt appears only when the user turns it on), theme/text size, "백업·데이터" (backup export/import, erase records), "출처·라이선스" (sources and licenses), privacy and support links.

4) EXTERNAL SERVICES AND TOOLS
Fully offline; no backend. At runtime the app calls no third-party API, analytics, advertising, authentication, payment or AI service.
- Pronunciation audio: generated during development with Google Cloud Text-to-Speech (Chirp 3 HD) and bundled as mp3 files; if a file is missing, the iOS built-in speech synthesizer (expo-speech) is used.
- Local notifications (expo-notifications); on-device storage (AsyncStorage); nothing is sent to a server.
- Built with Expo / React Native and EAS Build.
- Static pages only (privacy policy, support) on GitHub Pages: https://seongholim-11.github.io/English-Sentence/privacy/ and .../support/

5) REGIONAL DIFFERENCES
None. Features and content are identical in all regions; the UI language is Korean only.

6) REGULATED INDUSTRY / PROTECTED MATERIAL
Not a regulated industry. Example sentences, dialogues and Korean translations are original. Word selection and IPA are based on open data under their licenses, with attributions shown in the app (Settings > 출처·라이선스): FrequencyWords (CC BY-SA 4.0), CMU Pronouncing Dictionary (CMU license), fonts under the SIL Open Font License. No documentation or credentials are required.
```

(영상은 **파일로 첨부**하므로 메모에는 링크를 넣지 않아요. 영문 메모는 약 3,200자로, 메모 칸의 4,000자 한도 안에 들어가요(한도는 App Store Connect 화면 기준으로 확인).)

## 3. 제출 순서

1. 영상을 찍고(위 시나리오) 파일이나 링크를 준비한다.
2. App Store Connect → 앱 → **앱 심사 → 앱 심사 정보 → 메모**에 위 영문을 붙여 넣고 링크를 채운다. 영상 첨부 칸이 있으면 파일을 올린다.
3. 해결 센터(Resolution Center)에 이 심사 메시지가 있으면 짧게 답변한다: "I have added the requested information and a screen recording to the App Review Information notes. Please let me know if anything else is needed."
4. 필요하면 **다시 심사 제출(Resubmit)** 을 누른다.

## 4. 메모에 쓴 사실 확인

- 계정·로그인·UGC·유료 기능 없음, 광고·분석·서버 전송 없음 — 코드에 해당 기능이 없음.
- 음성: `assets/audio`의 mp3(Google Cloud TTS Chirp 3 HD 생성) 우선 재생, 실패 시 `expo-speech`.
- 알림 권한은 설정에서 복습 알림을 켤 때만 요청, 기본은 꺼짐.
- 수량(2,072 / 100 / 500 / 50)은 현재 데이터 기준 — 콘텐츠를 바꾸면 숫자도 바꿀 것.
- 심사팀이 한국어를 못 읽을 수 있어서 화면 이름을 영문으로 병기했어요.
