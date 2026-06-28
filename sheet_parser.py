import zipfile
import xml.etree.ElementTree as ET
import re

NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'


def _col_to_idx(col):
    idx = 0
    for c in col:
        idx = idx * 26 + (ord(c) - ord('A') + 1)
    return idx


def _idx_to_col(n):
    col = ""
    while n:
        col = chr((n - 1) % 26 + ord('A')) + col
        n = (n - 1) // 26
    return col


def _cell_to_rc(ref):
    m = re.match(r'([A-Z]+)(\d+)', ref)
    return int(m.group(2)), _col_to_idx(m.group(1))


def parse_sheet(xlsx_path: str, sheet_name: str) -> dict:
    """xlsx 파일에서 지정한 시트를 읽어 {셀ref: 값} dict 반환 (병합 셀 자동 전파)"""
    with zipfile.ZipFile(xlsx_path) as z:
        with z.open("xl/sharedStrings.xml") as f:
            root = ET.parse(f).getroot()
        strings = [
            "".join(t.text or "" for t in si.findall(f'.//{{{NS}}}t'))
            for si in root.findall(f'{{{NS}}}si')
        ]

        with z.open("xl/workbook.xml") as f:
            wb = ET.parse(f).getroot()
        sheet_idx = next(
            i for i, s in enumerate(wb.findall(f'.//{{{NS}}}sheet'), 1)
            if s.get('name') == sheet_name
        )

        with z.open(f"xl/worksheets/sheet{sheet_idx}.xml") as f:
            ws = ET.parse(f).getroot()

    # raw cell values
    grid = {}
    for row in ws.findall(f'{{{NS}}}sheetData/{{{NS}}}row'):
        for cell in row.findall(f'{{{NS}}}c'):
            ref = cell.get('r')
            t = cell.get('t')
            v = cell.find(f'{{{NS}}}v')
            if v is not None and v.text:
                grid[ref] = strings[int(v.text)] if t == 's' else v.text

    # propagate merged cell values
    for mc in ws.findall(f'{{{NS}}}mergeCells/{{{NS}}}mergeCell'):
        r1, c1 = _cell_to_rc(mc.get('ref').split(':')[0])
        r2, c2 = _cell_to_rc(mc.get('ref').split(':')[1])
        val = grid.get(mc.get('ref').split(':')[0], "")
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                ref = f"{_idx_to_col(c)}{r}"
                if ref not in grid and val:
                    grid[ref] = val

    return grid


def build_cases(grid: dict, start_row: int = 13) -> list:
    """grid에서 TC 케이스 목록을 추출해 반환"""
    COL = {'B': 'cat1', 'C': 'cat2', 'D': 'cat3', 'E': 'pre', 'F': 'steps', 'G': 'expected'}

    rows = {}
    for ref, val in grid.items():
        m = re.match(r'([A-Z]+)(\d+)', ref)
        col, row = m.group(1), int(m.group(2))
        if row < start_row or col not in COL:
            continue
        rows.setdefault(row, {})[COL[col]] = val.strip()

    cases = []
    current = {}
    for row_num in sorted(rows.keys()):
        r = rows[row_num]
        if not r:
            continue

        entry = {
            'cat1':     r.get('cat1',     current.get('cat1', '')),
            'cat2':     r.get('cat2',     current.get('cat2', '')),
            'cat3':     r.get('cat3',     current.get('cat3', '')),
            'pre':      r.get('pre',      current.get('pre', '')),
            'steps':    r.get('steps',    ''),
            'expected': r.get('expected', ''),
        }
        current = {k: entry[k] for k in ('cat1', 'cat2', 'cat3', 'pre')}

        if entry['steps'] or entry['expected']:
            cases.append(entry)

    return cases


def load_basic_cases(xlsx_path: str) -> list:
    """Basic 시트 TC 케이스 전체 반환"""
    return build_cases(parse_sheet(xlsx_path, "Basic"))
