import { LoDashStatic } from "lodash";

export class _ {
	public static isEqual(value: any, other: any): boolean {
		return _.lodash!.isEqual(value, other);
	}

	public static initialize(lodash: LoDashStatic) {
		_.lodash = lodash;
	}

	private static lodash: LoDashStatic | undefined;
}
