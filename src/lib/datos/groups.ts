import type { GroupConfig } from "./types";

function getOneMonthAgo() {
  return new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);
}

function lastYear() {
  return new Date().getFullYear() - 1;
}

export const MUNICIPALITIES_CONFIG = {
  id: "registro-de-municipios-de-castilla-y-leon",
  nameField: "municipio",
  codeField: "cod_ine",
} as const;

export function getGroups(): GroupConfig[] {
  const oneMonthAgo = getOneMonthAgo();

  return [
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
        establecimientosTuristicos: {
          id: "registro-de-turismo-de-castilla-y-leon",
          select: ["municipio", "nombre", "direccion", "categoria", "tipo"]
        }
      },
      indicators: {
        establecimientosTuristicos: {
          dataset: "establecimientosTuristicos",
          municipality: "municipio",
          operation: "count",
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
    },
  ];
}

export function getGroupByName(name: string): GroupConfig | undefined {
  return getGroups().find(g => g.group === name);
}

export function getGroupNames(): string[] {
  return getGroups().map(g => g.group);
}
