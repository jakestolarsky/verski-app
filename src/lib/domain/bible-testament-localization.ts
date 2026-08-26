import type { BibleTestamentId } from './bible-canon';
import type { AppLocale } from './user-settings';

const bibleTestamentNames: Record<AppLocale, Record<BibleTestamentId, string>> = {
	en: {
		old: 'Old Testament',
		new: 'New Testament'
	},
	pl: {
		old: 'Stary Testament',
		new: 'Nowy Testament'
	}
};

export function getBibleTestamentName(testamentId: BibleTestamentId, locale: AppLocale): string {
	return bibleTestamentNames[locale][testamentId];
}
