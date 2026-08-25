# MorsePath

> 점과 선을 따라 배우는 인터랙티브 모스 부호 학습 앱

[![CI](https://github.com/jeiel85/morse-path/actions/workflows/ci.yml/badge.svg)](https://github.com/jeiel85/morse-path/actions/workflows/ci.yml)
[![Live demo](https://img.shields.io/badge/live%20demo-MorsePath-7ee0b5?style=flat&labelColor=10151b)](https://jeiel85.github.io/morse-path/)

MorsePath는 시각적인 모스 트리와 소리 기반 연습을 함께 제공하는 웹 앱입니다. 영문 국제 모스 부호와 한글 자모 모스 부호를 지원하며, 브라우저에서 바로 탐색·해독·인코딩·연습·키잉을 할 수 있습니다.

## 바로 사용하기

- **Live demo:** <https://jeiel85.github.io/morse-path/>
- **Repository:** <https://github.com/jeiel85/morse-path>

## 주요 기능

| 모드 | 설명 |
| --- | --- |
| **탐색 (Explore)** | 점과 선으로 구성된 SVG 모스 트리를 클릭하거나 키보드로 탐색합니다. |
| **해독 (Decode)** | 점·선을 입력해 문자를 만들고 결과 텍스트를 누적합니다. |
| **인코딩 (Encode)** | 텍스트를 문자별 모스 부호로 변환하고 전체 메시지를 재생합니다. |
| **연습 (Practice)** | 모스 소리를 듣고 문자를 입력해 정답률을 확인합니다. |
| **키어 (Keyer)** | 짧은 탭은 점, 긴 누르기는 선으로 입력해 실제 키잉을 연습합니다. |

공통으로 다음 기능을 사용할 수 있습니다.

- English / 한국어 모드 전환
- Web Audio 기반 점·선 음 재생
- WPM, 음량, 톤 주파수 설정
- 키보드·터치·포인터 입력과 포커스 스타일
- localStorage 기반 설정 저장
- PWA manifest와 Service Worker를 통한 오프라인 캐시
- GitHub Actions 기반 테스트·빌드·GitHub Pages 배포

## 입력 방법

### 탐색

- `←` : 점 추가
- `→` : 선 추가
- `Enter` : 현재 부호 재생
- `Backspace` : 경로 한 단계 되돌리기

### 해독

- **점 / 선** 버튼으로 부호를 입력합니다.
- `Space` 또는 **확인** 버튼으로 문자를 결과에 추가합니다.

### 키어

- 짧게 누르기: 점 (`·`)
- 길게 누르기: 선 (`−`)
- 잠시 멈추기: 문자 완성
- `Space` 키도 키어 입력으로 사용할 수 있습니다.

## 지원 데이터

- 국제 모스 부호: A–Z, 0–9, 주요 문장 부호
- 한글 모스 부호: 기본 자음·모음과 숫자
- 한글 음절: Unicode 초성·중성·종성 조합 및 분해
- 모스 트리: 각 알파벳의 부호를 점(왼쪽)·선(오른쪽) 가지로 구성

핵심 엔진은 React와 분리되어 있어 단위 테스트와 향후 Capacitor 셸 재사용을 고려한 구조입니다.

## 기술 스택

- React 19
- TypeScript 6
- Vite 8
- Web Audio API
- Vitest
- Oxlint
- GitHub Actions / GitHub Pages

## 로컬 실행

```sh
npm install
npm run dev
```

개발 서버를 실행한 뒤 표시되는 주소를 브라우저에서 엽니다.

### 검증 명령

```sh
npm run build   # TypeScript 검사 및 production build
npm test        # MorseEngine / HangulComposer 단위 테스트
npm run lint    # Oxlint
```

현재 단위 테스트는 MorseEngine과 HangulComposer를 중심으로 구성되어 있습니다.

## 프로젝트 구조

```text
src/
├─ app/                    앱 셸, 모드 전환, 언어 전환
├─ core/
│  ├─ morse/               모스 타입, 영문·한글 데이터, 엔진
│  └─ hangul/              한글 음절 조합·분해
├─ audio/                  Web Audio 톤 어댑터
├─ components/MorseTree/   인터랙티브 SVG 모스 트리
├─ features/               Explore / Decode / Encode / Practice / Keyer
├─ settings/               버전 관리 localStorage 설정
├─ styles/                 공통 다크 테마 스타일
└─ ui/                     영문·한글 화면 문구
public/
├─ manifest.json           PWA 메타데이터
└─ sw.js                   오프라인 캐시 Service Worker
.github/workflows/         CI 및 Pages 배포 workflow
```

## 배포

`main` 브랜치에 push하면 다음 workflow가 실행됩니다.

1. `ci.yml`: install → lint → build → test
2. `deploy.yml`: production build → GitHub Pages artifact 업로드 → 배포

GitHub Pages의 프로젝트 경로(`/morse-path/`)를 위해 Vite base path와 PWA 자산 경로가 함께 설정되어 있습니다.

## 로드맵

- [x] 영문·한글 모스 데이터와 핵심 엔진
- [x] 한글 Unicode 조합·분해
- [x] 인터랙티브 트리와 5개 학습 모드
- [x] Web Audio, 설정 저장, PWA
- [x] CI 및 GitHub Pages 자동 배포
- [ ] Capacitor 기반 Android 셸

## 라이선스

현재 저장소에는 별도 라이선스 파일이 포함되어 있지 않습니다. 재사용 또는 배포가 필요하다면 라이선스 정책을 먼저 확정해 주세요.

<!-- hermes-agent connectivity test 2026-08-25 -->
