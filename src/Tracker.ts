import { EventEmitter } from "events";
import { _ } from "./service";
import { sleep } from "./util";

export class Tracker<TReturn> extends EventEmitter {
	private running: boolean;
	private shouldStop: boolean;

	private updateInterval: number;

	private currentState: TReturn | null;
	private getState: GetState<TReturn>;

	constructor(getState: GetState<TReturn>, updateInterval: number) {
		super();

		this.running = false;
		this.shouldStop = false;

		this.currentState = null;

		this.getState = getState;

		this.updateInterval = updateInterval;
	}

	start() {
		this.shouldStop = false;
		this.scan();
	}

	stop() {
		this.shouldStop = true;
	}

	private async scan() {
		if (this.running) return;
		this.running = true;

		while (!this.shouldStop) {
			const newState = await this.getState();

			if (!_.isEqual(this.currentState, newState)) {
				this.emit("changed", newState);
				this.currentState = newState;
			}

			await sleep(this.updateInterval);
		}

		this.running = false;
	}
}

export type GetState<TReturn> = (() => Promise<TReturn>) | (() => TReturn);

interface TrackerEvents<TReturn> {
	changed: (newState: TReturn) => void;
}

export declare interface Tracker<TReturn> {
	on<U extends keyof TrackerEvents<TReturn>>(event: U, listener: TrackerEvents<TReturn>[U]): this;

	once<U extends keyof TrackerEvents<TReturn>>(event: U, listener: TrackerEvents<TReturn>[U]): this;

	emit<U extends keyof TrackerEvents<TReturn>>(
		event: U,
		...args: Parameters<TrackerEvents<TReturn>[U]>
	): boolean;
}
