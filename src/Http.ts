export class Http {
	public static get(url: string): Promise<HTTPResponse> {
		return Http.sInstance.methods!.get(url);
	}

	public static initialize(methods: HttpMethods) {
		Http.instance().methods = methods;
	}

	private static instance(): Http {
		if (Http.sInstance == null) {
			Http.sInstance = new Http();
		}
		return Http.sInstance;
	}
	private static sInstance: Http;

	private methods: HttpMethods | undefined;
}

export type HTTPGet = (url: string) => Promise<HTTPResponse>;

export interface HTTPResponse {
	raw: string | Buffer;
	body: { [key: string]: any } | string | Buffer;
	ok: boolean;
	statusCode: number;
	statusText: string;
	headers: { [key: string]: string };
}

interface HttpMethods {
	get: HTTPGet;
}
