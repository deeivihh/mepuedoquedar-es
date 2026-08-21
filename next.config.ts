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

const nextConfig: NextConfig = {
	poweredByHeader: false,
	async headers() {
		return [
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
			{
				source: "/videos/:all*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable"
					}
				]
			},
			{
				source: "/favicon/:all*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable"
					}
				]
			}
		];
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
