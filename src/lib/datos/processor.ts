import { fetchDataset } from "./client";
import { normalizeNumber, normalizeText } from "./normalize";
import type { IndicatorConfig, ProcessingConfig } from "./types";

type Row = Record<string, unknown>;
type Municipality = { code: string; data: Row };

export async function processDatasets(config: ProcessingConfig) {
  const rawMunis = await fetchDataset<Row>(config.municipalities.id);
  const muniMap = new Map<string, Municipality>();

  for (const row of rawMunis) {
    const name = normalizeText(row[config.municipalities.nameField]);
    const code = String(row[config.municipalities.codeField] ?? "").trim();
    if (!name || !code) continue;
    muniMap.set(name, { code, data: row });
  }

  const results = new Map<string, Record<string, unknown>>();
  if (config.includeEmpty) {
    for (const m of muniMap.values()) {
      results.set(m.code, {
        codigo: m.code,
        municipio: m.data[config.municipalities.nameField],
        provincia: m.data.provincia,
        ...m.data,
      });
    }
  }

  for (const groupConfig of config.groups) {
    const datasets = new Map<string, Row[]>();
    await Promise.all(Object.entries(groupConfig.datasets).map(async ([key, ds]) => {
      datasets.set(key, await fetchDataset<Row>(ds.id, { where: ds.where, select: ds.select }));
    }));

    for (const [name, indicator] of Object.entries(groupConfig.indicators)) {
      processIndicator(groupConfig.group, name, indicator, datasets, muniMap, results);
    }
  }

  return [...results.values()];
}

function findMunicipality(row: Row, ind: IndicatorConfig, muniMap: Map<string, Municipality>) {
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

const normalizeJoinKey = (val: unknown) =>
  normalizeText(val).replace(/\b(DE|DEL|LA|LAS|EL|LOS)\b/g, "").replace(/\s+/g, " ").trim();

function buildJoinIndex(ind: IndicatorConfig, datasets: Map<string, Row[]>, muniMap: Map<string, Municipality>) {
  const join = ind.joinVia!;
  const bridgeRows = datasets.get(join.dataset);
  if (!bridgeRows) throw new Error(`Join dataset "${join.dataset}" not found`);

  const index = new Map<string, string[]>();
  for (const row of bridgeRows) {
    const muni = muniMap.get(normalizeText(row[join.municipality]));
    if (!muni) continue;
    const key = normalizeJoinKey(row[join.localKey]);
    if (!key) continue;
    const list = index.get(key) ?? [];
    list.push(muni.code);
    index.set(key, list);
  }
  return index;
}

const OP_LABELS: Record<string, string> = { count: "cantidad", sum: "suma", average: "promedio", exists: "existe" };

function aggregate(op: string, values: number[]): number {
  if (!values.length) return 0;
  if (op === "count") return values.length;
  if (op === "exists") return 1;
  const sum = values.reduce((a, b) => a + b, 0);
  return op === "average" ? sum / values.length : sum;
}

function shouldExcludeRow(ind: IndicatorConfig, row: Row): boolean {
  if (!ind.exclude) return false;
  if (typeof ind.exclude === "function") return ind.exclude(row);
  if (typeof ind.exclude === "object" && !Array.isArray(ind.exclude)) {
    return Object.entries(ind.exclude).every(([k, v]) => row[k] === v);
  }
  return false;
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

  const joinIndex = ind.joinVia ? buildJoinIndex(ind, datasets, muniMap) : null;
  const buckets = new Map<string, { values: number[]; multiValues: Record<string, number[]>; details: Row[]; dates?: Set<string> }>();

  let processedRows = rows;
  if (ind.latestBy && ind.latestGroupBy) {
    const latestMap = new Map<string, { row: Row; sortVal: string | number }>();
    for (const row of rows) {
      if (ind.filter && !ind.filter(row)) continue;
      if (shouldExcludeRow(ind, row)) continue;
      const groupKey = normalizeText(row[ind.latestGroupBy]);
      if (!groupKey) continue;
      const sortVal = row[ind.latestBy] as string | number;
      const existing = latestMap.get(groupKey);
      if (!existing || sortVal > existing.sortVal) latestMap.set(groupKey, { row, sortVal });
    }
    processedRows = Array.from(latestMap.values()).map((x) => x.row);
  }

  const excluded = ind.exclude ? (Array.isArray(ind.exclude) ? ind.exclude : typeof ind.exclude === "string" ? [ind.exclude] : []) : [];
  const excludedSet = new Set(excluded);
  const activeFields = ind.fields ? ind.fields.filter((f) => !excludedSet.has(f)) : undefined;

  for (const row of processedRows) {
    if (!ind.latestBy) {
      if (ind.filter && !ind.filter(row)) continue;
      if (shouldExcludeRow(ind, row)) continue;
    }

    const codes = joinIndex ? (joinIndex.get(normalizeJoinKey(row[ind.joinVia!.foreignKey])) ?? []) : (findMunicipality(row, ind, muniMap)?.code ? [findMunicipality(row, ind, muniMap)!.code] : []);
    const needsValue = ind.operation === "sum" || ind.operation === "average";
    const value = needsValue && ind.field ? normalizeNumber(row[ind.field]) : 1;

    for (const code of codes) {
      if (!buckets.has(code)) buckets.set(code, { values: [], multiValues: {}, details: [] });
      const b = buckets.get(code)!;
      if (ind.field || !activeFields) b.values.push(value);
      if (activeFields) {
        for (const f of activeFields) {
          b.multiValues[f] ??= [];
          b.multiValues[f].push(normalizeNumber(row[f]));
        }
      }
      if (ind.dateField) {
        const d = String(row[ind.dateField] ?? "").trim();
        if (d && d !== "undefined" && d !== "null") {
          b.dates ??= new Set();
          b.dates.add(d);
        }
      }
      if (ind.details !== false) {
        const detailRow = { ...row };
        for (const f of excluded) delete detailRow[f];
        b.details.push(detailRow);
      }
    }
  }

  for (const [code, record] of results) {
    const groupObj = (record[group] ??= {}) as Record<string, unknown>;
    if (ind.requires) {
      const req = groupObj[ind.requires] as Record<string, unknown> | undefined;
      if (Number(req?.cantidad ?? req?.promedio ?? req?.existe ?? 0) === 0) continue;
    }

    const bucket = buckets.get(code);
    const entry: Record<string, unknown> = {};

    if (activeFields) {
      for (const f of activeFields) entry[f] = aggregate(ind.operation, bucket?.multiValues?.[f] ?? []);
    } else {
      entry[OP_LABELS[ind.operation] ?? ind.operation] = aggregate(ind.operation, bucket?.values ?? []);
    }

    if (ind.dateField && bucket?.dates?.size) {
      const dates = Array.from(bucket.dates).sort();
      entry.fecha = dates.length === 1 ? dates[0] : `${dates[0]} al ${dates.at(-1)}`;
    }

    if (ind.details !== false) entry.detalles = bucket?.details ?? [];
    groupObj[name] = entry;
  }
}