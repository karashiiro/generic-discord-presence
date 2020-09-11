import { Logger } from "./Logger";
import { getPidOfWindow } from "./process";

export interface GameInfo {
	pid: number;
	name: string;
	state: GameState;
}

export async function getGameInfo(name: string): Promise<GameInfo> {
	return {
		pid: await getPidOfWindow(name, 5),
		name,
		state: "IDLE",
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

export type GameState = "IN_GAME" | "IDLE";

export type GetCurrentGame = () => string;
