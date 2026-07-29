import { processDatasets } from "@/lib/datos/processor";
import { NextResponse } from "next/server";

const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export async function GET() {
  try {
    const data = await processDatasets({
      group: "sanidad",
      municipalities: {
        id: "registro-de-municipios-de-castilla-y-leon",
        nameField: "municipio",
        codeField: "cod_ine",
      },
      datasets: {
        centrosSalud: { id: "centros-de-salud-municipios" },
        centrosSanitarios: {
          id: "registro-de-centros-sanitarios-de-castilla-y-leon",
          where: `tipo_de_centro = 'HOSPITALES GENERALES'`,
        },
        actividadPediatria: {
          id: "actividad-de-pediatria-a-nivel-de-zona-basica-de-salud-2026",
          where: `fecha >= '${oneMonthAgo}'`,
        },
      },
      indicators: {
        centrosSalud: {
          dataset: "centrosSalud",
          municipality: "municipio",
          operation: "count",
        },
        hospitales: {
          dataset: "centrosSanitarios",
          municipality: "localidad",
          operation: "count",
        },
        actividadPediatria: {
          dataset: "actividadPediatriaCS",
          joinVia: {
            dataset: "centrosSalud",
            municipality: "municipio",
            localKey: "codigo_zona",
            foreignKey: "cudigo_zona_b_sica_de_salud",
          },
          operation: "sum",
          field: "n_de_consultas",
          details: false,
        },
      },
      includeEmpty: true,
    });

    return NextResponse.json({ ok: true, municipios: data.length, datos: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Error procesando los datos" }, { status: 500 });
  }
}