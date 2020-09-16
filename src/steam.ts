import { Http } from "./service";

// Ideally we'd read this from the client memory, but it only seems to be stored in the
// friends list, which is a separate process from the main client and not always available.
export async function getProfileInfo(userId: string): Promise<BasicProfileInfo | null> {
	const now = performance.now();

	let resProfile = await Http.get(`https://steamcommunity.com/profiles/${userId}`);
	// If they set a custom URL this 302s, and we need to handle it explicitly.
	if (resProfile.statusCode === 302) {
		resProfile = await Http.get(resProfile.headers.location);
	}
	const profile = new DOMParser().parseFromString(resProfile.body.toString(), "text/html");
	const miniProfileId = profile
		.querySelector("div.playerAvatar:nth-child(2)")!
		.getAttribute("data-miniprofile");

	const resMiniProfile = await Http.get(`https://steamcommunity.com/miniprofile/${miniProfileId}`);
	const miniProfile = new DOMParser().parseFromString(resMiniProfile.body.toString(), "text/html");

	const persona = miniProfile.querySelector(".persona")!;
	const basicProfileInfo: BasicProfileInfo = {
		name: persona.textContent!,
		status: getStatusFromClassName(persona.getAttribute("class")!.split(" ")[1]),
		requestTimeMs: 0,
	};

	if (basicProfileInfo.status === "IN_GAME") {
		let richPresence: string | null = miniProfile.querySelector(".rich_presence")!.textContent;
		if (richPresence === "") richPresence = null;

		basicProfileInfo.game = {
			name: miniProfile.querySelector(".miniprofile_game_name")!.textContent!,
			state: miniProfile.querySelector(".game_state")!.textContent!,
			richPresence,
		};
	}

	basicProfileInfo.requestTimeMs = performance.now() - now;

	return basicProfileInfo;
}

function getStatusFromClassName(className: string): Status {
	switch (className) {
		case "in-game":
			return "IN_GAME";
		case "online":
			return "ONLINE";
		case "offline":
			return "OFFLINE";
		default:
			return "ONLINE";
	}
}

export interface BasicProfileInfo {
	name: string;
	status: Status;
	game?: GameDetails;
	requestTimeMs: number;
}

export interface GameDetails {
	name: string;
	state: string;
	richPresence: string | null | undefined;
}

// "away" is a status in the client, but it doesn't seem to show up in the AJAX response
export type Status = "OFFLINE" | "ONLINE" | "IN_GAME";
