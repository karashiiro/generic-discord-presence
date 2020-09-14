import { Http } from "./service";

export async function getApplicationIcon(
	applicationId: string,
): Promise<[largeImageKey: string | null, smallImageKey: string | null]> {
	const assets: ApplicationAsset[] = (
		await Http.get(`https://discordapp.com/api/oauth2/applications/${applicationId}/assets`)
	).body as any[];
	try {
		return [assets[0].name, assets[1].name];
	} catch {
		return [null, null];
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
