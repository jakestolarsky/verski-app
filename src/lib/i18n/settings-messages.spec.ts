import { describe, expect, it } from 'vitest';

import * as m from '$lib/paraglide/messages.js';

describe('settings messages', () => {
	it('provides English and Polish settings messages', () => {
		expect(m.settings_title({}, { locale: 'en' })).toBe('Settings');
		expect(m.settings_title({}, { locale: 'pl' })).toBe('Ustawienia');

		expect(m.settings_decrease_text_size({}, { locale: 'pl' })).toBe('Zmniejsz rozmiar tekstu');

		expect(m.settings_recent_remove_many({ count: 3 }, { locale: 'pl' })).toBe(
			'Usuń wszystkie ostatnie wyszukiwania (3).'
		);
	});
});
