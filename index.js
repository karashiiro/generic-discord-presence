/* eslint-disable */
const { Plugin } = require("powercord/entities");
const { getModule } = require("powercord/webpack");
const { get } = require("powercord/http");
const { sleep } = require("powercord/util");

const { Http } = require("./build/Http");
const { Logger } = require("./build/Logger");
const { main } = require("./build/generic-discord-rich-presence");

module.exports = class GenericDiscordRichPresence extends Plugin {
	async startPlugin() {
		const { getActivities } = await getModule(["getActivities"]);
		const { getCurrentUser } = await getModule(["getCurrentUser"]);
		const { getCurrentGame } = await getModule(["getCurrentGame", "getGameForPID"]);
		const { getToken } = await getModule(["getToken"]);

		const getCurrentUserId = async () => {
			let user;
			while (!(user = getCurrentUser())) {
				await sleep(1000);
			}
			return user;
		};

		const getCurrentUntouchedGame = async (currApplicationId, name) => {
			const { id } = await getCurrentUserId();

			// Don't include custom statuses or games that already have Rich Presence.
			const activities = getActivities(id).filter((activity) => activity.type !== 4);

			if (
				activities.length === 0 ||
				activities.some((a) => a.name === name && a.application_id !== currApplicationId)
			)
				return null;

			return getCurrentGame();
		};

		const getAllConnections = async () => {
			const { id } = await getCurrentUserId();

			return (
				await get(`https://canary.discordapp.com/api/v8/users/${id}/profile`)
					.set("authorization", getToken())
					.execute()
			).body.connected_accounts;
		};

		Http.initialize({
			get: (url) => get(url).execute(),
		});

		Logger.initialize({
			self: this,
			log: this.log,
			debug: this.debug,
			warn: this.warn,
			error: this.error,
		});

		this.closePlugin = await main(getCurrentUntouchedGame, getAllConnections);
	}

	pluginWillUnload() {
		this.closePlugin();
	}
};
