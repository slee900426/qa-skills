---
name: release-qa
description: Release QA workflow. Use when comparing reward-table screenshots, math/balance .xlsx files, server TypeScript files, and design docs for release validation, including reward values, large-reward/cumulative values, feature rules, board/element constraints, typo checks, and user-visible logic differences.
---

# Release QA

## Overview

Use this skill to validate a release from three evidence sources: reward-table screenshots, math/balance sheets, and server code. Keep findings fact-based, separate game-impacting differences from probability/weight-only differences, and ask for clarification when a value order or element mapping is not provable.

## Core Rules

- Answer in Korean unless the user asks for English text.
- Do not guess element identity from art alone when files provide enums or constants. Map elements from code/math first, then compare screenshots.
- If the user is wrong, say so with the exact evidence: file path, line number, sheet/cell/row, or screenshot text.
- Do not treat probability or weight differences as user-visible defects unless they change an advertised rule, reachable outcome, reward value, large reward, trigger condition, or element availability.
- Report only confirmed issues. Put uncertain items under `확인 필요`, not under defects.
- Preserve separation between games. Do not reuse conclusions from another game unless the user explicitly asks for cross-game comparison.
- Do not mark a screenshot-only value or element as a defect when the text, number, or element identity is visually ambiguous. Classify it as `확인 필요` and state what artifact is needed to confirm it.
- When the user asks for a narrow check, complete that requested check first, then briefly report any adjacent release risk that is clearly visible from the same artifacts. Keep these extra findings evidence-based and separate from the requested scope.

## Inputs To Gather

For each game, collect only the artifacts provided or requested:

- Reward-table screenshots: visible reward values, rules text, trigger text, large-reward text, win-path count, input label.
- Server code: `*.interface.ts`, main `*.ts`, and `*.value.ts`. Also search nearby files whose names include `board`, `weight`, `bonus`, `feature`, `reward`, `cumulative`, `mapper`, `config`, or `constant` when the core files do not prove the behavior.
- Math/balance sheet: `.xlsx` file, especially reward table, large-reward/cumulative values, board sets, feature weights, trigger rules, bonus rules.
- Design docs: only when the user asks to confirm intent or resolve a mismatch.

When a GitHub URL or live document is referenced, fetch the source only if access is required and available. For Google Sheets/Docs/Slides edits, use a Google Workspace CLI, not MCP Google Drive.

## Evidence Rules

- For code evidence, cite file path and line number whenever possible.
- For math/balance evidence, cite workbook name, sheet name, row number, and cell address when the helper output exposes it.
- For screenshots, cite the exact visible text or number. If OCR or visual reading is uncertain, say so and keep the item under `확인 필요`.
- For design docs, cite the document section, heading, page, or visible text used as the source of intent.
- If two artifacts disagree, name both sides explicitly, for example `reward-table screenshot says X, code uses Y`.

## Workflow

1. Identify game shape:
   - Win-path or combination count.
   - Board layout and board count.
   - Base input value.
   - Element enum and large-reward enum.
   - Bonus types and feature names.
   - Code files that own reward values, boards, bonus logic, large-reward/cumulative values, and response mapping.

2. Build the value comparison:
   - Compare normal element rewards from reward-table screenshot, `value.ts`, and math sheet.
   - Compare substitute-element reward and substitution exclusions.
   - Compare trigger-element reward and trigger count.
   - Compare large-reward base values, cumulative contribution rates, reset odds if visible, and eligibility input scales.
   - Compare feature prize tables such as coin values, pick values, wheel wedges, row unlock prize tiers, or multiplier values.

3. Build the rule comparison:
   - Check trigger conditions in code against reward-table wording.
   - Check whether “anywhere”, “board 1/3/5”, “all boards”, “board 2/3/4”, and “same play cannot trigger” are enforced by board layout or logic.
   - Check whether bonus reset/retrigger conditions use visible landed elements or internal collected elements.
   - Check whether multiplier rules apply to all advertised outcomes, including large-reward exceptions.
   - Check whether feature combinations have different prize availability than standalone features.

4. Build the typo pass:
   - Only report clear spelling/grammar errors when requested.
   - If the user asks for 오탈자 only, do not report style, wording preference, or gameplay ambiguity.
   - For grammar, distinguish:
     - `명확한 문법 오류`: native speaker understands it, but sentence form is wrong.
     - `뜻이 달라짐`: wrong wording changes the feature meaning.
     - `어색하지만 허용 가능`: no defect unless user asks for polish.

5. Build the visual consistency pass when screenshots are provided:
   - Compare large-reward tier labels, colors, order, and naming between in-game panels and reward-table screens.
   - Compare element/icon identity, color treatment, and displayed values between reward table, panels, bonus views, and board presentation.
   - Report only visible, evidence-backed inconsistencies. If intent cannot be determined, classify as `확인 필요`.

6. Classify findings:
   - `명확한 문제`: reward/value mismatch, missing/extra large reward, advertised outcome impossible, code behavior contradicts reward-table/math, or clear grammar error in released text.
   - `확인 필요`: design intent cannot be determined from artifacts, e.g. top tier excluded from multiplier but docs say “large reward” without exception.
   - `확률/weight 차이`: board weights, feature weights, trigger chances, or probability tuning differences that do not affect visible rules.
   - `테스트 포인트`: scenario the user should run because artifacts agree but runtime display/edge state can still fail.
   - `추가 발견`: a scoped, evidence-backed issue noticed outside the user's narrow request, such as large-reward panel vs reward-table color inconsistency.

## Excel Helper

Use `scripts/xlsx_probe.py` when a workbook is large or the sheet names are unknown:

```bash
python3 ~/.codex/skills/release-qa/scripts/xlsx_probe.py /path/to/file.xlsx
python3 ~/.codex/skills/release-qa/scripts/xlsx_probe.py /path/to/file.xlsx --sheet "Bonus" --max-rows 220
```

The script uses only Python standard libraries and prints sheet names plus non-empty rows. Use it for orientation only; cite exact sheet names/rows/cells in the answer. It does not guarantee Excel display formatting for dates, percentages, currencies, or formulas, so verify display-sensitive values against the workbook UI or another trusted export before reporting a defect.

## Reporting Format

Keep the response short and evidence-first:

```markdown
결론: [문제 없음 / 명확한 문제 N개 / 확인 필요 N개]

검토 범위
- 확인한 파일/시트/스크린샷: ...
- 제외한 범위: ...

명확한 문제
- ...

확인 필요
- ...

추가 발견
- ...

테스트 포인트
- ...

확신도: 높음
```

If there are no confirmed issues, say that clearly and mention the remaining scope, for example `확률/weight류는 사용자가 제외해서 판단하지 않았음`.

## Common Game Checks

- If code counts a trigger element total across the whole board but board layout restricts that element to specific boards, the total-count logic is not a defect by itself. It becomes a defect only if the board layout can produce advertised-invalid combinations.
- If a reward array order is ambiguous, confirm local convention before calling a mismatch. Some codebases store `[0, 0, pay3, pay4, pay5]`.
- If the reward table says a multiplier applies to `prize or large reward` but code excludes a top tier, report as `확인 필요` or `명확한 상이점` depending on design docs.
- If the reward table says `a frame` but code creates multiple frames, report as wording mismatch only when screenshots or design docs imply a single visible frame.
- If math and code differ only in weights, tell the user it is probability/weight tuning unless the reward table advertises the exact odds.
