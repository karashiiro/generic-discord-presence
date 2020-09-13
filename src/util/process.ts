import * as winInfo from "@arcsine/win-info";
import { Logger } from "../Logger";

// Discord does have an isFocused function, but it's unclear what its parameter is.
export async function isFocused(pid: number): Promise<boolean> {
	let activeWindow: winInfo.Response;
	let targetWindow: winInfo.Response;
	try {
		activeWindow = await winInfo.getActive();
		targetWindow = await winInfo.getByPid(pid);
	} catch (err) {
		Logger.debug(
			"Window detection failed. This is probably normal, and means your game is unfocused and running in fullscreen mode. Error message:",
			err,
		);
		return false;
	}
	return activeWindow.id === targetWindow.id;
}
