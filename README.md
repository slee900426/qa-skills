# tc_gen

게임 GDD(기획서) → Google Spreadsheet 테스트케이스 자동 생성 파이프라인.

LLM 멀티 에이전트(Orchestrator + 전문가 에이전트) 구조로 동작하며,
각 에이전트 정의는 `*.md` 시스템 프롬프트 문서로 관리된다.

---

## 사전 준비 (Prerequisites)

이 레포의 스킬/파이프라인을 사용하려면 아래 환경·툴·인증·MCP가 필요하다.

### 0. 저장소 가져오기
- `git clone` 또는 GitHub에서 zip 다운로드. (git 없이 zip만 받아도 사용 가능 — 단 업데이트 추적은 git 필요)

### 1. 실행 러너 (필수)
- 각 `*.md`는 LLM 시스템 프롬프트 문서이므로, 이를 호출·오케스트레이션할 **에이전트 러너**가 필요하다 (예: Claude Code, Codex 등).
- tc_gen은 `tc_leader`를 진입점으로 6단계 에이전트를 순차/병렬 호출한다.

### 2. Python 3 (필수)
- 용도: `sheet_parser.py`(tc_gen 템플릿 XLSX 분석), `release-qa/scripts/xlsx_probe.py`(워크북 점검).
- **표준 라이브러리만 사용** → `pip install` 불필요 (zipfile / xml.etree / argparse / pathlib / re).
- ⚠️ Windows 주의: `...\WindowsApps\python.exe`는 0바이트 Microsoft Store 별칭 스텁이라 실제 실행되지 않는다. [python.org](https://www.python.org) 정식 설치본 또는 winget(`Python.Python.3.12`) 사용 권장.

### 3. Google Drive / Sheets 연동 (tc_gen STEP 2·4 필수)

| 단계 | 동작 | 필요 도구 | 비고 |
|------|------|----------|------|
| STEP 2 | 템플릿 시트 **복제** + 파일명 지정 + 폴더 저장 | **Google Drive MCP** (`copy_file`) | 가능 (검증됨) |
| 읽기 | 템플릿/시트 내용 **읽기** | **Google Drive MCP** (`read/download_file_content`) | 가능 |
| STEP 2·4 | 시트 **셀 단위 쓰기** (TC 내용 기입 등) | **Google Workspace CLI** 또는 **Google Sheets MCP** | ⚠️ Drive MCP만으로는 **불가** |

### 4. 필요 MCP 및 인증

- **Google Drive MCP** (필수) — Google 계정 **OAuth 인증** 필요. STEP 2 템플릿 복제 및 시트 읽기에 사용.
- **시트 셀 편집 수단** (STEP 4 필수, 아래 중 택1):
  - **Google Workspace CLI** — `release-qa/SKILL.md`가 시트/문서 편집은 Drive MCP가 아닌 Google Workspace CLI로 수행하도록 전제한다. 별도 설치·계정 인증 필요.
  - 또는 **Google Sheets MCP** — 셀 단위 편집(batchUpdate)을 지원하는 MCP. 별도 연결·인증 필요.
  - ⚠️ Google **Drive** MCP에는 셀 단위 편집 도구가 없다(파일 복제·읽기 전용). 이 수단이 없으면 tc_gen은 **JSON 산출(STEP 1·3·4 생성) + 템플릿 복제(STEP 2)** 까지만 가능하고, 시트에 자동 기입하는 단계는 막힌다.
- **접근 권한** — 템플릿 파일과 결과 저장 폴더(`<DEST_FOLDER>`)에 대해 인증 계정의 읽기·쓰기 권한이 있어야 한다. (`tc_leader.md`의 템플릿/폴더 ID 참조)

### 5. 입력물 (사용자 제공)

- **tc_gen**: GDD(기획서). `data_writer`의 수치 검증에는 수치/밸런스 `.xlsx`가 추가로 필요하며, 없으면 해당 섹션은 생략된다.
- **release-qa**: 보상 표 스크린샷, 수치/밸런스 시트 `.xlsx`, 서버 TypeScript(`*.interface.ts` / `*.value.ts` 등), (선택) 기획 문서.

### 6. release-qa 스킬 설치

- **Claude Code**: `release-qa` 폴더를 `~/.claude/skills/release-qa/`에 배치 → `/release-qa` 호출.
- **Codex**: `~/.codex/skills/release-qa/` (아래 [Codex Skills](#codex-skills) 항목의 `install-skill-from-github.py` 사용).
- `xlsx_probe.py` 실행에 Python 3 필요.
- ⚠️ `SKILL.md` 본문의 헬퍼 경로 예시는 `~/.codex/skills/...` 기준이므로, 실제 설치 위치에 맞게 경로를 조정해 실행한다.

---

## 아키텍처: 6-Step Multi-Agent 파이프라인

```
사용자 (GDD 제공)
    │
    ▼
┌─────────────────────────────────────────────┐
│  tc_leader (Orchestrator) — 총괄 조율       │
└─────────────────────────────────────────────┘
    │
    ▼
[STEP 1] spec_analyzer — 게임 타이틀 수집 + GDD 분석
    │   └─ 출력: output/game_info.json
    │
    ▼
[STEP 2] 시트 준비
    │   ├─ 템플릿 복제 (<TEMPLATE_FILE_NAME>)
    │   ├─ 파일명 변경: <TEMPLATE_FILE_NAME>_[game_title]
    │   └─ 저장 폴더: <DEST_FOLDER>
    │   └─ 출력: output/sheet_info.json
    │
    ▼
[STEP 3] tc_designer — Content/Data 탭 항목 구조 설계
    │   └─ Basic 탭은 제외 (basic_writer가 직접 처리)
    │   └─ 출력: output/tc_design.json
    │
    ▼
[STEP 4] tc_writer (Sub-Orchestrator) — 3 작성자 병렬 실행
    │   ├─ basic_writer   : 공통 항목 (템플릿 가변값 수정)
    │   ├─ content_writer : 게임 고유 플레이 검증 (한국어 expected)
    │   └─ data_writer    : 수치/확률 + 기본 동작 체크
    │   └─ 출력: output/tc_snapshot.json
    │
    ▼
[STEP 5] tc_reviewer — 누락/중복/모호성 검토 + 탭별 점수
    │   └─ 출력: output/review_result.json
    │
    ▼
[STEP 6] tc_editor — 피드백 반영 → 최종본 완성
```

---

## 에이전트별 역할

| 단계 | 에이전트 | 파일 | 핵심 책무 |
|-----|---------|------|---------|
| 1 | **spec_analyzer** | `spec_analyzer.md` | GDD → `game_info` 구조화 (game_type/N, 보상 티어, retrigger, feature_interaction 등) |
| - | **tc_leader** | `tc_leader.md` | 전체 워크플로우 조율 (Orchestrator) |
| 3 | **tc_designer** | `tc_designer.md` | Content/Data 탭의 섹션·항목 설계 (Trigger/Flow/Effect/Result 4단계, 모드별 피처 분리, 보상 잠금/해제 등) |
| 4 | **tc_writer** | `tc_writer.md` | Basic/Content/Data 작성자 병렬 실행 조율 (Sub-Orchestrator) |
| 4-a | **basic_writer** | `basic_writer.md` | 템플릿 기존 행의 **가변값만 덮어쓰기** (보드 구성, 보상 티어 배율, 증분율). 신규 행 추가 없음 |
| 4-b | **content_writer** | `content_writer.md` | 게임 고유 항목 (누적/게이지, 멀티 조합, 사전 연출, 보너스 진입 선택 팝업, 인접 요소 병합 등). **expected는 한국어** |
| 4-c | **data_writer** | `data_writer.md` | 강제 종료 매트릭스, 복구 검증, 지정 결과, 누적 보상 리셋 행렬, 수치 검증 (수치 파일 필요시) |
| 5 | **tc_reviewer** | `tc_reviewer.md` | 누락/중복/모호 검토 + 탭별 0~100 점수 |
| 6 | **tc_editor** | `tc_editor.md` | 피드백 반영 + 최종 정리 |

---

## 탭 구조

생성되는 스프레드시트는 3개 탭으로 구성된다.

- **Basic 탭** — 모든 게임 공통 동작 (실행/종료, 입력, 플레이 액션, 재화, 네트워크, 정보 보드 등). 템플릿 기반 작성, 게임별 가변 항목(보상 티어·정보 보드·보드 구성)만 수정.
- **Content 탭** — 이 게임만의 플레이 검증. 각 피처를 **Trigger / Flow / Effect / Result** 4단계로 세분화. expected는 한국어.
- **Data 탭** — 기본 동작 체크(강제 종료, Stop Effect, 복구, 지정 결과 등) + 수치 검증(요소 보상값, 특수 요소, 누적 보상 등 — 수치 파일 필요).

---

## 유틸리티

**`sheet_parser.py`** — XLSX 파서

- `parse_sheet(xlsx_path, sheet_name)` — zipfile + XML 파싱으로 셀 값 추출. sharedStrings 해석 및 병합셀 자동 전파.
- `build_cases(grid, start_row=13)` — 지정 컬럼(cat1/cat2/cat3/pre/steps/expected)을 케이스 객체 리스트로 변환.
- `load_basic_cases(xlsx_path)` — Basic 시트 케이스 일괄 로드 (템플릿 분석용).

---

## Codex Skills

이 레포에는 Codex에서 설치해서 사용할 수 있는 개별 Skill 폴더도 포함된다.
레포 전체가 Codex Skill 구조일 필요는 없으며, 설치할 때 Skill 폴더 경로를 지정하면 된다.

### release-qa

`release-qa`는 릴리즈 검수용 Skill이다.
보상 표 스크린샷, 수치/밸런스 시트 `.xlsx`, 서버 TypeScript 코드, 기획 문서를 비교해 다음 항목을 점검한다.

- 요소 보상값, 특수 요소, 대형 보상/누적 보상 값 일치 여부
- 보상 표 문구와 서버 로직 동작 일치 여부
- 보드/요소 제한, 트리거 조건, 배율 적용 범위
- 오탈자/명확한 문법 오류
- 명확한 문제, 확인 필요, 확률/weight 차이, 테스트 포인트 구분

설치:

```bash
install-skill-from-github.py \
  --repo slee900426/qa-skills \
  --path release-qa
```

설치 후 Codex를 재시작해야 Skill이 적용된다.

---

## 산출물 (`output/`)

| 파일 | 생성 단계 | 내용 |
|-----|---------|------|
| `game_info.json` | STEP 1 | 구조화된 게임 스펙 |
| `sheet_info.json` | STEP 2 | 복제된 시트 ID/URL |
| `tc_design.json` | STEP 3 | basic_spec / content_spec / data_spec |
| `tc_snapshot.json` | STEP 4 | basic_tc / content_tc / data_tc 작성 결과 |
| `review_result.json` | STEP 5 | feedback / missing / score |

---

## 참고

- 각 `.md` 파일은 LLM 시스템 프롬프트 문서로, 별도 러너(Claude Code 등)가 호출하는 구조이다.
- STEP 2의 Google Sheets 복제·STEP 4의 시트 쓰기는 외부 도구(MCP 등)를 통해 수행하는 것을 전제로 한다.
- `data_writer`는 수치 파일이 없으면 수치 검증 섹션을 생략하고 기본 동작 체크만 작성한다.

---

## Playwright E2E Test Framework (`playwright-test-framework/`)

> 이 모듈은 위의 **tc_gen 파이프라인 / release-qa Skill과는 별개입니다**.
> 공유하는 코드나 설정이 없고, `playwright-test-framework/` 폴더 안에서 따로 완결됩니다.

**목적** — Playwright로 웹 페이지를 자동 테스트할 때 코드를 어떻게 짜야 오래 가는지를 정리한 예제입니다.
화면을 Page Object로 캡슐화하고(POM), 준비 과정은 fixtures로 주입하며,
눈에 보이는 값을 그대로 박는 대신 관계·패턴으로 단언해 사소한 변경에 덜 깨지도록 했습니다.
새 프로젝트에서 그대로 복제(clone / "Use this template")해 출발점으로 쓰면 됩니다.

- **자체 데모 앱**(`demo-app/index.html`) — 인터넷 없이 도는 로그인 폼입니다. http-server(포트 4173)가 자동으로 뜨고 꺼집니다.
- **공개 사이트 [SauceDemo](https://www.saucedemo.com)** — login · inventory · product-detail · cart · checkout · menu · footer 전 기능을 다룹니다.

설계의 핵심만 추리면 이렇습니다.

- **POM** — 화면마다 객체 하나로 둡니다. 셀렉터·동작을 그 안에 모아 두면 UI가 바뀌어도 객체만 고치면 됩니다.
- **Fixtures** — 로그인 같은 준비를 주입해, 테스트는 본론부터 시작합니다(`loginAs`).
- **테스트용 셀렉터 우선** — `[data-test]` 표식을 먼저 써서 디자인 변경에 덜 흔들립니다.
- **값을 박지 않는 단언** — 정렬은 배열 비교, 금액은 `소계+세금=합계` 계산, 문구는 정규식 부분 매칭으로 확인합니다.
- **대상 두 갈래** — 인터넷 없이 도는 자체 데모와 실제 공개 사이트 양쪽에 같은 패턴을 적용합니다.

TypeScript + [Playwright](https://playwright.dev/), **Page Object Model + fixtures** 설계이며 **chromium / firefox / webkit** 3개 브라우저에서 돌아갑니다.
합쳐서 **141 테스트**(데모 2 + SauceDemo 45) × 3 브라우저가 전부 통과하는 것을 확인했습니다.

```bash
cd playwright-test-framework
npm install
npx playwright install
npm test
```

설계 의도와 사용법은 **[`playwright-test-framework/README.md`](playwright-test-framework/README.md)**에 자세히 적어 뒀습니다.
