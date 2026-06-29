# Playwright Test Framework

Playwright로 웹 페이지를 자동 테스트할 때, 코드를 어떻게 짜야 나중에 덜 고생하는지 정리해 둔 예제 프로젝트입니다.

> TypeScript + [`@playwright/test`](https://playwright.dev/) · Page Object Model + fixtures · chromium / firefox / webkit

## 왜 만들었나

테스트를 한 번 짜는 건 어렵지 않습니다. 진짜 일은 그다음입니다. 화면 문구가 바뀌고, 가격이 바뀌고,
버튼 위치가 조금 흔들릴 때마다 테스트가 우수수 깨지면, 결국 아무도 손대기 싫은 코드가 됩니다.

그래서 이 프로젝트는 "테스트를 어떻게 짜느냐"보다 **"어떻게 짜야 오래 가느냐"**에 초점을 뒀습니다.
아래의 구조와 규칙을 새 프로젝트에 그대로 옮겨 출발점으로 삼을 수 있도록, 실제로 돌아가는 형태로 만들어 뒀습니다.

같은 패턴을 성격이 다른 두 대상에 똑같이 적용했습니다. 특정 사이트에서만 통하는 요령이 아니라는 걸 보여 주려는 의도입니다.

- 인터넷 없이도 도는 **자체 데모 앱**
- 실제로 운영 중인 **공개 사이트(SauceDemo)**

## 설계 — 이렇게 짠 이유

### 1. Page Object Model — 화면을 객체 하나로

화면마다 클래스를 하나 둡니다. 그 화면의 셀렉터와 동작은 모두 이 클래스 안에만 적습니다.
이렇게 해 두면 UI가 바뀌어도 테스트를 뒤질 필요 없이 페이지 객체 한 곳만 고치면 됩니다.

테스트 코드에는 `inventoryPage.addItemByIndex(0)`처럼 "무엇을 하는지"만 남고, 지저분한 셀렉터 문자열은 드러나지 않습니다.
여러 화면이 공유하는 헤더·푸터(장바구니 배지, 햄버거 메뉴, 푸터 링크)는 `SauceBasePage`에 모아 두고 각 페이지가 물려받습니다.

### 2. Fixtures — 준비 과정을 주입으로

"로그인부터 하고 시작" 같은 반복 준비는 fixture로 빼냈습니다. 테스트는 필요한 페이지 객체만 받아 곧장 본론으로 들어갑니다.
`loginAs(user)` 한 줄이면 로그인된 상태에서 시작합니다.

### 3. 셀렉터 — 테스트용 표식을 먼저

`[data-test="..."]`처럼 테스트를 위해 박아 둔 속성을 가장 먼저 씁니다.
CSS 클래스나 화면 글자는 디자인이 바뀌면 함께 깨지지만, 테스트용 표식은 그런 변화와 따로 놀기 때문에 잘 버팁니다.
표식이 없을 때만 잘 바뀌지 않는 구조 셀렉터로 대신합니다(예: 장바구니 행 `.cart_item`).

### 4. 단언 — 보이는 값에 기대지 않기

문구나 금액이 조금 바뀌었다고 테스트가 깨지면 곤란합니다. 그래서 고정값 대신 관계나 패턴으로 확인합니다.

- **정렬** — 화면에 나온 순서를, 그걸 직접 정렬한 결과와 맞춰 봅니다(이름 A→Z·Z→A, 가격 ↑·↓).
- **금액** — 정해진 액수가 아니라 `소계 + 세금 = 합계`가 맞는지 계산해서 확인합니다.
- **문구·에러** — 토씨까지 비교하지 않고, 대소문자를 무시한 정규식으로 핵심 부분만 봅니다(`/locked out/i`).

### 5. 테스트 대상 두 갈래

- **자체 데모 앱**(`demo-app/index.html`) — 인터넷 없이 돌아갑니다. Playwright가 http-server(포트 4173)를 알아서 띄우고 끕니다. 언제 돌려도 같은 결과가 나오는 기준점입니다.
- **공개 사이트 [SauceDemo](https://www.saucedemo.com)** — 실제 서비스를 상대하는 시나리오입니다. 위 패턴이 진짜 환경에서도 통하는지 확인하는 자리입니다.

### 6. 브라우저 셋 + CI

chromium · firefox · webkit 세 엔진에서 같은 테스트를 돌리고, GitHub Actions로 자동화해 뒀습니다.

## 구조

```
playwright-test-framework/
├─ demo-app/index.html                 # 자체 데모 로그인 앱 (admin / admin123)
├─ pages/
│  ├─ BasePage.ts  LoginPage.ts         # 데모 앱 페이지 객체
│  └─ saucedemo/                        # SauceDemo 페이지 객체
│     SauceBasePage · LoginPage · InventoryPage · ProductDetailPage
│     CartPage · CheckoutInfoPage · CheckoutOverviewPage · CheckoutCompletePage · Menu
├─ fixtures/
│  ├─ test-fixtures.ts                  # 데모 앱 fixtures
│  └─ saucedemo-fixtures.ts             # SauceDemo 페이지 객체 전체 + loginAs() 헬퍼 주입
├─ utils/helpers.ts                     # 상수, 가격 파싱, 정렬 헬퍼
├─ tests/
│  ├─ demo-local/login.spec.ts          # 2 테스트
│  └─ public-sites/saucedemo/           # 45 테스트 (7개 spec)
├─ .github/workflows/playwright.yml     # CI (npm ci → playwright install → tsc → test)
├─ playwright.config.ts · tsconfig.json · package.json · .gitignore · .env.example
└─ README.md
```

## 시작하기

```bash
npm install
npx playwright install            # chromium / firefox / webkit 다운로드
npm test                          # 3개 브라우저로 전체 실행
```

### 자주 쓰는 스크립트

| 명령 | 하는 일 |
| --- | --- |
| `npm test` | 모든 테스트를 모든 브라우저에서 실행 |
| `npm run test:demo` | 로컬 데모 앱 테스트만 |
| `npm run test:saucedemo` | SauceDemo 테스트만 |
| `npm run test:chromium` / `:firefox` / `:webkit` | 한 브라우저만 실행 |
| `npm run test:headed` | 브라우저 화면을 띄워 실행 |
| `npm run test:ui` | Playwright UI 러너 |
| `npm run report` | 마지막 HTML 리포트 열기 |
| `npm run typecheck` | `tsc --noEmit` 타입 체크 |

## 테스트 커버리지

**데모 앱 — 로그인 (2)**: 맞는 계정이면 환영 메시지, 틀린 계정이면 에러 메시지.

**SauceDemo (45)**

| Spec | 케이스 | 주요 내용 |
| --- | --- | --- |
| `login.spec.ts` | 11 | standard / locked-out / 틀린 비번 / 없는 계정 / 아이디 빈값 / 비번 빈값 / problem·glitch·error·visual 로그인 / 로그인 안 한 채 직접 접근 차단 |
| `inventory.spec.ts` | 10 | 상품 6개, 이름·가격 정렬 4종(직접 정렬한 결과와 비교), 담기/빼기 배지, 상세 진입, 장바구니 이동 |
| `product-detail.spec.ts` | 4 | 이름·설명·가격 노출, 담기, 빼기, 목록으로 돌아가기 |
| `cart.spec.ts` | 5 | 담은 상품 표시, 수량 1, 쇼핑 계속, 결제 진입, 빼기 |
| `checkout.spec.ts` | 8 | 결제 전체 흐름, 필수값 3종 누락 에러, 취소, **소계+세금=합계** 계산 검증, 완료 헤더, 홈으로 |
| `menu.spec.ts` | 5 | 메뉴 열기, About → saucelabs.com, 로그아웃, 상태 초기화, All Items |
| `footer.spec.ts` | 2 | 소셜 링크 주소(Twitter/X·Facebook·LinkedIn), 저작권 문구 |

> 합쳐서 **141 테스트** = (데모 2 + SauceDemo 45) × 3 브라우저.

## 설정

필요하면 `.env.example`을 `.env`로 복사해 값을 바꿉니다(`dotenv`로 읽습니다).

- `SAUCEDEMO_BASE_URL` — SauceDemo 테스트가 바라보는 주소 (기본 `https://www.saucedemo.com`).
- `DEMO_PORT` — 데모 앱 로컬 서버 포트 (기본 `4173`).

## SauceDemo 계정

비밀번호는 모두 `secret_sauce`입니다: `standard_user`, `locked_out_user`, `problem_user`,
`performance_glitch_user`, `error_user`, `visual_user`.

## CI

`.github/workflows/playwright.yml`이 의존성 설치 → 브라우저 다운로드 → 타입 체크 → 전체 실행을 차례로 돌립니다.
GitHub Actions는 **레포 루트**의 `.github/workflows/`만 읽기 때문에, 이 파일은 폴더를 **단독 템플릿 레포**로 쓸 때 동작합니다.
다른 레포 안에 하위 폴더로 넣었다면, 워크플로를 그 레포 루트로 옮겨야 CI가 켜집니다.
