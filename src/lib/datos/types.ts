export type ConfiguracionMunicipios = {
    id: string;
    campoNombre: string;
    campoCodigo: string;
};

export type ConfiguracionDataset = {
    id: string;
    where?: string;
    onlyLastRecord?: string;
};

export type OperacionIndicador =
    | "contar"
    | "sumar"
    | "promedio"
    | "existe";

export type ConfiguracionIndicador = {
    dataset: string;
    campoMunicipio: string;
    operacion: OperacionIndicador;
    campo?: string;
    filtro?: (fila: Record<string, unknown>) => boolean;
};

export type ConfiguracionProcesamiento = {
    municipios: ConfiguracionMunicipios;

    datasets: Record<string, ConfiguracionDataset>;

    indicadores: Record<string, ConfiguracionIndicador>;

    incluirMunicipiosSinDatos?: boolean;
};