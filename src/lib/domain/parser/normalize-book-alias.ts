export function normalizeBookAlias(alias: string): string {
	return alias.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}
