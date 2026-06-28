#!/usr/bin/env python3
"""Print workbook sheet names and compact non-empty row previews using stdlib only."""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def xml_root(zf: zipfile.ZipFile, name: str):
    return ET.fromstring(zf.read(name))


def compact(value: str) -> str:
    text = value.replace("\n", " ").strip()
    return " ".join(text.split())


def load_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = xml_root(zf, "xl/sharedStrings.xml")
    values: list[str] = []
    for si in root.findall("main:si", NS):
        parts = [node.text or "" for node in si.findall(".//main:t", NS)]
        values.append(compact("".join(parts)))
    return values


def workbook_sheets(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = xml_root(zf, "xl/workbook.xml")
    rels = xml_root(zf, "xl/_rels/workbook.xml.rels")
    targets = {}
    for rel in rels.findall("pkgrel:Relationship", NS):
        target = rel.attrib.get("Target", "")
        if target.startswith("/"):
            path = target.lstrip("/")
        else:
            path = "xl/" + target
        targets[rel.attrib["Id"]] = path

    result: list[tuple[str, str]] = []
    for sheet in workbook.findall("main:sheets/main:sheet", NS):
        name = sheet.attrib["name"]
        rid = sheet.attrib.get(f"{{{NS['rel']}}}id")
        if rid in targets:
            result.append((name, targets[rid]))
    return result


def cell_value(cell, shared: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        parts = [node.text or "" for node in cell.findall(".//main:t", NS)]
        return compact("".join(parts))

    value_node = cell.find("main:v", NS)
    if value_node is None or value_node.text is None:
        return ""
    raw = value_node.text
    if cell_type == "s":
        try:
            return shared[int(raw)]
        except (ValueError, IndexError):
            return raw
    return compact(raw)


def sheet_rows(zf: zipfile.ZipFile, path: str, shared: list[str]):
    root = xml_root(zf, path)
    for row in root.findall("main:sheetData/main:row", NS):
        cells = []
        for cell in row.findall("main:c", NS):
            value = cell_value(cell, shared)
            if value:
                cells.append(f"{cell.attrib.get('r', '?')}={value}")
        if cells:
            yield cells


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--sheet", help="Sheet name to dump. Omit to list sheets and preview all.")
    parser.add_argument("--max-rows", type=int, default=120)
    parser.add_argument("--max-cells", type=int, default=18)
    args = parser.parse_args()

    with zipfile.ZipFile(args.workbook) as zf:
        shared = load_shared_strings(zf)
        sheets = workbook_sheets(zf)
        print("Sheets:")
        for name, path in sheets:
            print(f"- {name} ({path})")

        selected = [(n, p) for n, p in sheets if args.sheet is None or n == args.sheet]
        if args.sheet and not selected:
            print(f"\n[missing sheet] {args.sheet}", file=sys.stderr)
            return 1

        for name, path in selected:
            print(f"\n## {name}")
            for idx, cells in enumerate(sheet_rows(zf, path, shared), start=1):
                print(" | ".join(cells[: args.max_cells]))
                if idx >= args.max_rows:
                    print(f"... truncated after {args.max_rows} non-empty rows")
                    break
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
