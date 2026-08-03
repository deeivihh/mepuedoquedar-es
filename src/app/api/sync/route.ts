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

function lastYear() {
  return new Date().getFullYear() - 1;
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
        group: "seguridad",
        datasets: {
          policiaLocal: { id: "datos-plantillas-cuerpos-policia-local", where: `ano = date'${lastYear()}'` },
        },
        indicators: {
          policiaLocal: {
            dataset: "policiaLocal",
            municipality: "ayuntamiento",
            operation: "sum",
            fields: ["total"],
          },
        },
      },
      {
        group: "educacion",
        datasets: {
          centrosDocentes: { id: "directorio-de-centros-docentes" },
          ofertaFP: { id: "oferta-de-formacion-profesional" },
        },
        indicators: {
          centrosDocentes: {
            dataset: "centrosDocentes",
            municipality: "municipio",
            operation: "count",
          },
          ofertaFP: {
            dataset: "ofertaFP",
            municipality: "localidad",
            operation: "count",
          },
        },
      },
      {
        group: "comercio",
        datasets: {
          empresasTIERRADESABOR: { id: "empresas-acogidas-a-la-marca-tierra-de-sabor" },
          serviciosProximidad: { id: "servicios-proximidad" }
        },
        indicators: {
          empresasTIERRADESABOR: {
            dataset: "empresasTIERRADESABOR",
            municipality: "localidad",
            operation: "count",
            details: false,
          },
          serviciosProximidad: {
            dataset: "serviciosProximidad",
            municipality: "municipio",
            operation: "count",
            details: false,
          },
        },
      },
      {
        group: "turismo",
        datasets: {
          establecimientosTuristicos: { id: "registro-de-turismo-de-castilla-y-leon" }
        },
        indicators: {
          establecimientosTuristicos: {
            dataset: "establecimientosTuristicos",
            municipality: "municipio",
            operation: "count",
            details: false,
          },
        },
      },
      {
        group: "economia",
        datasets: {
          establecimientosComerciales: { id: "establecimientos-comerciales" },
          cooperativas: { id: "registrocooperativas" }
        },
        indicators: {
          establecimientosComerciales: {
            dataset: "establecimientosComerciales",
            municipality: "municipio",
            operation: "count",
            details: false,
          },
          cooperativas: {
            dataset: "cooperativas",
            municipality: "localidad",
            operation: "count",
            details: false,
          },
        },
      },
      {
        group: "empleo",
        datasets: {
          oficinasECYL: { id: "oficinas-del-servicio-publico-de-empleo-ecyl" },
          ofertasEMPLEO: { id: "ofertas-de-empleo" },
        },
        indicators: {
          oficinasECYL: {
            dataset: "oficinasECYL",
            municipality: "localidad",
            operation: "count",
            exclude: ["soloclasificar", "fax", "telefax_oficial", "paginas_de_internet"]
          },
          ofertasEMPLEO: {
            dataset: "ofertasEMPLEO",
            municipality: "localidad",
            operation: "count",
            // exclude: ["provinciaalternativa"]
            details: false,
          },
        },
      },
      {
        group: "sanidad",
        datasets: {
          centrosSalud: { id: "centros-de-salud-municipios" },
          centrosSanitarios: {
            id: "registro-de-centros-sanitarios-de-castilla-y-leon",
            where: `tipo_de_centro = 'HOSPITALES GENERALES'`,
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
          asociacionesJuveniles: { id: "asociaciones-juveniles" },
          bibiliotecas: { id: "bibliotecas-bibliobuses-y-puntos-de-servicio-movil-geolocalizados" },
          museos: { id: "museos" },
          teatros: { id: "red_teatros" },
          clubesDeportivos: { id: "registro-clubes-deportivos" },
        },
        indicators: {
          asociacionesJuveniles: {
            dataset: "asociacionesJuveniles",
            municipality: "localidad",
            operation: "count",
          },
          bibiliotecas: {
            dataset: "bibiliotecas",
            municipality: "localidad",
            operation: "count",
          },
          museos: {
            dataset: "museos",
            municipality: "localidad",
            operation: "count",
            exclude: ["columne_5", "columne_6", "directoriorelacionado1", "localidad0", "soloclasificar"]
          },
          teatros: {
            dataset: "teatros",
            municipality: "localidad",
            operation: "count",
          },
          clubesDeportivos: {
            dataset: "clubesDeportivos",
            municipality: "localidad",
            operation: "count",
            // exclude: ["column_14", "fax"],
            details: false,
          },
        },
      },
      {
        group: "cultura",
        datasets: {
          monumentos: { id: "relacion-monumentos" },
        },
        indicators: {
          monumentos: {
            dataset: "monumentos",
            municipality: "poblacion_municipio",
            operation: "count",
          },
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
      datasets: totalDatasets,
      grupos: groups.map(g => g.group),
      ...(process.env.NODE_ENV === 'development' && { preview: data.filter((m: any) => String(m.municipio).toUpperCase() === "MEDINA DEL CAMPO") }),
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