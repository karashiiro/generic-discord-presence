import activeWin, { LinuxResult, MacOSResult, WindowsResult } from "active-win";

// Discord does have an isFocused function, but it's unclear what its parameter is.
export async function isFocused(pid: number): Promise<boolean> {
	let activeWindow: MacOSResult | LinuxResult | WindowsResult | undefined;
	try {
		activeWindow = await activeWin();
	} catch {
		return false;
	}
	return activeWindow?.owner.processId === pid;
}
