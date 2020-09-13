import { Logger } from "./Logger";

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
