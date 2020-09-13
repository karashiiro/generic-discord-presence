import { Http } from "./Http";

import mem from "mem";

export const getApplicationIcon = mem(_getApplicationIcon);

async function _getApplicationIcon(applicationId: string): Promise<string | null> {
	const res = await Http.get(
		`https://discordapp.com/api/oauth2/applications/${applicationId}/assets`,
	);
	const arr: ApplicationAsset[] = JSON.parse(res.raw.toString());
	try {
		return arr[0].name;
	} catch {
		return null;
	}
}

interface ApplicationAsset {
	id: string;
	type: number;
	name: string;
}

export interface AccountConnection {
	friend_sync: boolean;
	id: string;
	integrations: any[];
	name: string;
	revoked: boolean;
	show_activity: boolean;
	type: string; // enum but lazy
	verified: boolean;
	visibility: number;
}

export type GetAllConnections = () => Promise<AccountConnection[]>;
