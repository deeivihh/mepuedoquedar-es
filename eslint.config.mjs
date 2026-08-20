import nextConfig from "eslint-config-next";

const eslintConfig = [
	{
		ignores: [
			".next/**",
			".wrangler/**",
			"node_modules/**",
			"cloudflare-env.d.ts",
			"next-env.d.ts",
			"open-next.config.ts"
		],
	},
	...nextConfig,
	{
		rules: {
			"react-hooks/set-state-in-effect": "off",
			"@next/next/no-img-element": "off",
		},
	},
	{
		files: ["src/app/utils/getData.ts"],
		rules: {
			"react-hooks/exhaustive-deps": "off",
		},
	},
];

export default eslintConfig;
