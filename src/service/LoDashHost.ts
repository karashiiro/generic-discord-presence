import { LoDashStatic } from "lodash";

export class LoDashHost {
	public static get _() {
		return LoDashHost.instance().lodash!;
	}

	public static initialize(lodash: LoDashStatic) {
		LoDashHost.instance().lodash = lodash;
	}

	public static instance(): LoDashHost {
		if (LoDashHost.sInstance == null) {
			LoDashHost.sInstance = new LoDashHost();
		}
		return LoDashHost.sInstance;
	}
	private static sInstance: LoDashHost;

	private lodash: LoDashStatic | undefined;
}
