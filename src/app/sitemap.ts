import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase/client";

const BASE_URL = "https://mepuedoquedar.es";

export const revalidate = 86400;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${BASE_URL}/metodologia`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
	];

	let municipioPages: MetadataRoute.Sitemap = [];
	try {
		const { data, error } = await getSupabase()
			.from("municipios")
			.select("codigo, updated_at")
			.order("poblacion", { ascending: false });

		if (!error && data) {
			municipioPages = data.map((m) => ({
				url: `${BASE_URL}/municipio/${m.codigo}`,
				lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.8,
			}));
		}
	} catch {
	}

	return [...staticPages, ...municipioPages];
}
