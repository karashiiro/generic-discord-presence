import { LoDashStatic } from "lodash";

export class LoDashHost {
	public static get _() {
		return LoDashHost.lodash!;
	}

	public static initialize(lodash: LoDashStatic) {
		LoDashHost.lodash = lodash;
	}

	private static lodash: LoDashStatic | undefined;
}
