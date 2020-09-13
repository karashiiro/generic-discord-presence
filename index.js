/* eslint-disable */
const { Plugin } = require("powercord/entities");
const { getModule } = require("powercord/webpack");
const { get, post } = require("powercord/http");
const { sleep } = require("powercord/util");

const { Http, Logger } = require("./build/service");
const { main } = require("./build/generic-discord-rich-presence");

module.exports = class GenericDiscordRichPresence extends Plugin {
	async startPlugin() {
		const { getActivities } = await getModule(["getActivities"]);
		const { getCurrentUser } = await getModule(["getCurrentUser"]);
		const { getCurrentGame } = await getModule(["getCurrentGame", "getGameForPID"]);
		const { getToken } = await getModule(["getToken"]);

		const getCurrentUserAsync = async () => {
			let user;
			while (!(user = getCurrentUser())) {
				await sleep(1000);
			}
			return user;
		};

		const getCurrentUntouchedGame = async (currApplicationId, name) => {
			const { id } = await getCurrentUserAsync();

			// Don't include custom statuses
			const activities = getActivities(id).filter((activity) => activity.type !== 4);

			// Die if Rich Presence is already enabled from another application
			if (
				activities.length === 0 ||
				activities.some((a) => a.name === name && a.application_id !== currApplicationId)
			)
				return null;

			return getCurrentGame();
		};

		const getAllConnections = async () => {
			// We don't need the return value, just want to be sure we're logged-in so we have a token.
			await getCurrentUserAsync();

			// There's a Discord function that does this somewhere, but I simply can't find it.
			return (
				await get(`https://canary.discordapp.com/api/v8/users/@me/connections`)
					.set("authorization", getToken())
					.execute()
			).body;
		};

		Http.initialize({
			get: (url) => get(url).execute(),
			post: (url, data, contentType) =>
				post(url).set("Content-Type", contentType).send(data).execute(),
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
