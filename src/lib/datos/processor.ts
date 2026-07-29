import { fetchDataset } from "./client";
import { normalizeNumber, normalizeText } from "./normalize";
import type { IndicatorConfig, ProcessingConfig } from "./types";

type Row = Record<string, unknown>;
type Municipality = { name: string; code: string };

export async function processDatasets(config: ProcessingConfig) {
  const rawMunis = await fetchDataset<Row>(config.municipalities.id);
  const muniMap = new Map<string, Municipality>();
  for (const row of rawMunis) {
    const name = normalizeText(row[config.municipalities.nameField]);
    const code = String(row[config.municipalities.codeField] ?? "").trim();
    if (name && code) muniMap.set(name, { name, code });
  }

  const datasets = new Map<string, Row[]>();
  for (const [key, ds] of Object.entries(config.datasets)) {
    datasets.set(key, await fetchDataset<Row>(ds.id, { where: ds.where }));
  }

  const results = new Map<string, Record<string, unknown>>();
  if (config.includeEmpty) {
    for (const m of muniMap.values()) {
      results.set(m.code, { codigo: m.code, municipio: m.name });
    }
  }

  for (const [name, indicator] of Object.entries(config.indicators)) {
    processIndicator(config.group, name, indicator, datasets, muniMap, results);
  }

  return [...results.values()];
}

function findMunicipality(
  row: Row, ind: IndicatorConfig, muniMap: Map<string, Municipality>,
): Municipality | undefined {
  if (ind.ineCode) {
    const code = String(row[ind.ineCode] ?? "").trim();
    if (!code) return;
    for (const m of muniMap.values()) if (m.code === code) return m;
    return;
  }
  if (ind.municipality) {
    const name = normalizeText(row[ind.municipality]);
    return name ? muniMap.get(name) : undefined;
  }
  throw new Error(`Indicator requires "municipality" or "ineCode"`);
}

function buildJoinIndex(
  ind: IndicatorConfig,
  datasets: Map<string, Row[]>,
  muniMap: Map<string, Municipality>,
): Map<string, string[]> {
  const join = ind.joinVia!;
  const bridgeRows = datasets.get(join.dataset);
  if (!bridgeRows) throw new Error(`Join dataset "${join.dataset}" not found`);

  const index = new Map<string, string[]>();
  for (const row of bridgeRows) {
    const muniName = normalizeText(row[join.municipality]);
    const muni = muniName ? muniMap.get(muniName) : undefined;
    if (!muni) continue;

    const key = String(row[join.localKey] ?? "").trim();
    if (!key) continue;

    if (!index.has(key)) index.set(key, []);
    if (!index.get(key)!.includes(muni.code)) index.get(key)!.push(muni.code);
  }
  return index;
}

const OP_LABELS: Record<string, string> = {
  count: "cantidad", sum: "suma", average: "promedio", exists: "existe",
};

function aggregate(op: string, values: number[]): number {
  const len = values.length;
  if (!len) return 0;
  switch (op) {
    case "count": return len;
    case "exists": return 1;
    case "sum": return values.reduce((a, b) => a + b, 0);
    case "average": return values.reduce((a, b) => a + b, 0) / len;
    default: return 0;
  }
}

function processIndicator(
  group: string,
  name: string,
  ind: IndicatorConfig,
  datasets: Map<string, Row[]>,
  muniMap: Map<string, Municipality>,
  results: Map<string, Record<string, unknown>>,
) {
  const rows = datasets.get(ind.dataset);
  if (!rows) throw new Error(`Dataset "${ind.dataset}" not found`);
  if ((ind.operation === "sum" || ind.operation === "average") && !ind.field) {
    throw new Error(`Indicator "${name}" requires a "field"`);
  }

  const joinIndex = ind.joinVia ? buildJoinIndex(ind, datasets, muniMap) : null;
  const buckets = new Map<string, { values: number[]; details: Row[] }>();

  for (const row of rows) {
    if (ind.filter && !ind.filter(row)) continue;

    let codes: string[];
    if (joinIndex) {
      const fk = String(row[ind.joinVia!.foreignKey] ?? "").trim();
      codes = fk ? (joinIndex.get(fk) ?? []) : [];
    } else {
      const muni = findMunicipality(row, ind, muniMap);
      codes = muni ? [muni.code] : [];
    }

    const needsValue = ind.operation === "sum" || ind.operation === "average";
    const value = needsValue ? normalizeNumber(row[ind.field!]) : 1;

    const withDetails = ind.details !== false;
    for (const code of codes) {
      if (!buckets.has(code)) buckets.set(code, { values: [], details: [] });
      const bucket = buckets.get(code)!;
      bucket.values.push(value);
      if (withDetails) bucket.details.push(row);
    }
  }

  for (const [code, record] of results) {
    const bucket = buckets.get(code);
    const values = bucket?.values ?? [];
    const groupObj = (record[group] ??= {}) as Record<string, unknown>;
    const entry: Record<string, unknown> = {
      [OP_LABELS[ind.operation] ?? ind.operation]: aggregate(ind.operation, values),
    };
    if (ind.details !== false) entry.detalles = bucket?.details ?? [];
    groupObj[name] = entry;
  }
}