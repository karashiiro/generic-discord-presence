import { CLIENT_ID } from "./client-id";
import { AccountConnection, GetAllConnections } from "./discord";
import { buildGameInfo, DetailedGameInfo, GameInfo, GameState, GetCurrentGame } from "./game";
import { GameRPC } from "./GameRPC";
import { Logger } from "./Logger";
import { BasicProfileInfo, GameDetails, getProfileInfo } from "./steam";
import { Tracker } from "./Tracker";
import { isFocused } from "./util";

const UPDATE_INTERVAL = 15000;

export async function main(
	getCurrentGame: GetCurrentGame,
	getAllConnections: GetAllConnections,
): Promise<PluginCloseHandle> {
	let rpc: GameRPC;
	let gameInfo: GameInfo;
	let steamInfo: AccountConnection | null | undefined;

	let applicationId: string;

	const steam = new Tracker<AccountConnection | null | undefined>(async () => {
		const connections = await getAllConnections();
		return connections.find((c) => c.type === "steam");
	}, UPDATE_INTERVAL);
	steam.on("changed", (newSteamInfo) => {
		if (newSteamInfo == null) {
			steamInfo = null;
			return;
		}

		steamInfo = newSteamInfo;
		Logger.log("Connected to Steam account", steamInfo?.name);
	});

	const steamPresence = new Tracker<GameDetails | null | undefined>(async () => {
		if (steamInfo == null) return null;

		try {
			const profileInfo = await getProfileInfo(steamInfo.id);
			if (profileInfo == null) return null;

			Logger.debug(profileInfo);

			return profileInfo.game;
		} catch (err) {
			Logger.error("Presence fetch failed with error message:", err);
		}
	}, UPDATE_INTERVAL);
	steamPresence.on("changed", (presence) => {
		if (presence == null) {
			gameInfo.rpState = null;
			return;
		}

		gameInfo.rpState = presence?.richPresence;

		Logger.log("Got new Steam rich presence state", presence.richPresence);
	});

	const activity = new Tracker<DetailedGameInfo | null>(async () => {
		return await getCurrentGame(rpc?.clientId, gameInfo?.name);
	}, UPDATE_INTERVAL);
	activity.on("changed", async (dgi) => {
		if (rpc != null) {
			steam.stop();
			steamPresence.stop();
			gameState.stop();

			rpc.stop();

			Logger.log("Rich Presence stopped.");
		}

		if (dgi == null) return;

		applicationId = dgi.id;
		Logger.debug(dgi);

		gameInfo = await buildGameInfo(dgi);
		Logger.log("Found game", gameInfo.pid, gameInfo.name);

		steam.start();
		steamPresence.start();
		gameState.start();

		rpc = new GameRPC(gameInfo, applicationId || CLIENT_ID);
		rpc.start();
	});

	const gameState = new Tracker<GameState>(async () => {
		if (gameInfo == null) {
			return "IDLE";
		}

		if (await isFocused(gameInfo.pid)) {
			return "IN_GAME";
		}

		return "IDLE";
	}, UPDATE_INTERVAL);
	gameState.on("changed", (state) => {
		if (gameInfo != null) {
			gameInfo.state = state;
			Logger.log("Set game state to", state, "for", gameInfo.pid, gameInfo.name);
		}
	});

	activity.start();

	return () => {
		steam?.stop();
		steamPresence?.stop();
		activity?.stop();
		gameState?.stop();
		rpc?.stop();
	};
}

export type PluginCloseHandle = () => void;
