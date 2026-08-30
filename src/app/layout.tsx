import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import MotionProvider from "@/components/providers/MotionProvider";

const titleFont = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-title",
	display: "swap"
});

const textFont = Inter({
	subsets: ["latin"],
	variable: "--font-text",
	display: "swap"
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
		canonical: "https://mepuedoquedar.es"
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},

	openGraph: {
		type: "website",
		locale: "es_ES",
		siteName: "¿Me puedo quedar?",
		title: "Dónde vivir en Castilla y León",
		description:
			"Descubre municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar.",
		url: "https://mepuedoquedar.es",
		images: [
			{
				url: "https://mepuedoquedar.es/og/og-image.jpg",
				secureUrl: "https://mepuedoquedar.es/og/og-image.jpg",
				width: 1200,
				height: 630,
				type: "image/jpeg",
				alt: "¿Me puedo quedar? - Dónde vivir en Castilla y León"
			}
		]
	},

	twitter: {
		card: "summary_large_image",
		site: "@deeivihh",
		creator: "@deeivihh",
		title: "Dónde vivir en Castilla y León",
		description:
			"Descubre municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar.",
		images: [
			{
				url: "https://mepuedoquedar.es/og/og-image.jpg",
				alt: "¿Me puedo quedar? - Dónde vivir en Castilla y León"
			}
		]
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
			},
			{
				url: "/favicon/favicon.svg",
				sizes: "512x512",
				type: "image/svg+xml"
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
			<head>
				<link
					rel="preload"
					as="image"
					href="/videos/hero_poster.webp"
					fetchPriority="high"
				/>
			</head>
			<body
				className={`${titleFont.variable} ${textFont.variable} antialiased`}
			>
				<MotionProvider>
					<PreferencesProvider>{children}</PreferencesProvider>
				</MotionProvider>

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