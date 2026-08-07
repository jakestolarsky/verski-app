export function normalizeReferenceInput(input: string): string {
	return input.trim().replace(/\s+/g, ' ').replace(',', ':');
}
