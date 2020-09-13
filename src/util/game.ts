import { Presence } from "discord-rpc";
import { CLIENT_ID } from "../data";
import { getApplicationIcon } from "../discord";
import { Logger } from "../service";

export interface GameInfo {
	pid: number;
	name: string;
	startTime: Date;
	state: GameState;
	rpState: string | null | undefined;
}

export async function buildGameInfo(detailedGameInfo: DetailedGameInfo): Promise<GameInfo> {
	return {
		pid: detailedGameInfo.pid,
		name: detailedGameInfo.name,
		startTime: new Date(detailedGameInfo.start),
		state: "IDLE",
		rpState: null,
	};
}

export function getReadableState(gameInfo: GameInfo): string {
	switch (gameInfo.state) {
		case "IDLE":
			return "Idle";
		case "IN_GAME":
			return "In-game";
		default:
			Logger.error("Invalid game state received!");
			return "Idle";
	}
}

export async function getPresence(gameInfo: GameInfo, clientId: string): Promise<Presence> {
	if (clientId === CLIENT_ID) {
		return {
			details: gameInfo.rpState || getReadableState(gameInfo),
			state: gameInfo.rpState == null ? undefined : getReadableState(gameInfo),
			startTimestamp: gameInfo.startTime,
			largeImageKey: "game-controller",
			smallImageKey: "play-button",
			instance: false,
		};
	}

	const [largeImageKey, smallImageKey] = await getApplicationIcon(clientId);
	return {
		details: gameInfo.rpState || getReadableState(gameInfo),
		state: gameInfo.rpState == null ? undefined : getReadableState(gameInfo),
		startTimestamp: gameInfo.startTime,
		largeImageKey: largeImageKey || undefined,
		smallImageKey: smallImageKey || undefined,
		instance: false,
	};
}

export interface DetailedGameInfo {
	cmdLine: string;
	distributor: any;
	elevated: boolean;
	exeName: string;
	exePath: string;
	hidden: boolean;
	id: string;
	isLauncher: boolean;
	lastFocused: number;
	name: string;
	nativeProcessObserverId: number;
	pid: number;
	pidPath: number[];
	processName: string;
	sandboxed: boolean;
	sku: string | undefined;
	start: number;
	windowHandle: string;
}

export type GameState = "IN_GAME" | "IDLE";

export type GetCurrentGame =
	| ((currApplicationId: string, name: string) => Promise<DetailedGameInfo | null>)
	| ((currApplicationId: string, name: string) => DetailedGameInfo | null);
