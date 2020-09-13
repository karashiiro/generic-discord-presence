import { Client } from "discord-rpc";
import { Logger } from "./service";
import { GameInfo, getPresence, sleep } from "./util";

export class GameRPC {
	public readonly clientId: string;

	private gameInfo: GameInfo;

	private client: Client | undefined;

	private running: boolean;
	private shouldStop: boolean;

	constructor(gameInfo: GameInfo, clientId: string) {
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
				client.setActivity(await getPresence(this.gameInfo, this.clientId));
				await sleep(3000); // Locked by the API to 15 seconds, but we set it lower so it feels more responsive
			}
			this.running = false;
		});

		client.login({ clientId: this.clientId }).catch(Logger.error);

		return client;
	}
}
