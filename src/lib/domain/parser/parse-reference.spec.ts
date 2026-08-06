import { describe, expect, it } from 'vitest';
import { parseReference } from './parse-reference';

describe('parseReference', () => {
	it('parses a strict John chapter and verse reference', () => {
		expect(parseReference('John 3:16')).toEqual({
			ok: true,
			reference: {
				bookId: 'john',
				chapter: 3,
				verseStart: 16
			}
		});
	});

	it('rejects a chapter-only reference in strict mode', () => {
		expect(parseReference('John 3')).toEqual({
			ok: false,
			error: 'invalid-format'
		});
	});
});