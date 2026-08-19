export type AppMetadata = {
	version: string;
	commit: string;
	author: string;
	repositoryUrl: string;
};

export const appMetadata: AppMetadata = {
	version: __VERSKI_APP_VERSION__,
	commit: __VERSKI_APP_COMMIT__,
	author: 'jakestolarsky',
	repositoryUrl: 'https://github.com/jakestolarsky/verski-app'
};
