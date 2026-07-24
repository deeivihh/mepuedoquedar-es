import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google"
import "./globals.css";

const titleFont = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-title",
})

export const metadata: Metadata = {
	title: "¿Me puedo quedar?",
	description: "",
	icons: {
		icon: "/favicon_2.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${titleFont.variable} antialiased`}>{children}</body>
		</html>
	);
}
