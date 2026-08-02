import { supabase } from "./client";

type Municipality = Record<string, any>;

export async function saveMunicipalities(
    municipalities: Municipality[]
) {
    const rows = municipalities.map(toDatabase);

    const batchSize = 500;

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase
            .from("municipios")
            .upsert(batch, {
                onConflict: "codigo",
            });

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