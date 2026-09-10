import type { Metadata } from "next";
import MunicipioDetail from "@/components/municipio/MunicipioDetail";
import SearchBar from "@/components/home/SearchBar";
import LocationNotice from "@/components/common/LocationNotice";
import { getMunicipioName } from "@/lib/supabase/municipalities";

export const revalidate = 86400;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ cod: string }>;
}): Promise<Metadata> {
    const { cod } = await params;
    try {
        const municipio = await getMunicipioName(cod);
        const title = municipio
            ? `¿Me puedo quedar en ${municipio}?`
            : "¿Me puedo quedar?";
        const description = municipio
            ? `Todo lo que necesitas saber antes de irte a vivir a ${municipio}: servicios básicos, vivienda y ventajas para quedarte.`
            : "Descubre dónde vivir en Castilla y León. Encuentra municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar.";
        const canonicalUrl = `https://mepuedoquedar.es/municipio/${cod}`;
        const ogImage = "https://mepuedoquedar.es/og/og-image.jpg";

        return {
            title: {
                absolute: title,
            },
            description,
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                type: "website",
                locale: "es_ES",
                siteName: "¿Me puedo quedar?",
                title,
                description,
                url: canonicalUrl,
                images: [
                    {
                        url: ogImage,
                        secureUrl: ogImage,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                site: "@deeivihh",
                creator: "@deeivihh",
                title,
                description,
                images: [ogImage],
            },
        };
    } catch {
        return {
            title: "¿Me puedo quedar?",
            alternates: {
                canonical: `https://mepuedoquedar.es/municipio/${cod}`,
            },
        };
    }
}

export default async function DetailPage({
    params,
}: {
    params: Promise<{ cod: string }>;
}) {
    const { cod } = await params;
    const municipio = await getMunicipioName(cod);

    return (
        <main className="min-h-[100dvh] w-full px-4 sm:px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-center">
            <div className="flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
                <header className="relative z-50 w-full" aria-label="Búsqueda y navegación">
                    <SearchBar />
                </header>

                <LocationNotice className="2xl:hidden" />

                <section className="w-full" aria-label="Detalle del municipio">
                    <MunicipioDetail cod={cod} initialName={municipio} />
                </section>
            </div>
        </main>
    );
}

