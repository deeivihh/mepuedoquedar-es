const INE_URL =
  "https://servicios.ine.es/wstempus/js/ES/VALORES_GRUPOSTABLA/29005/89616?det=2";

type IneEntry = { Id: number; Codigo: string };

let cachedMap: Map<string, number> | null = null;
let inflightPromise: Promise<Map<string, number>> | null = null;

export async function fetchIneCodes(): Promise<Map<string, number>> {
  if (cachedMap) return cachedMap;
  if (inflightPromise) return inflightPromise;

  inflightPromise = (async () => {
    const res = await fetch(INE_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`INE API error: ${res.status}`);
    const entries: IneEntry[] = await res.json();
    const map = new Map<string, number>();
    for (const e of entries) {
      if (!e.Codigo) continue;
      map.set(e.Codigo, e.Id);
      const unpadded = e.Codigo.replace(/^0+/, "");
      if (unpadded) map.set(unpadded, e.Id);
      const padded = e.Codigo.padStart(5, "0");
      map.set(padded, e.Id);
    }
    cachedMap = map;
    return map;
  })();

  try {
    return await inflightPromise;
  } finally {
    inflightPromise = null;
  }
}

export async function getIneCodInt(codigo: string | number): Promise<number | null> {
  const codeStr = String(codigo).trim();
  const map = await fetchIneCodes();
  return map.get(codeStr) ?? map.get(codeStr.padStart(5, "0")) ?? map.get(codeStr.replace(/^0+/, "")) ?? null;
}
