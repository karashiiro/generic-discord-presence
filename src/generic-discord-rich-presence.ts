import { CLIENT_ID } from "./data";
import { GameRPC } from "./GameRPC";
import { Logger } from "./service";
import { GameDetails, getProfileInfo, GetSteamId } from "./steam";
import { Tracker } from "./Tracker";
import {
	buildGameInfo,
	DetailedGameInfo,
	GameInfo,
	GameState,
	GetCurrentGame,
	isFocused,
} from "./util";

const UPDATE_INTERVAL = 15000;

interface PluginArgs {
	getCurrentGame: GetCurrentGame;
	getSteamId: GetSteamId;
}

type PluginCloseHandle = () => void;

export async function main({ getCurrentGame, getSteamId }: PluginArgs): Promise<PluginCloseHandle> {
	let rpc: GameRPC;
	let gameInfo: GameInfo;
	let steamId: string | null | undefined;

	let applicationId: string;

	const steam = new Tracker<string | null | undefined>(getSteamId, UPDATE_INTERVAL);
	steam.on("changed", (newSteamId) => {
		if (newSteamId == null) {
			steamId = null;
			return;
		}

		steamId = newSteamId;
		Logger.log("Connected to Steam account", steamId);
	});

	const steamPresence = new Tracker<GameDetails | null | undefined>(async () => {
		if (steamId == null) return null;

		try {
			const profileInfo = await getProfileInfo(steamId);
			if (profileInfo == null) return null;

			Logger.debug(profileInfo);

			return profileInfo.game;
		} catch (err) {
			/**
			 * The only reasons why this would fail are Steam's community servers
			 * going down, being unable to reach them, and the website layout changing
			 * significantly.
			 */
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
		activity?.stop();
		steam?.stop();
		steamPresence?.stop();
		gameState?.stop();
		rpc?.stop();
	};
}
