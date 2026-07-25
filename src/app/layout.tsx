import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google"
import "./globals.css";

const titleFont = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-title",
})

const textFont = Inter({
	subsets: ["latin"],
	variable: "--font-text",
})

export const metadata: Metadata = {
	title: "¿Me puedo quedar?",
	description: "",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body className={`${titleFont.variable} ${textFont.variable} antialiased`}>{children}</body>
		</html>
	);
}
