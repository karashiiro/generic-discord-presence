import { Client, Presence } from "discord-rpc";
import { CLIENT_ID } from "./client-id";
import { getApplicationIcon } from "./discord";
import { GameInfo, getReadableState } from "./game";
import { Logger } from "./Logger";
import { sleep } from "./util";

export class GameRPC {
	private startTimestamp: Date;

	private gameInfo: GameInfo;
	private clientId: string;

	private client: Client | undefined;

	private running: boolean;
	private shouldStop: boolean;

	constructor(gameInfo: GameInfo, clientId: string) {
		this.startTimestamp = new Date();
		this.gameInfo = gameInfo;

		this.clientId = clientId;

		this.running = false;
		this.shouldStop = false;
	}

	start() {
		this.shouldStop = false;
		this.client = this.spawnClient();
	}

	stop(): string {
		this.shouldStop = true;

		if (this.client != null) {
			this.client.destroy();
		}

		return this.clientId;
	}

	private spawnClient(): Client {
		if (this.running) {
			return this.client!;
		}
		this.running = true;

		const client = new Client({
			transport: "ipc",
		});

		client.on("ready", async () => {
			while (!this.shouldStop) {
				client.setActivity(await this.getPresence());
				await sleep(3000); // Locked by the API to 15 seconds, but we set it lower so it feels more responsive
			}
			this.running = false;
		});

		client.login({ clientId: this.clientId }).catch(Logger.error);

		return client;
	}

	private async getPresence(): Promise<Presence> {
		if (this.clientId === CLIENT_ID) {
			return {
				details: this.gameInfo.rpState || getReadableState(this.gameInfo),
				state: this.gameInfo.rpState == null ? undefined : getReadableState(this.gameInfo),
				startTimestamp: this.startTimestamp,
				largeImageKey: "game-controller",
				smallImageKey: "play-button",
				instance: false,
			};
		}
		return {
			details: this.gameInfo.rpState || getReadableState(this.gameInfo),
			state: this.gameInfo.rpState == null ? undefined : getReadableState(this.gameInfo),
			startTimestamp: this.startTimestamp,
			largeImageKey: (await getApplicationIcon(this.clientId)) || undefined,
			instance: false,
		};
	}
}
