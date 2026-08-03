import { fetchDataset } from "./client";
import { normalizeNumber, normalizeText } from "./normalize";
import type { IndicatorConfig, ProcessingConfig } from "./types";

type Row = Record<string, unknown>;
type Municipality = {
  code: string;
  data: Row;
};

export async function processDatasets(config: ProcessingConfig) {
  const rawMunis = await fetchDataset<Row>(config.municipalities.id);
  const muniMap = new Map<string, Municipality>();

  for (const row of rawMunis) {
    const name = normalizeText(
      row[config.municipalities.nameField]
    );

    const code = String(
      row[config.municipalities.codeField] ?? ""
    ).trim();

    if (!name || !code) continue;

    muniMap.set(name, {
      code,
      data: row,
    });
  }

  const results = new Map<string, Record<string, unknown>>();
  if (config.includeEmpty) {
    for (const m of muniMap.values()) {
      results.set(m.code, {
        codigo: m.code,

        municipio: m.data[
          config.municipalities.nameField
        ],

        provincia: m.data.provincia,

        ...m.data,
      });
    }
  }

  for (const groupConfig of config.groups) {
    const datasets = new Map<string, Row[]>();
    for (const [key, ds] of Object.entries(groupConfig.datasets)) {
      datasets.set(key, await fetchDataset<Row>(ds.id, { where: ds.where }));
    }

    for (const [name, indicator] of Object.entries(groupConfig.indicators)) {
      processIndicator(groupConfig.group, name, indicator, datasets, muniMap, results);
    }
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

function normalizeJoinKey(value: unknown): string {
  return normalizeText(value)
    .replace(/\b(DE|DEL|LA|LAS|EL|LOS)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

    const key = normalizeJoinKey(row[join.localKey]);
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

function shouldExcludeRow(ind: IndicatorConfig, row: Row): boolean {
  if (!ind.exclude) return false;
  if (typeof ind.exclude === "function") {
    return ind.exclude(row);
  }
  if (typeof ind.exclude === "object" && !Array.isArray(ind.exclude) && ind.exclude !== null) {
    return Object.entries(ind.exclude).every(([k, v]) => row[k] === v);
  }
  return false;
}

function getExcludedFields(ind: IndicatorConfig): string[] {
  if (!ind.exclude) return [];
  if (typeof ind.exclude === "string") return [ind.exclude];
  if (Array.isArray(ind.exclude)) return ind.exclude;
  return [];
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
  if ((ind.operation === "sum" || ind.operation === "average") && !ind.field && !ind.fields) {
    throw new Error(`Indicator "${name}" requires a "field" or "fields"`);
  }

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
      if (!existing || sortVal > existing.sortVal) {
        latestMap.set(groupKey, { row, sortVal });
      }
    }
    processedRows = Array.from(latestMap.values()).map(x => x.row);
  }

  const excludedFields = getExcludedFields(ind);
  const activeFields = ind.fields
    ? ind.fields.filter((f) => !excludedFields.includes(f))
    : undefined;

  for (const row of processedRows) {
    if (!ind.latestBy) {
      if (ind.filter && !ind.filter(row)) continue;
      if (shouldExcludeRow(ind, row)) continue;
    }

    let codes: string[];
    if (joinIndex) {
      const fk = normalizeJoinKey(row[ind.joinVia!.foreignKey]);
      codes = fk ? (joinIndex.get(fk) ?? []) : [];
    } else {
      const muni = findMunicipality(row, ind, muniMap);
      codes = muni ? [muni.code] : [];
    }

    const needsValue = ind.operation === "sum" || ind.operation === "average";
    const value = (needsValue && ind.field) ? normalizeNumber(row[ind.field]) : 1;

    const multiVals: Record<string, number> = {};
    if (needsValue && activeFields) {
      for (const f of activeFields) {
        multiVals[f] = normalizeNumber(row[f]);
      }
    }

    const withDetails = ind.details !== false;
    for (const code of codes) {
      if (!buckets.has(code)) buckets.set(code, { values: [], multiValues: {}, details: [] });
      const bucket = buckets.get(code)!;
      if (ind.field || !activeFields) bucket.values.push(value);
      if (activeFields) {
        for (const f of activeFields) {
          if (!bucket.multiValues[f]) bucket.multiValues[f] = [];
          bucket.multiValues[f].push(multiVals[f]);
        }
      }
      if (ind.dateField) {
        const d = String(row[ind.dateField] ?? "").trim();
        if (d && d !== "undefined" && d !== "null") {
          if (!bucket.dates) bucket.dates = new Set();
          bucket.dates.add(d);
        }
      }
      if (withDetails) {
        if (excludedFields.length > 0) {
          const detailRow = { ...row };
          for (const f of excludedFields) {
            delete detailRow[f];
          }
          bucket.details.push(detailRow);
        } else {
          bucket.details.push(row);
        }
      }
    }
  }

  for (const [code, record] of results) {
    const groupObj = (record[group] ??= {}) as Record<string, unknown>;

    if (ind.requires) {
      const req = groupObj[ind.requires] as Record<string, unknown> | undefined;
      const count = Number(req?.cantidad ?? req?.promedio ?? req?.existe ?? 0);
      if (count === 0) continue;
    }

    const bucket = buckets.get(code);
    const values = bucket?.values ?? [];
    const entry: Record<string, unknown> = {};

    if (activeFields) {
      for (const f of activeFields) {
        entry[f] = aggregate(ind.operation, bucket?.multiValues?.[f] ?? []);
      }
    } else {
      entry[OP_LABELS[ind.operation] ?? ind.operation] = aggregate(ind.operation, values);
    }

    if (ind.dateField && bucket?.dates && bucket.dates.size > 0) {
      const dates = Array.from(bucket.dates).sort();
      entry.fecha = dates.length === 1 ? dates[0] : `${dates[0]} al ${dates[dates.length - 1]}`;
    }

    if (ind.details !== false) entry.detalles = bucket?.details ?? [];
    groupObj[name] = entry;
  }
}