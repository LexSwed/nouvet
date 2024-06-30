import fs from "node:fs";
import { defineConfig } from "@solidjs/start/config";
import mkcert from "mkcert";
import { imagetools } from "vite-imagetools";
import viteSvgSpriteWrapper from "vite-svg-sprite-wrapper";
import tsconfigPaths from "vite-tsconfig-paths";

const { cert, key } = await checkAndGenerateCertificates();

export default defineConfig({
	ssr: true,
	middleware: "./src/middleware.ts",
	// devOverlay: false,
	solid: {
		hot: false,
	},
	server: {
		https: {
			cert,
			key,
		},
		prerender: {
			// TODO: needs per-language generation
			// routes: ['/', '/about', '/privacy'],
		},
		// preset: 'cloudflare_pages',
		// rollupConfig: {
		//   external: ['node:async_hooks'],
		// },
		database: {
			// D1
			// default: {
			//   connector: 'cloudflare-d1',
			//   options: { bindingName: 'db' }
			// },
			default: {
				connector: "sqlite",
				options: { name: "db" },
			},
		},
		experimental: {
			database: true,
		},
	},
	vite: {
		define: {
			__RUNNING_ON_DEV__: process.env.NODE_ENV === "test",
		},
		css: {
			postcss: "../config/postcss.config.cjs",
		},
		plugins: [
			tsconfigPaths(),
			imagetools(),
			viteSvgSpriteWrapper({
				icons: "../config/icons/source/*.svg",
				outputDir: "../config/icons",
				generateType: true,
				typeOutputDir: "../ui/src/icon",
				sprite: {
					shape: {
						dimension: {
							// Width and height attributes on embedded shapes
							attributes: true,
						},
					},
				},
			}),
		],
	},
});

async function checkAndGenerateCertificates() {
	const CERT_FOLDER_PATH = "./.certs";
	const CERT_FILE_NAMES = {
		rootCA: {
			cert: "rootCA.crt",
			key: "rootCA-key.pem",
		},
		cert: {
			cert: "cert.crt",
			key: "key.pem",
		},
	};

	const files = {
		cert: `${CERT_FOLDER_PATH}/${CERT_FILE_NAMES.cert.cert}`,
		key: `${CERT_FOLDER_PATH}/${CERT_FILE_NAMES.cert.key}`,
	};
	if (fs.existsSync(files.cert) && fs.existsSync(files.key)) {
		console.info("[generate-certificates]: Certificates already exist, skipping generation");
		return files;
	}

	console.info("[generate-certificates]: No certificates found, generating new ones...");

	const { CA, cert } = await generateCertificates();

	fs.mkdirSync(CERT_FOLDER_PATH, { recursive: true });
	fs.writeFileSync(`${CERT_FOLDER_PATH}/${CERT_FILE_NAMES.rootCA.cert}`, CA.cert);
	fs.writeFileSync(`${CERT_FOLDER_PATH}/${CERT_FILE_NAMES.rootCA.key}`, CA.key);
	fs.writeFileSync(`${CERT_FOLDER_PATH}/${CERT_FILE_NAMES.cert.cert}`, cert.cert);
	fs.writeFileSync(`${CERT_FOLDER_PATH}/${CERT_FILE_NAMES.cert.key}`, cert.key);

	console.info("[generate-certificates]: Certificates generated successfully");
	return files;
}

async function generateCertificates() {
	const CA = await mkcert.createCA({
		organization: "Localhost CA",
		countryCode: "ES",
		state: "Barcelona",
		locality: "Barcelona",
		validity: 365,
	});

	const cert = await mkcert.createCert({
		domains: ["127.0.0.1", "localhost"],
		ca: CA,
		validity: 365,
	});

	return { CA, cert };
}
