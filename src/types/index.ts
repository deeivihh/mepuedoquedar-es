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

export interface CentroSalud {
    nombre_gerencia: string;
    codigo_zona: string;
    nombre_zona: string;
    nombre_centro_salud: string;
    municipio: string;
    pac: string;
}
