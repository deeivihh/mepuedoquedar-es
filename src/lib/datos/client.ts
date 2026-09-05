import { parse } from "csv-parse/sync";

const BASE = "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets";

export async function fetchDataset<T = Record<string, unknown>>(
  id: string,
  opts?: { where?: string; orderBy?: string; select?: string[] },
): Promise<T[]> {
  const p = new URLSearchParams();
  if (opts?.where) p.set("where", opts.where);
  if (opts?.orderBy) p.set("order_by", opts.orderBy);
  if (opts?.select) p.set("select", opts.select.join(", "));
  const res = await fetch(`${BASE}/${id}/exports/csv?${p}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch dataset "${id}": ${res.status}`);
  return parse(await res.text(), { columns: true, skip_empty_lines: true, delimiter: ";", trim: true }) as T[];
}