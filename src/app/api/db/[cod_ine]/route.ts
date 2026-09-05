import { getData } from "@/lib/supabase/municipalities";
import { getDistance } from "geolib";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ cod_ine: string }> }) {
    try {
        const { cod_ine } = await params;
        const userLat = req.nextUrl.searchParams.get("lat");
        const userLon = req.nextUrl.searchParams.get("lon");

        const municipio = await getData(cod_ine);
        if (!municipio) {
            return NextResponse.json({ error: "Municipio no encontrado" }, { status: 404 });
        }

        let distance = 0;
        if (userLat && userLon) {
            const lat = parseFloat(userLat);
            const lon = parseFloat(userLon);
            if (!isNaN(lat) && !isNaN(lon)) {
                distance = getDistance({ latitude: lat, longitude: lon }, { latitude: municipio.latitud, longitude: municipio.longitud });
            }
        }

        return NextResponse.json({ ...municipio, distance });
    } catch (error: any) {
        if (error?.code === "PGRST116") return NextResponse.json({ error: "Municipio no encontrado" }, { status: 404 });
        return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
    }
}