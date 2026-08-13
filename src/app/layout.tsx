import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/app/contexts/PreferencesContext";

const titleFont = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-title"
});

const textFont = Inter({
	subsets: ["latin"],
	variable: "--font-text"
});

export const metadata: Metadata = {
	metadataBase: new URL("https://mepuedoquedar.es"),

	title: {
		default: "¿Me puedo quedar?",
		template: "%s | ¿Me puedo quedar?"
	},

	description:
		"Descubre dónde vivir en Castilla y León. Encuentra municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar.",

	alternates: {
		canonical: "/"
	},

	openGraph: {
		type: "website",
		locale: "es_ES",
		siteName: "¿Me puedo quedar?",
		title: "¿Me puedo quedar?",
		description:
			"¿Y si tu próximo hogar estuviera en Castilla y León? Encuentra el municipio donde sí te puedes quedar.",
		url: "/",
		images: [
			{
				url: "/og/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "¿Me puedo quedar? Descubre dónde vivir en Castilla y León."
			}
		]
	},

	twitter: {
		card: "summary_large_image",
		site: "@deeivihh",
		title: "¿Me puedo quedar?",
		description:
			"¿Y si tu próximo hogar estuviera en Castilla y León? Encuentra el municipio donde sí te puedes quedar.",
		images: ["/og/og-image.jpg"]
	},

	icons: {
		icon: [
			{
				url: "/favicon/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png"
			},
			{
				url: "/favicon/favicon-32x32.png",
				sizes: "32x32",
				type: "image/png"
			},
			{
				url: "/favicon/favicon.ico",
				sizes: "64x64",
				type: "image/x-icon"
			}
		],
		apple: "/favicon/apple-touch-icon.png"
	},

	manifest: "/favicon/site.webmanifest",

	other: {
		"theme-color": "#E7DCC3"
	}
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	url: "https://mepuedoquedar.es/",
	name: "¿Me puedo quedar?",
	description:
		"Descubre dónde vivir en Castilla y León. Encuentra municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar.",
	inLanguage: "es-ES"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body
				className={`${titleFont.variable} ${textFont.variable} antialiased`}
			>
				<PreferencesProvider>{children}</PreferencesProvider>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd)
					}}
				/>
			</body>
		</html>
	);
}