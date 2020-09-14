export class Logger {
	public static log(...data: any[]) {
		Logger.methods?.log(...data);
	}

	public static debug(...data: any[]) {
		Logger.methods?.debug(...data);
	}

	public static warn(...data: any[]) {
		Logger.methods?.warn(...data);
	}

	public static error(...data: any[]) {
		Logger.methods?.error(...data);
	}

	public static initialize(ctx: LogMethods & LogContext) {
		Logger.methods = {
			log: ctx.log.bind(ctx.self),
			debug: ctx.debug.bind(ctx.self),
			warn: ctx.warn.bind(ctx.self),
			error: ctx.error.bind(ctx.self),
		};
	}

	private static methods: LogMethods | undefined;
}

interface LogContext {
	self: any;
}

// Type safety as the plot demands (for annotations only)
interface LogMethods {
	log: (...data: any[]) => void;
	debug: (...data: any[]) => void;
	warn: (...data: any[]) => void;
	error: (...data: any[]) => void;
}
