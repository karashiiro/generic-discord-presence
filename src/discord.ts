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
