import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { Resvg } from '@resvg/resvg-js';

const sourcePath = new URL('../../static/verski-icon.svg', import.meta.url);
const outputDirectory = new URL('../../static/icons/', import.meta.url);

const iconSizes = [180, 192, 512] as const;

const sourceSvg = await readFile(sourcePath);

await mkdir(outputDirectory, { recursive: true });

for (const size of iconSizes) {
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

	const outputPath = new URL(`verski-${size}.png`, outputDirectory);

	await writeFile(outputPath, renderedIcon.asPng());

	console.log(`Generated static/icons/verski-${size}.png`);
}
