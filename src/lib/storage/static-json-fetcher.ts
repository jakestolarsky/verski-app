export type StaticJsonFetcher = (url: string) => Promise<{
	ok: boolean;
	status: number;
	json(): Promise<unknown>;
}>;
