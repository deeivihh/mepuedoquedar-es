import { fetchDataset } from "@/lib/datos/client";
import { MUNICIPALITIES_CONFIG } from "@/lib/datos/groups";
import type { MasSourceResult } from "./types";

const CYL_PROVINCIAS = new Set(["05", "09", "24", "34", "37", "40", "42", "47", "49"]);

const CNMC_COMPETITIVOS_CYL = new Set([
  "05019",
  "09059", "09018", "09219",
  "24089", "24115", "24142", "24222",
  "34120",
  "37274", "37294", "37082", "37354",
  "40194",
  "42173",
  "47186", "47076", "47010", "47085", "47052", "47165", "47175",
  "49275", "49021"
]);

interface MunicipioRow {
  cod_ine: string;
  poblacion?: string | number;
}

function computeCobertura(codIne: string, poblacionNum: number) {
  const isCompetitivo = CNMC_COMPETITIVOS_CYL.has(codIne);

  let ftth: number;
  let redMovil: "5G" | "4G";
  let velocidadMax: string;
  let sateliteRural: boolean;

  if (isCompetitivo || poblacionNum >= 10000) {
    ftth = 98;
    redMovil = "5G";
    velocidadMax = "1 Gbps";
    sateliteRural = false;
  } else if (poblacionNum >= 2000) {
    ftth = 92;
    redMovil = "5G";
    velocidadMax = "1 Gbps";
    sateliteRural = false;
  } else if (poblacionNum >= 500) {
    ftth = 84;
    redMovil = "4G";
    velocidadMax = "300 Mbps";
    sateliteRural = true;
  } else {
    ftth = 76;
    redMovil = "4G";
    velocidadMax = "100 Mbps";
    sateliteRural = true;
  }

  return {
    ftth,
    red_movil: redMovil,
    velocidad_max: velocidadMax,
    zona_cnmc: isCompetitivo ? "competitiva" : "regulada",
    satelite_rural: sateliteRural,
  };
}

async function run(): Promise<MasSourceResult> {
  const records = await fetchDataset<MunicipioRow>(MUNICIPALITIES_CONFIG.id, {
    select: ["cod_ine", "poblacion"],
  });

  const result: MasSourceResult = {};

  for (const r of records) {
    const rawCod = String(r.cod_ine ?? "").trim();
    if (!rawCod) continue;
    const cod = rawCod.padStart(5, "0");
    if (!CYL_PROVINCIAS.has(cod.slice(0, 2))) continue;

    const poblacion = Number(r.poblacion) || 0;
    result[cod] = {
      cobertura: computeCobertura(cod, poblacion),
    };
  }

  return result;
}

export default {
  name: "cobertura",
  run,
} satisfies import("./types").MasSource;
