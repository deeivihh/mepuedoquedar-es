import { Source_Serif_4, Inter } from "next/font/google"
import "./globals.css";
import { PreferencesProvider } from "@/app/contexts/PreferencesContext";

const titleFont = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-title",
})

const textFont = Inter({
	subsets: ["latin"],
	variable: "--font-text",
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<head>
				<meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.tile.openstreetmap.org https://mepuedoquedar.es; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; connect-src 'self' https://analisis.datosabiertos.jcyl.es https://*.tile.openstreetmap.org; upgrade-insecure-requests;" />
				<meta httpEquiv="X-Content-Type-Options" content="nosniff" />
				<meta property="og:site_name" content="¿Me puedo quedar?" />
				<meta property="og:title" content="¿Me puedo quedar?" />
				<meta name="description" content="Descubre dónde vivir en Castilla y León. Encuentra municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar." />
				<meta property="og:description" content="¿Y si tu próximo hogar estuviera en Castilla y León? Encuentra el municipio donde sí te puedes quedar." />
				<meta property="og:image" content="https://mepuedoquedar.es/og/og-image.jpg" />
				<meta property="og:image:alt" content="El texto en español dice: «¿Me puedo quedar?», escrito en letra grande y negrita sobre un fondo claro, con parte de un signo de interrogación visible." />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:url" content="https://mepuedoquedar.es" />
				<meta property="og:locale" content="es_ES" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@deeivihh" />
				<meta name="twitter:title" content="¿Me puedo quedar?" />
				<meta name="theme-color" content="#E7DCC3" />
				<link rel="canonical" href="https://mepuedoquedar.es" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
				<link rel="icon" type="image/x-icon" sizes="64x64" href="/favicon/favicon.ico" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebSite",
							"@id": "https://mepuedoquedar.es/#website",
							url: "https://mepuedoquedar.es/",
							name: "¿Me puedo quedar?",
							description:
								"Descubre dónde vivir en Castilla y León. Encuentra municipios con oportunidades, servicios y calidad de vida para construir tu próximo hogar.",
							inLanguage: "es-ES"
						})
					}}
				/>
			</head>
			<title>¿Me puedo quedar?</title>
			<body className={`${titleFont.variable} ${textFont.variable} antialiased`}>
				<PreferencesProvider>
					{children}
				</PreferencesProvider>
			</body>
		</html>
	);
}
