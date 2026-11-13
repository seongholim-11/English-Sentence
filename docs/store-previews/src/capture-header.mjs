// 앱스토어 제품 페이지 헤더(21:9, 3840x1646)와 검색 결과(3:2, 3840x2560) 이미지를 JPEG로 저장한다 (알파 채널 없음).
// ego-browser: ego-browser nodejs -e "await import('file:///.../capture-header.mjs')"
import fs from "node:fs";
const ROOT = "D:/personal_project/English-Sentence/docs/store-previews/";
const task = await taskSpace("header search artwork");
const page = task.page("p1");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [kind, W, H, out] of [["header", 3840, 1646, "header-3840x1646"], ["search", 3840, 2560, "search-result-3840x2560"], ["universal", 5244, 2950, "universal-5244x2950"]]) {
  for (const debug of [false, true]) {
    await page.cdp("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await page.goto(`file:///D:/personal_project/English-Sentence/docs/store-previews/src/header.html?kind=${kind}${debug ? "&debug=1" : ""}`);
    await page.evaluate(() => document.fonts.ready);
    await sleep(600);
    const r = await page.cdp("Page.captureScreenshot", { format: "png", fromSurface: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    fs.writeFileSync(ROOT + (debug ? `header-search/_check-${kind}.png` : `header-search/_raw-${out}.png`), Buffer.from(r.data, "base64"));
  }
}
console.log("ok");
