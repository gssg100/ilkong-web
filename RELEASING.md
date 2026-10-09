# 일콩 기록 웹 릴리스 정책

**2026-10-09부터 적용.** 업그레이드마다 **사이트에 버전·한국시간 날짜·변경내역을 반드시 명시**한다. 사용자에게 배포된 시점을 쉽게 확인할 수 있도록 페이지 진입 전 로그인 화면, 앱 상단, 설정 화면에 최신 정보를 표시한다.

## 반드시 함께 갱신하는 항목

1. `index.html`: `var VERSION`, `var RELEASE_INFO`의 `version`, `date` (형식 `YYYY-MM-DD`, Asia/Seoul), 최신 `notes`와 최근 변경 `history`. 로그인/앱 상단/설정의 **정적 HTML 버전·날짜** 및 `<meta name="ilkong-release-version">`, `<meta name="ilkong-release-date">`도 동기화한다. 새 버전을 릴리스할 때 이전 항목을 history에 옮긴다.
2. `package.json`: `version`.
3. `sw.js`: 주석의 릴리스 버전·한국시간 날짜 및 `CACHE` 키.
4. `refresh.html`: 버전·한국시간 날짜 설명과 갱신 대상 쿼리, 서비스워커 등록 버전.
5. GitHub `main`에 배포한 뒤 **실제 사이트 HTML**에 올바른 릴리스 버전과 날짜가 표시되는지 확인한다. GitHub Pages 전파 중에는 이전 버전이 나올 수 있으며, 이때는 완료로 선언하지 않는다.

## 검증

```shell
npm run verify:release
```

기본 릴리스 검증과 함께 `scripts/verify-release-metadata.mjs`가 버전 정합성, ISO 날짜·KST, 로그인/상단 날짜 표시, 변경내역, HTML meta, SW·refresh·package 버전, 이전 커밋 대비 버전 증가를 검사한다. GitHub Actions는 직전 커밋 비교를 위해 checkout 깊이 2를 사용한다. 앱 화면이나 PWA 파일을 수정했는데 버전 증가를 빼먹으면 릴리스 검증이 실패해야 한다.

**릴리스 날짜는 코드를 쓰기 시작한 날짜가 아니라 실제 배포하는 한국시간 날짜**로 기록한다. 배포가 다음 날로 지연되면 최종 배포 전에 날짜를 갱신하고 다시 검증한다.

## 배포의 의미

사이트의 `업데이트일`은 해당 웹 화면 릴리스 기준일이다. Edge API 배포나 Android APK 빌드/설치 완료를 의미하지 않는다. 운영 반영 여부는 GitHub Pages 배포 결과와 실제 화면 응답을 따로 확인한다. 배포 이후 문제 발견 시 롤백도 **새 버전·새 날짜·롤백 사유**로 기록한다.
