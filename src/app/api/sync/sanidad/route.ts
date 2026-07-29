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
        actividadPediatriaCS: {
          id: "actividad-de-pediatria-a-nivel-de-zona-basica-de-salud-2026",
          where: `fecha >= date'${oneMonthAgo}'`,
        },
        ocupacionCamasHospitales: {
          id: "ocupacion-de-camas-en-hospitales",
          where: `fecha >= date'${oneMonthAgo}'`,
        }
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
          fields: ["n_de_consultas"],
          details: false,
          requires: "centrosSalud",
          dateField: "fecha",
        },
        camasHospitales: {
          dataset: "ocupacionCamasHospitales",
          joinVia: {
            dataset: "centrosSanitarios",
            municipality: "localidad",
            localKey: "nombre_del_centro",
            foreignKey: "hospital",
          },
          filter: (row: any) => Number(row.camas_habilitadas_planta) > 0,
          operation: "sum",
          fields: [
            "camas_habilitadas_planta",
            "camas_ocupadas_planta",
            "camas_habilitadas_uci",
            "camas_ocupadas_uci"
          ],
          details: false,
          requires: "hospitales",
          latestBy: "fecha",
          latestGroupBy: "hospital",
          dateField: "fecha",
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