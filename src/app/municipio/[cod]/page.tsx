import type { Metadata } from "next";
import MunicipioDetail from "@/components/municipio/MunicipioDetail";
import SearchBar from "@/components/home/SearchBar";
import LocationNotice from "@/components/common/LocationNotice";
import { getMunicipioName } from "@/lib/supabase/municipalities";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ cod: string }>;
}): Promise<Metadata> {
    const { cod } = await params;
    try {
        const municipio = await getMunicipioName(cod);
        if (!municipio) {
            return {
                title: "¿Me puedo quedar?",
            };
        }
        return {
            title: {
                absolute: `¿Me puedo quedar en ${municipio}?`,
            },
            description: `Todo lo que necesitas saber antes de irte a vivir a ${municipio}: servicios básicos, vivienda y ventajas para quedarte.`,
            openGraph: {
                title: `¿Me puedo quedar en ${municipio}?`,
                description: `Todo lo que necesitas saber antes de irte a vivir a ${municipio}: servicios básicos, vivienda y ventajas para quedarte.`,
            },
            twitter: {
                card: "summary_large_image",
                title: `¿Me puedo quedar en ${municipio}?`,
                description: `Todo lo que necesitas saber antes de irte a vivir a ${municipio}: servicios básicos, vivienda y ventajas para quedarte.`,
            },
        };
    } catch {
        return {
            title: "¿Me puedo quedar?",
        };
    }
}

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;

    return (
        <main className="min-h-[100dvh] w-full px-4 sm:px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-center">
            <div className="flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
                <header className="relative z-50 w-full" aria-label="Búsqueda y navegación">
                    <SearchBar />
                </header>

                <LocationNotice className="xl:hidden" />

                <section className="w-full" aria-label="Detalle del municipio">
                    <MunicipioDetail cod={cod} />
                </section>
            </div>
        </main>
    );
}

