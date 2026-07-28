import { procesarDatasets } from "@/lib/datos/processor";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const datos = await procesarDatasets({
            municipios: {
                id: "registro-de-municipios-de-castilla-y-leon",
                campoNombre: "municipio",
                campoCodigo: "cod_ine",
            },

            datasets: {
                centrosSalud: {
                    id: "centros-de-salud-municipios",
                },
                centrosSanitarios: {
                    id: "registro-de-centros-sanitarios-de-castilla-y-leon",
                },
                // camasOcupadas: {
                //     id: "ocupacion-de-camas-en-hospitales",
                //     onlyLastRecord: "fecha",
                // },
            },

            indicadores: {
                centrosSalud: {
                    dataset: "centrosSalud",
                    campoMunicipio: "municipio",
                    operacion: "contar",
                },
                hospitales: {
                    dataset: "centrosSanitarios",
                    campoMunicipio: "localidad",
                    operacion: "contar",
                    filtro: (fila) =>
                        fila.tipo_de_centro === "HOSPITALES GENERALES",
                },
                // camasOcupadas: {
                //     dataset: "camasOcupadas",
                //     campoMunicipio: "hospital",
                //     operacion: "sumar",
                //     campo: "camas_ocupadas_planta",
                // },
            },

            incluirMunicipiosSinDatos: true,
        });

        return NextResponse.json({
            ok: true,
            municipios: datos.length,
            datos,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                ok: false,
                error: "Error procesando los datos",
            },
            { status: 500 }
        );
    }
}