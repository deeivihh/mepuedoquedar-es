import { processDatasets } from "@/lib/datos/processor";
import type { GroupConfig } from "@/lib/datos/types";
import { createLog } from "@/lib/logger";
import { saveMunicipalities } from "@/lib/supabase/municipalities";
import { NextResponse } from "next/server";
import { isAuthorized } from "@/app/utils/isAuthorized";

function getOneMonthAgo() {
  return new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const startedAt = performance.now();
  const log = createLog("sync");

  try {
    log.info("Iniciando sincronización...");

    const oneMonthAgo = getOneMonthAgo();
    const groups: GroupConfig[] = [
      {
        group: "sanidad",
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
              "camas_ocupadas_uci",
            ],
            details: false,
            requires: "hospitales",
            latestBy: "fecha",
            latestGroupBy: "hospital",
            dateField: "fecha",
          },
        },
      },
      {
        group: "ocio",
        datasets: {
          asociacionesJuveniles: {
            id: "asociaciones-juveniles",
          }
        },
        indicators: {
          asociacionesJuveniles: {
            dataset: "asociacionesJuveniles",
            municipality: "localidad",
            operation: "count",
          }
        },
      }

    ];

    const data = await processDatasets({
      municipalities: {
        id: "registro-de-municipios-de-castilla-y-leon",
        nameField: "municipio",
        codeField: "cod_ine",
      },
      groups,
      includeEmpty: true,
    });

    const totalDatasets = groups.reduce((sum, g) => sum + Object.keys(g.datasets).length, 0);

    log.info(`Procesados ${data.length} municipios`);

    let total = 0;
    if (process.env.NODE_ENV !== 'development') {
      total = await saveMunicipalities(data);
      log.info(`Guardados ${total} municipios en Supabase`);
    } else {
      total = data.length;
      log.info(`Modo de desarrollo activado, no se guardaron los datos`);
    }

    const seconds = ((performance.now() - startedAt) / 1000).toFixed(2);
    log.info(`Sincronización completada en ${seconds}s`);

    await log.save({
      status: "completed",
      totalMunicipalities: total,
      totalDatasets,
    });

    return NextResponse.json({
      ok: true,
      time: `${seconds}s`,
      municipios: total,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const msg = (error as Error).message;
    log.error(msg);

    await log.save({ status: "error", error: msg });

    return NextResponse.json(
      { ok: false, error: 'Internal sync error' },
      { status: 500, headers: { "Cache-Control": "no-store", }, },
    );
  }
}