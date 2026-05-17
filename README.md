# 캐릭터 여행 여권 만들기 ✈️
### Character Travel Passport Maker

> 전 세계 어린이들이 자신의 캐릭터(마스코트)를 가상으로 여행 보낼 수 있는 창작형 웹 에디터

---

## 소개

캐릭터의 프로필과 여행 스탬프를 한 화면에서 꾸며, 나만의 여권 이미지를 만드는 교육용 창작 웹앱입니다.  
서버 없이 브라우저만으로 동작하므로 네트워크 환경이 열악한 교실에서도 바로 사용할 수 있습니다.

---

## 주요 기능

- **테마 색상 선택** — 블루 / 레드 / 그린 / 브라운 4가지 테마
- **캐릭터 정보 입력** — 사진 업로드, 이름, 생일, 소속/국적, 좋아하는 것
- **이모지 여행 스탬프** — 랜덤 위치·각도·색상으로 스탬프 추가, 마우스 오버 시 삭제
- **다국어 지원** — 한국어 · English · 日本語 · Bahasa Indonesia
- **JSON 저장 / 불러오기** — 사진 포함 전체 작업 상태 저장 및 복원
- **PNG 이미지 저장** — html2canvas 기반 고품질 이미지 다운로드
- **MRZ 코드** — ICAO TD3 형식 기반의 장식용 기계 판독 코드 자동 생성
- **워터마크** — `NOT AN OFFICIAL DOCUMENT / KIDS PLAY PASSPORT` 자동 표시

---

## 스택

| 영역 | 기술 |
|---|---|
| 런타임 | Node.js 24, TypeScript 5.9 |
| 패키지 관리 | pnpm workspaces |
| 프론트엔드 | React 19 + Vite + Tailwind CSS |
| 폰트 | Black Han Sans (Google), Pretendard GOV (jsdelivr CDN) |
| 아이콘 | Google Material Symbols Outlined (CDN) |
| 이미지 저장 | html2canvas |
| 백엔드 | 없음 (완전 클라이언트 사이드) |

---

## 실행 방법

```bash
# 의존성 설치
pnpm install

# 프론트엔드 개발 서버 실행
pnpm --filter @workspace/passport-maker run dev

# API 서버 실행 (포트 8080)
pnpm --filter @workspace/api-server run dev

# 전체 타입 검사
pnpm run typecheck

# 전체 빌드
pnpm run build
```

---

## 프로젝트 구조

```
artifacts/passport-maker/src/
├── pages/PassportMaker.tsx     # 메인 페이지 (상태 + 레이아웃)
├── components/
│   ├── Sidebar.tsx             # 에디터 패널
│   ├── PassportProfile.tsx     # 프로필 여권 뷰
│   └── PassportStamps.tsx      # 스탬프 여권 뷰
└── lib/
    ├── i18n.ts                 # 4개국어 번역
    ├── utils.ts                # MRZ 생성, 스탬프 유틸
    └── types.ts                # 공유 타입 정의
```

---

## 기획 모티브

> 모티브: 영화 **〈패딩턴: 페루에 가다!〉** *(Paddington in Peru, 2024, 감독: Dougal Wilson)*  
> — 패딩턴이 영국으로부터 정식 여권을 발급받는 장면

이 장면에서 영감을 받아, 어린이들이 자신만의 캐릭터(마스코트)에게 여권을 만들어 주고 세계 여행을 떠나보내는 창의적 스토리텔링 경험을 교육 현장에 적용하였습니다.

**기획·개발:** 교육뮤지컬 꿈꾸는 치수쌤  
**아이디어를 활용하거나 참고할 경우, 반드시 출처를 밝혀 주세요.**  
무단 복제·상업적 이용은 정중히 사양합니다.

---

## 안전 및 법적 고지

- 모든 사진·데이터는 브라우저 메모리 내에서만 처리되며, 서버로 전송되지 않습니다.
- 실제 여권과의 혼동 방지를 위해 워터마크가 자동 삽입됩니다.
- 본 앱은 교육·창작 목적으로 제작된 놀이용 여권 생성 도구입니다.

---

## 개발자 정보

| | |
|---|---|
| **개발자** | 교육뮤지컬 꿈꾸는 치수쌤 |
| **문의** | [litt.ly/chichiboo](https://litt.ly/chichiboo) |
| **카테고리** | 인문·창작 / 교육 |
| **개발연도** | 2026 |

---

*이 프로젝트의 아이디어와 기획은 개발자의 창의적 노력의 결과물입니다. 아이디어를 존중해 주셔서 감사합니다.*
