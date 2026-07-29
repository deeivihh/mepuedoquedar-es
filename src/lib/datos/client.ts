import { parse } from "csv-parse/sync";

const BASE = "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets";

function buildParams(opts?: { where?: string; orderBy?: string; limit?: number }) {
  const p = new URLSearchParams();
  if (opts?.where) p.set("where", opts.where);
  if (opts?.orderBy) p.set("order_by", opts.orderBy);
  if (opts?.limit !== undefined) p.set("limit", String(opts.limit));
  return p;
}

async function safeFetch(url: string, label: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${label}: ${res.status}`);
  return res;
}

export async function fetchDataset<T = Record<string, unknown>>(
  id: string,
  opts?: { where?: string; orderBy?: string },
): Promise<T[]> {
  const url = `${BASE}/${id}/exports/csv?${buildParams(opts)}`;
  const res = await safeFetch(url, `dataset "${id}"`);
  return parse(await res.text(), { columns: true, skip_empty_lines: true, delimiter: ";", trim: true }) as T[];
}

export async function fetchRecords<T = Record<string, unknown>>(
  id: string,
  opts?: { where?: string; orderBy?: string; limit?: number },
): Promise<T[]> {
  const params = buildParams({ ...opts, limit: opts?.limit ?? 100 });
  const url = `${BASE}/${id}/records?${params}`;
  const res = await safeFetch(url, `records "${id}"`);
  return ((await res.json()) as { results: T[] }).results;
}