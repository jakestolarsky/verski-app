import { onMount } from 'svelte';

type PlaceholderPhase = 'typing' | 'pausing' | 'deleting';

type TypewriterPlaceholderOptions = {
	examples: readonly [string, ...string[]];
	isPaused?: () => boolean;
	typingDelay?: number;
	deletingDelay?: number;
	pauseDelay?: number;
};

export function createTypewriterPlaceholder({
	examples,
	isPaused = () => false,
	typingDelay = 105,
	deletingDelay = 55,
	pauseDelay = 1600
}: TypewriterPlaceholderOptions) {
	const fallback = examples[0];

	let exampleIndex = $state(0);
	let characterCount = $state(0);
	let phase = $state<PlaceholderPhase>('typing');
	let prefersReducedMotion = $state(false);

	const value = $derived.by(() => {
		const currentExample = examples[exampleIndex] ?? fallback;

		if (isPaused()) {
			return '';
		}

		if (prefersReducedMotion) {
			return fallback;
		}

		return currentExample.slice(0, characterCount);
	});

	const isCursorBlinking = $derived(!prefersReducedMotion && !isPaused() && phase === 'pausing');

	onMount(() => {
		const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

		function updateMotionPreference() {
			prefersReducedMotion = motionPreference.matches;
		}

		updateMotionPreference();
		motionPreference.addEventListener('change', updateMotionPreference);

		return () => {
			motionPreference.removeEventListener('change', updateMotionPreference);
		};
	});

	$effect(() => {
		const currentExample = examples[exampleIndex] ?? fallback;

		const currentCharacterCount = characterCount;
		const currentPhase = phase;
		const paused = isPaused();

		if (prefersReducedMotion || paused) {
			return;
		}

		const delay =
			currentPhase === 'pausing'
				? pauseDelay
				: currentPhase === 'deleting'
					? deletingDelay
					: typingDelay;

		const timeout = window.setTimeout(() => {
			if (currentPhase === 'pausing') {
				phase = 'deleting';
				return;
			}

			if (currentPhase === 'deleting') {
				if (currentCharacterCount > 0) {
					characterCount = currentCharacterCount - 1;
					return;
				}

				exampleIndex = (exampleIndex + 1) % examples.length;
				phase = 'typing';
				return;
			}

			if (currentCharacterCount < currentExample.length) {
				characterCount = currentCharacterCount + 1;
				return;
			}

			phase = 'pausing';
		}, delay);

		return () => {
			window.clearTimeout(timeout);
		};
	});

	return {
		get value() {
			return value;
		},

		get isCursorBlinking() {
			return isCursorBlinking;
		}
	};
}
