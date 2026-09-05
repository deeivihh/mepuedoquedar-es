export interface Site {
    municipio: string;
    cod_municipio: string;
    provincia: string;
    cod_provincia: string;
    cod_ine: number;
    poblacion: number;
    mancomunidades: string | null;
    entidades_locales_menores: string | null;
    comarca: string | null;
    longitud: number;
    latitud: number;
    coordenadax: number;
    coordenaday: number;
    posicion: {
        lon: number;
        lat: number;
    };
    presencia_de_comercio: string;
    distance?: number;
}

export interface EleccionesPartido {
    siglas: string;
    nombre?: string;
    concejales: number;
    pct: number;
    color: string;
    votos?: number;
}

export interface EleccionesAlcaldia {
    nombre?: string | null;
    partido: string;
    fecha_posesion?: string;
}

export interface EleccionesGobierno {
    regimen: string;
    etiqueta: string;
    mayoria_absoluta: boolean;
    partido_alcaldia: string;
}

export interface EleccionesData {
    anio: number;
    legislatura: string;
    concejales_totales: number;
    alcaldia?: EleccionesAlcaldia | null;
    gobierno?: EleccionesGobierno | null;
    partidos: EleccionesPartido[];
}
