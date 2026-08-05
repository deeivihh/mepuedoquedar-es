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
        centrosDocentes: { id: "directorio-de-centros-docentes", select: ["municipio", "denominacion_generica", "denominacion_generica_breve", "denominacion_especifica", "naturaleza", "localizacion", "web", "telefono"] },
        ofertaFP: { id: "oferta-de-formacion-profesional", select: ["localidad", "centro_educativo", "modalidad", "tipo_ensenanza", "nivel_educativo", "familia_profesional"] },
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
        empresasTIERRADESABOR: { id: "empresas-acogidas-a-la-marca-tierra-de-sabor", select: ["localidad"] },
        serviciosProximidad: { id: "servicios-proximidad", select: ["municipio"] }
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
          select: ["municipio"]
        }
      },
      indicators: {
        establecimientosTuristicos: {
          dataset: "establecimientosTuristicos",
          municipality: "municipio",
          operation: "count",
          details: false
        },
      },
    },
    {
      group: "economia",
      datasets: {
        establecimientosComerciales: { id: "establecimientos-comerciales", select: ["municipio"] },
        cooperativas: { id: "registrocooperativas", select: ["localidad"] }
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
        oficinasECYL: { id: "oficinas-del-servicio-publico-de-empleo-ecyl", select: ["localidad", "enlace_al_contenido", "nombre_del_organismo"] },
        ofertasEMPLEO: { id: "ofertas-de-empleo", select: ["localidad"] },
      },
      indicators: {
        oficinasECYL: {
          dataset: "oficinasECYL",
          municipality: "localidad",
          operation: "count",
        },
        ofertasEMPLEO: {
          dataset: "ofertasEMPLEO",
          municipality: "localidad",
          operation: "count",
        },
      },
    },
    {
      group: "sanidad",
      datasets: {
        centrosSalud: {
          id: "registro-de-centros-sanitarios-de-castilla-y-leon",
          where: `tipo_de_centro = "CENTROS DE ATENCION PRIMARIA: CENTROS DE SALUD"`,
          select: ["localidad", "nombre_del_centro", "direccion", "telefono", "finalidad_asistencial"]
        },
        centrosSanitarios: {
          id: "registro-de-centros-sanitarios-de-castilla-y-leon",
          where: `tipo_de_centro = 'HOSPITALES GENERALES'`,
          select: ["localidad", "nombre_del_centro", "posicion", "telefono", "finalidad_asistencial"]
        },
      },
      indicators: {
        centrosSalud: {
          dataset: "centrosSalud",
          municipality: "localidad",
          operation: "count",
        },
        hospitales: {
          dataset: "centrosSanitarios",
          municipality: "localidad",
          operation: "count",
        },
      },
    },
    {
      group: "ocio",
      datasets: {
        asociacionesJuveniles: { id: "asociaciones-juveniles", select: ["localidad", "denominacion", "tipo_de_asociacion", "ambito", "direccion", "no_inscripcion"] },
        bibiliotecas: { id: "bibliotecas-bibliobuses-y-puntos-de-servicio-movil-geolocalizados", select: ["nombre_entidad", "tipo", "enlace_contenido", "localidad"] },
        museos: { id: "museos", select: ["nombreentidad", "localidad", "enlace_al_contenido"] },
        teatros: { id: "red_teatros", select: ["municipio", "sala", "direccion", "email"] },
        clubesDeportivos: { id: "registro-clubes-deportivos", select: ["localidad"] },
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
        },
        teatros: {
          dataset: "teatros",
          municipality: "municipio",
          operation: "count",
        },
        clubesDeportivos: {
          dataset: "clubesDeportivos",
          municipality: "localidad",
          operation: "count",
          details: false,
        },
      },
    },
    {
      group: "cultura",
      datasets: {
        monumentos: { id: "relacion-monumentos", select: ["poblacion_municipio", "nombre", "tipomonumento", "periodohistorico", "identificadorbieninterescultural", "coordenadas"] },
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
