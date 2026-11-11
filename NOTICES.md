# 출처와 라이선스 고지

링고루프의 영단어 덱은 아래 공개 자료를 바탕으로 만들었습니다.

## FrequencyWords (OpenSubtitles 영어 자막 빈도 목록)

- 출처: https://github.com/hermitdave/FrequencyWords
- 라이선스: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0) — https://creativecommons.org/licenses/by-sa/4.0/
- 원본 자료: OpenSubtitles 자막 (https://www.opensubtitles.org)
- **변경 내용**: 빈도 목록을 원형(lemma) 기준으로 묶어 순위를 다시 매겼고, 관사·대명사 같은 기초 기능어, 감탄사, 인명, 비속어를 뺐습니다. 그 위에 품사, 한국어 뜻, 예문, 예문 해석을 직접 덧붙였습니다. (`src/data/frequency/`)
- 이 변경본(`src/data/frequency/`의 단어 순위·구성)은 같은 조건인 CC BY-SA 4.0으로 공유합니다.

## CMU Pronouncing Dictionary (CMUdict)

- 출처: https://github.com/cmusphinx/cmudict
- 저작권: Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.
- 라이선스: BSD 방식의 허용 라이선스 — 저작권 고지와 조건, 면책 문구를 함께 표기해야 합니다. 전문은 아래와 같고, 앱의 설정 > 출처·라이선스에도 같은 전문이 들어 있습니다(`src/data/licenses.ts`).
- **변경 내용**: 미국식 발음(ARPAbet)을 IPA 발음기호로 변환해 카드에 넣었습니다.

```
Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
   The contents of this file are deemed to be source code.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in
   the documentation and/or other materials provided with the
   distribution.

This work was supported in part by funding from the Defense Advanced
Research Projects Agency, the Office of Naval Research and the National
Science Foundation of the United States of America, and by member
companies of the Carnegie Mellon Sphinx Speech Consortium. We acknowledge
the contributions of many volunteers to the expansion and improvement of
this dictionary.

THIS SOFTWARE IS PROVIDED BY CARNEGIE MELLON UNIVERSITY ``AS IS'' AND
ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL CARNEGIE MELLON UNIVERSITY
NOR ITS EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## 영어 음성

- 앱에 들어 있는 영어 발음 음성은 Google Cloud Text-to-Speech(Chirp 3 HD, 음성 Aoede와 Charon)로 만든 **합성 음성**입니다. 사람이 녹음한 것이 아닙니다.
- 음성 파일은 미리 만들어 앱에 포함했고, 앱을 쓰는 동안 외부 서버를 부르지 않습니다.

## 그 밖에 직접 만든 콘텐츠

구동사, 문장, 대화문과 모든 한국어 뜻·예문 해석은 이 앱을 위해 새로 쓴 것입니다.

## 글꼴

- Space Grotesk, IBM Plex Sans KR — SIL Open Font License 1.1 (`@expo-google-fonts`로 제공)
