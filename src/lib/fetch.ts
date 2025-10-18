
type FetcherOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers?: Record<string, string>;
	body?: unknown;
};

export class FetchError extends Error {
	status: number;
	info: { error: string };

	constructor(status: number, info: { error: string }) {
		super(`Request failed with status ${status}`);
		this.status = status;
		this.info = info;
	}
}

export async function fetcher<T>(url: string, options?: FetcherOptions): Promise<T> {
	const { method = 'GET', headers = {}, body } = options || {};

	const response = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: body ? JSON.stringify(body) : null,
	});

	if (!response.ok) {
		const errorInfo = await response.json();
		throw new FetchError(response.status, errorInfo);
	}

	return response.json();
}
