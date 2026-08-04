import { getSupabase } from "./client";

type Municipality = Record<string, any>;

export async function saveGroup(
    municipalities: Municipality[]
) {
    const batchSize = 500;

    const rows = municipalities.map(toDatabase);

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        const { error } = await getSupabase().rpc(
            "upsert_municipios",
            {
                rows: batch,
            }
        );

        if (error) {
            throw error;
        }
    }

    return rows.length;
}

function toDatabase(
    municipality: Municipality
) {
    const {
        codigo,
        municipio,
        provincia,

        cod_municipio,
        cod_provincia,

        poblacion,
        mancomunidades,

        latitud,
        longitud,

        coordenadax,
        coordenaday,
        posicion,

        presencia_de_comercio,
        entidades_locales_menores,
        comarca,

        ...datos
    } = municipality;

    return {
        codigo,

        municipio,

        provincia,

        codigo_municipio: cod_municipio,

        codigo_provincia: cod_provincia,

        poblacion: Number(poblacion) || 0,

        mancomunidades,

        latitud: Number(latitud),

        longitud: Number(longitud),

        datos,

        updated_at: new Date().toISOString(),
    };
}

export async function getData(cod_ine: string) {
    const { data, error } = await getSupabase()
        .from("municipios")
        .select("codigo, municipio, poblacion, provincia, latitud, longitud")
        .eq("codigo", cod_ine)
        .single();

    if (error) {
        throw error;
    }

    return data;
}