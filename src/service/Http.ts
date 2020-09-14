export class Http {
	public static get(url: string): Promise<HTTPResponse> {
		return Http.methods!.get(url);
	}

	public static post(url: string, data: string, contentType: string): Promise<HTTPResponse> {
		return Http.methods!.post(url, data, contentType);
	}

	public static initialize(methods: HttpMethods) {
		Http.methods = methods;
	}

	private static methods: HttpMethods | undefined;
}

export type HTTPGet = (url: string) => Promise<HTTPResponse>;

export type HTTPPost = (url: string, data: string, contentType: string) => Promise<HTTPResponse>;

export interface HTTPResponse {
	raw: string | Buffer;
	body: { [key: string]: any } | any[] | string | Buffer;
	ok: boolean;
	statusCode: number;
	statusText: string;
	headers: { [key: string]: string };
}

interface HttpMethods {
	get: HTTPGet;
	post: HTTPPost;
}
