import { GameRPC } from "./GameRPC";
import { Logger } from "./Logger";
import { Tracker } from "./Tracker";
import { GameInfo, GameState, GetCurrentGame, getGameInfo, isFocused } from "./util";

const CLIENT_ID = "753747786725457971";
const UPDATE_INTERVAL = 15000;

export function main(getCurrentGame: GetCurrentGame) {
	let rpc: GameRPC;
	let gameInfo: GameInfo;

	const activity = new Tracker<string>(getCurrentGame, UPDATE_INTERVAL);
	const gameState = new Tracker<GameState>(async () => {
		if (gameInfo == null) {
			return "IDLE";
		}

		if (await isFocused(gameInfo.pid)) {
			return "IN_GAME";
		}

		return "IDLE";
	}, UPDATE_INTERVAL);

	activity.on("changed", async (gameTitle) => {
		if (rpc != null) {
			rpc.stop();
		}

		if (gameTitle === "") {
			return;
		}

		gameInfo = await getGameInfo(gameTitle);

		Logger.log("Found game", gameInfo.pid, gameInfo.name);

		rpc = new GameRPC(gameInfo, CLIENT_ID);
		rpc.start();
	});

	gameState.on("changed", (state) => {
		if (gameInfo != null) {
			gameInfo.state = state;
			Logger.log("Set game state to", state, "for", gameInfo.pid, gameInfo.name);
		}
	});

	activity.start();
	gameState.start();
}
