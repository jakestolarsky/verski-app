<script lang="ts">
	import type { TranslationManifest } from '$lib/domain/translation-package';
	import * as m from '$lib/paraglide/messages.js';

	type Props = {
		manifest: TranslationManifest;
	};

	let { manifest }: Props = $props();
</script>

<section class="translation-info" aria-labelledby="translation-info-heading">
	<h3 id="translation-info-heading">{m.translation_current_heading()}</h3>

	<dl class="translation-metadata">
		<div>
			<dt>{m.translation_metadata_name()}</dt>
			<dd>{manifest.name}</dd>
		</div>

		<div>
			<dt>{m.settings_language_label()}</dt>
			<dd>{manifest.language}</dd>
		</div>

		<div>
			<dt>{m.settings_metadata_version()}</dt>
			<dd>{manifest.version}</dd>
		</div>

		<div>
			<dt>{m.translation_metadata_attribution()}</dt>
			<dd>{manifest.attribution}</dd>
		</div>

		<div>
			<dt>{m.translation_metadata_license()}</dt>
			<dd>
				<a href={manifest.licenseUrl} target="_blank" rel="noreferrer">
					{manifest.license}
				</a>
			</dd>
		</div>

		<div>
			<dt>{m.translation_metadata_source()}</dt>
			<dd>
				<a href={manifest.source} target="_blank" rel="noreferrer">
					{m.translation_official_source()}
				</a>
			</dd>
		</div>
	</dl>
</section>

<style>
	.translation-info {
		margin-block-start: 2rem;
		padding-block-start: 1.5rem;
		border-block-start: 1px solid var(--verski-border-subtle);
	}

	.translation-info h3 {
		margin-block-end: 1rem;
		font-family: var(--verski-font-ui);
		font-size: 1rem;
		font-weight: var(--verski-font-weight-medium);
	}

	.translation-metadata {
		display: grid;
		gap: 0.75rem;
		margin: 0;
	}

	.translation-metadata div {
		display: grid;
		grid-template-columns: minmax(6rem, auto) minmax(0, 1fr);
		gap: 1rem;
	}

	.translation-metadata dt {
		font-weight: var(--verski-font-weight-medium);
	}

	.translation-metadata dd {
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
		text-align: end;
	}

	.translation-metadata a {
		color: var(--verski-state-active-text);
	}
</style>
