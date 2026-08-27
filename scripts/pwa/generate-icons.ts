import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { Resvg } from '@resvg/resvg-js';

const regularSourcePath = new URL('../../static/verski-icon.svg', import.meta.url);
const fullBleedSourcePath = new URL('../../assets/art/icon-full-bleed.svg', import.meta.url);
const outputDirectory = new URL('../../static/icons/', import.meta.url);

const regularSourceSvg = await readFile(regularSourcePath);
const fullBleedSourceSvg = await readFile(fullBleedSourcePath);

const iconTargets = [
	{
		sourceSvg: regularSourceSvg,
		size: 192,
		filename: 'verski-192.png'
	},
	{
		sourceSvg: regularSourceSvg,
		size: 512,
		filename: 'verski-512.png'
	},
	{
		sourceSvg: fullBleedSourceSvg,
		size: 180,
		filename: 'verski-apple-touch-180.png'
	},
	{
		sourceSvg: fullBleedSourceSvg,
		size: 192,
		filename: 'verski-maskable-192.png'
	},
	{
		sourceSvg: fullBleedSourceSvg,
		size: 512,
		filename: 'verski-maskable-512.png'
	}
] as const;

await mkdir(outputDirectory, { recursive: true });

for (const { sourceSvg, size, filename } of iconTargets) {
	const renderer = new Resvg(sourceSvg, {
		fitTo: {
			mode: 'width',
			value: size
		},
		font: {
			loadSystemFonts: false
		}
	});

	const renderedIcon = renderer.render();

	if (renderedIcon.width !== size || renderedIcon.height !== size) {
		throw new Error(
			`Expected a ${size}x${size} icon, received ${renderedIcon.width}x${renderedIcon.height}.`
		);
	}

	const outputPath = new URL(filename, outputDirectory);

	await writeFile(outputPath, renderedIcon.asPng());

	console.log(`Generated static/icons/${filename}`);
}
