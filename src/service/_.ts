import { LoDashStatic } from "lodash";

export class _ {
	public static get static() {
		return _.lodash!;
	}

	public static initialize(lodash: LoDashStatic) {
		_.lodash = lodash;
	}

	private static lodash: LoDashStatic | undefined;
}
