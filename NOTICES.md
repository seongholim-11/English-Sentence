# 출처와 라이선스 고지

다시봄의 영단어 덱은 아래 공개 자료를 바탕으로 만들었습니다.

## FrequencyWords (OpenSubtitles 영어 자막 빈도 목록)

- 출처: https://github.com/hermitdave/FrequencyWords
- 라이선스: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0) — https://creativecommons.org/licenses/by-sa/4.0/
- 원본 자료: OpenSubtitles 자막 (https://www.opensubtitles.org)
- **변경 내용**: 빈도 목록을 원형(lemma) 기준으로 묶어 순위를 다시 매겼고, 관사·대명사 같은 기초 기능어, 감탄사, 인명, 비속어를 뺐습니다. 그 위에 품사, 한국어 뜻, 예문, 예문 해석을 직접 덧붙였습니다. (`src/data/frequency/`)
- 이 변경본(`src/data/frequency/`의 단어 순위·구성)은 같은 조건인 CC BY-SA 4.0으로 공유합니다.

## CMU Pronouncing Dictionary (CMUdict)

- 출처: https://github.com/cmusphinx/cmudict
- 저작권: Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.
- 라이선스: BSD 방식의 허용 라이선스 — 저작권 고지와 조건, 면책 문구를 함께 표기해야 합니다. 전문은 위 저장소의 LICENSE 파일을 따릅니다.
- **변경 내용**: 미국식 발음(ARPAbet)을 IPA 발음기호로 변환해 카드에 넣었습니다.

## 영어 음성

- 앱에 들어 있는 영어 발음 음성은 Google Cloud Text-to-Speech(Chirp 3 HD, 음성 Aoede와 Charon)로 만든 **합성 음성**입니다. 사람이 녹음한 것이 아닙니다.
- 음성 파일은 미리 만들어 앱에 포함했고, 앱을 쓰는 동안 외부 서버를 부르지 않습니다.

## 그 밖에 직접 만든 콘텐츠

구동사, 문장, 대화문과 모든 한국어 뜻·예문 해석은 이 앱을 위해 새로 쓴 것입니다.

## 글꼴

- Space Grotesk, IBM Plex Sans KR — SIL Open Font License 1.1 (`@expo-google-fonts`로 제공)
