export class Logger {
	public static log(...data: any[]) {
		Logger.sInstance.methods?.log(...data);
	}

	public static debug(...data: any[]) {
		Logger.sInstance.methods?.debug(...data);
	}

	public static warn(...data: any[]) {
		Logger.sInstance.methods?.warn(...data);
	}

	public static error(...data: any[]) {
		Logger.sInstance.methods?.error(...data);
	}

	public static initialize(ctx: LogMethods & LogContext) {
		Logger.instance().methods = {
			log: ctx.log.bind(ctx.self),
			debug: ctx.debug.bind(ctx.self),
			warn: ctx.warn.bind(ctx.self),
			error: ctx.error.bind(ctx.self),
		};
	}

	private static instance(): Logger {
		if (Logger.sInstance == null) {
			Logger.sInstance = new Logger();
		}
		return Logger.sInstance;
	}
	private static sInstance: Logger;

	private methods: LogMethods | undefined;
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
