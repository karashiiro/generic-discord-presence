import { Client, Presence } from "discord-rpc";
import { GameInfo, getReadableState } from "./game";
import { Logger } from "./Logger";
import { sleep } from "./sleep";

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
				client.setActivity(this.presence);
				await sleep(1000); // Locked by the API to 15 seconds, but we set it lower so it feels more responsive
			}
			this.running = false;
		});

		client.login({ clientId: this.clientId }).catch(Logger.error);

		return client;
	}

	private get presence(): Presence {
		return {
			details: this.gameInfo.name,
			state: getReadableState(this.gameInfo),
			startTimestamp: this.startTimestamp,
			largeImageKey: "game-controller",
			largeImageText: "hi yes hello",
			smallImageText: "dummy",
			instance: false,
		};
	}
}
