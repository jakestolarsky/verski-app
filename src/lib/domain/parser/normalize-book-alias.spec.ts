import { describe, expect, it } from 'vitest';

import { normalizeBookAlias } from './normalize-book-alias';

describe('normalizeBookAlias', () => {
	it.each([
		['1 Sm', '1sm'],
		['1Sm', '1sm'],
		['  1   SM  ', '1sm'],
		['Song of Songs', 'songofsongs'],
		['ŁK', 'łk']
	])('normalizes %s', (input, expected) => {
		expect(normalizeBookAlias(input)).toBe(expected);
	});
});
