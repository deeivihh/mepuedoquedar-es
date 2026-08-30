import type { NextConfig } from "next";

const cspHeader = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' blob: data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.openstreetmap.org https://mepuedoquedar.es https://*.wikipedia.org https://wikipedia.org https://*.wikimedia.org https://upload.wikimedia.org",
	"font-src 'self' data:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"connect-src 'self' https://analisis.datosabiertos.jcyl.es https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.openstreetmap.org https://*.wikipedia.org https://wikipedia.org https://*.wikimedia.org",
	"upgrade-insecure-requests",
].join("; ");

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
	poweredByHeader: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "upload.wikimedia.org",
			},
			{
				protocol: "https",
				hostname: "thumb.wikimedia.org",
			},
		],
	},
	async headers() {
		const headersList = [
			{
				source: "/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value: cspHeader,
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
					},
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
					{
						key: "Cross-Origin-Resource-Policy",
						value: "same-origin",
					},
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "credentialless",
					},
				],
			},
		];

		if (isProd) {
			headersList.push(
				{
					source: "/videos/:path*",
					headers: [
						{
							key: "Cache-Control",
							value: "public, max-age=31536000, immutable",
						},
					],
				},
				{
					source: "/favicon/:path*",
					headers: [
						{
							key: "Cache-Control",
							value: "public, max-age=31536000, immutable",
						},
					],
				},
				{
					source: "/_next/static/:path*",
					headers: [
						{
							key: "Cache-Control",
							value: "public, max-age=31536000, immutable",
						},
					],
				},
				{
					source: "/",
					headers: [
						{
							key: "Cache-Control",
							value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
						},
					],
				}
			);
		}

		return headersList;
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
