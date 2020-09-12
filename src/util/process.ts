import * as winInfo from "@arcsine/win-info";
import psList from "ps-list";
import { WINDOW_ALIASES } from "../data/WINDOW_ALIASES";

export async function isFocused(pid: number): Promise<boolean> {
	const activeWindow = await winInfo.getActive();
	const targetWindow = await winInfo.getByPid(pid);
	return activeWindow.id === targetWindow.id;
}

export async function getPidOfWindow(name: string, retries: number = 0): Promise<number> {
	const processes = await psList();

	for (const process of processes) {
		let processWindowName: string;
		try {
			processWindowName = await getWindowByPid(process.pid);
		} catch {
			continue;
		}

		const aliases = WINDOW_ALIASES.find((wa) => wa.name === name)?.aliases || [];

		if ([name, ...aliases].includes(processWindowName)) {
			return process.pid;
		}
	}

	if (retries > 0) {
		return getPidOfWindow(name, retries--);
	}
	return 0;
}

export async function getWindowByPid(pid: number): Promise<string> {
	return (await winInfo.getByPid(pid)).title;
}
