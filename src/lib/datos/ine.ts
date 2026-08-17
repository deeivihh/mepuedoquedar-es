const INE_URL =
  "https://servicios.ine.es/wstempus/js/ES/VALORES_GRUPOSTABLA/29005/89616?det=2";

type IneEntry = { Id: number; Codigo: string };

export async function fetchIneCodes(): Promise<Map<string, number>> {
  const res = await fetch(INE_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`INE API error: ${res.status}`);
  const entries: IneEntry[] = await res.json();
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.Codigo, e.Id);
  return map;
}
