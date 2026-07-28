import { obtenerDataset, obtenerRegistros } from "./client";
import { normalizarNumero, normalizarTexto } from "./normalize";
import {
    ConfiguracionIndicador,
    ConfiguracionProcesamiento,
} from "./types";

type Fila = Record<string, unknown>;

type Municipio = {
    nombre: string;
    codigo: string;
};

export async function procesarDatasets(
    configuracion: ConfiguracionProcesamiento
) {
    // Descargar municipios
    const municipios = await obtenerDataset<Fila>(
        configuracion.municipios.id
    );

    // Descargar datasets solicitados
    const datasets = new Map<string, Fila[]>();

    for (const [nombre, configuracionDataset] of Object.entries(
        configuracion.datasets
    )) {
        let filas: Fila[];

        if (configuracionDataset.onlyLastRecord) {
            const campo = configuracionDataset.onlyLastRecord;
            const [ultimo] = await obtenerRegistros<Fila>(
                configuracionDataset.id,
                { orderBy: `${campo} desc`, limit: 1 }
            );

            if (!ultimo) {
                filas = [];
            } else {
                const ultimaFecha = String(ultimo[campo]);

                filas = await obtenerRegistros<Fila>(
                    configuracionDataset.id,
                    {
                        where: `${campo}=date'${ultimaFecha}'`,
                        limit: 100,
                    }
                );
            }
        } else if (configuracionDataset.where) {
            filas = await obtenerRegistros<Fila>(
                configuracionDataset.id,
                { where: configuracionDataset.where }
            );
        } else {
            filas = await obtenerDataset<Fila>(
                configuracionDataset.id
            );
        }

        datasets.set(nombre, filas);
    }

    // Crear mapa de municipios
    const municipiosMap = new Map<string, Municipio>();

    for (const fila of municipios) {
        const nombre = normalizarTexto(
            fila[configuracion.municipios.campoNombre]
        );

        const codigo = String(
            fila[configuracion.municipios.campoCodigo] ?? ""
        ).trim();

        if (!nombre || !codigo) {
            continue;
        }

        municipiosMap.set(nombre, {
            nombre,
            codigo,
        });
    }

    // Inicializar resultados
    const resultados = new Map<
        string,
        Record<string, unknown>
    >();

    if (configuracion.incluirMunicipiosSinDatos) {
        for (const municipio of municipiosMap.values()) {
            resultados.set(municipio.codigo, {
                codigo: municipio.codigo,
                municipio: municipio.nombre,
            });
        }
    }

    // Procesar indicadores
    for (const [nombreIndicador, indicador] of Object.entries(
        configuracion.indicadores
    )) {
        procesarIndicador({
            nombreIndicador,
            indicador,
            datasets,
            municipiosMap,
            resultados,
        });
    }

    return Array.from(resultados.values());
}

function procesarIndicador({
    nombreIndicador,
    indicador,
    datasets,
    municipiosMap,
    resultados,
}: {
    nombreIndicador: string;
    indicador: ConfiguracionIndicador;
    datasets: Map<string, Fila[]>;
    municipiosMap: Map<string, Municipio>;
    resultados: Map<string, Record<string, unknown>>;
}) {
    const filas = datasets.get(indicador.dataset);

    if (!filas) {
        throw new Error(
            `El dataset "${indicador.dataset}" no se encuentra`
        );
    }

    const valores = new Map<string, number[]>();

    for (const fila of filas) {
        const nombreMunicipio = normalizarTexto(
            fila[indicador.campoMunicipio]
        );

        if (!nombreMunicipio) {
            continue;
        }

        const municipio = municipiosMap.get(nombreMunicipio);

        if (!municipio) {
            continue;
        }

        if (
            indicador.filtro &&
            !indicador.filtro(fila)
        ) {
            continue;
        }

        const codigo = municipio.codigo;

        if (!valores.has(codigo)) {
            valores.set(codigo, []);
        }

        switch (indicador.operacion) {
            case "contar":
                valores.get(codigo)!.push(1);
                break;

            case "existe":
                valores.get(codigo)!.push(1);
                break;

            case "sumar": {
                if (!indicador.campo) {
                    throw new Error(
                        `El indicador "${nombreIndicador}" requiere un campo`
                    );
                }

                valores
                    .get(codigo)!
                    .push(
                        normalizarNumero(
                            fila[indicador.campo]
                        )
                    );

                break;
            }

            case "promedio": {
                if (!indicador.campo) {
                    throw new Error(
                        `El indicador "${nombreIndicador}" requiere un campo`
                    );
                }

                valores
                    .get(codigo)!
                    .push(
                        normalizarNumero(
                            fila[indicador.campo]
                        )
                    );

                break;
            }
        }
    }

    for (const [codigo, resultado] of resultados) {
        const elementos = valores.get(codigo) ?? [];

        let valor = 0;

        switch (indicador.operacion) {
            case "contar":
                valor = elementos.length;
                break;

            case "existe":
                valor = elementos.length > 0 ? 1 : 0;
                break;

            case "sumar":
                valor = elementos.reduce(
                    (total, elemento) => total + elemento,
                    0
                );
                break;

            case "promedio":
                valor =
                    elementos.length > 0
                        ? elementos.reduce(
                            (total, elemento) =>
                                total + elemento,
                            0
                        ) / elementos.length
                        : 0;
                break;
        }

        resultado[nombreIndicador] = valor;
    }
}