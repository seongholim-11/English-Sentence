# 링고루프 iPad 13인치 미리보기

최종 PNG: `../ipad-13/01-loop.png`, `02-cards.png`, `03-review.png`, `04-study.png`, `05-decks.png`, `06-quiz.png`, `07-dialogue.png`, `08-stats.png`.
모두 2064×2752 px. `../index-ipad.html`에서 원본 8장을 열 수 있다.
전체 보기: `../overview-ipad.png`. 01–02 연결 보기: `../pair-check-ipad.png` (4128×2752).

## 재현

1. 프로젝트 루트에서 `node docs/store-previews/src/build-ipad.mjs` 실행.
2. `capture-ipad-01.mjs`는 ego-browser로 2064×2752, deviceScaleFactor 1, clip.scale 1 캡처. 새로운 제작 세션에서는 TaskSpace 이름을 새 작업에 맞게 정한다.
3. `validate-ipad-02.mjs`는 같은 TaskSpace를 재사용하여 연결 이미지, 전체 보기, 검증 보고서 생성.
4. 최종 육안 확인 후 `finish-ipad-03.mjs`로 TaskSpace 종료.

`build-ipad.mjs`는 기존 `build.mjs`를 읽어 폰트·색상·문구·장식 구조를 재사용하고 iPad용 HTML만 별도로 출력한다. 원본 iPhone 소스와 PNG를 덮어쓰지 않는다.
IBM Plex Sans KR / Space Grotesk 글꼴과 실제 iPad 스크린샷을 데이터 URL로 포함하며 AI 이미지 생성은 사용하지 않는다.
태블릿은 CSS로 그린 일반적인 둥근 모서리 검은 베젤이다. 앱 스크린샷은 3:4 비율을 유지한 object-fit:cover로 넣고, 좌우 여백을 그대로 보존한다.

## 확인 결과

- 최종 8장과 01–02 연결 이미지 육안 확인.
- 8장 크기 2064×2752, 폰트 로딩·이미지 디코딩 성공, 헤드라인·부제 가로 넘침 없음.
- 헤드라인·부제는 기존 iPhone HTML과 DOM 텍스트 비교 일치. 글자 크기와 자간은 2064/1320 비율 적용, 줄바꿈과 강조색 유지.
- 01–02 경계 16px 폭을 연속 4128px 렌더링과 비교: 208개 채널 차이, 최대 1/255. 육안상 연결 어긋남 없음.
- 02 칩 영역과 기울어진 태블릿 바운딩 박스 사이 약 238px 여유.
- 07 원본 iPad 스크린샷에는 잘린 검은 말풍선 조각이 없어 덮개를 적용하지 않음.
- iPhone PNG 8장의 전후 SHA256 해시 일치.
- 실제 앱의 가운데 열 UI 때문에 iPad 화면 내부 여백이 넓고 글자가 작게 보임. 화면을 늘리거나 잘라 바꾸지 않음.
- 01–02 태블릿 하단은 의도적으로 캔버스 밖으로 잘림. 03–08은 태블릿과 화면 전체를 유지.
- 작업은 docs/store-previews/ 내부에서만 수행. 커밋·푸시 없음.

세부 결과는 `validation-ipad.json`, `ipad-render-checks.json` 참조.
