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

		expect(m.translation_storage_heading({}, { locale: 'pl' })).toBe('Tłumaczenia offline');

		expect(
			m.translation_remove_label(
				{
					name: 'Uwspółcześniona Biblia Gdańska'
				},
				{ locale: 'pl' }
			)
		).toBe('Usuń tłumaczenie Uwspółcześniona Biblia Gdańska');

		expect(m.translation_current_heading({}, { locale: 'pl' })).toBe('Aktualne tłumaczenie');

		expect(m.translation_official_source({}, { locale: 'pl' })).toBe('Oficjalne źródło');

		expect(m.search_reference_label({}, { locale: 'pl' })).toBe('Odnośnik biblijny');

		expect(m.search_submit_label({}, { locale: 'pl' })).toBe('Wyszukaj w Biblii');

		expect(
			m.recent_remove_label(
				{
					reference: 'John 3:16'
				},
				{ locale: 'pl' }
			)
		).toBe('Usuń John 3:16 z ostatnich wyszukiwań');
	});
});
