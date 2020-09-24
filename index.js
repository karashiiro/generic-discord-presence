/* eslint-disable */
const { Plugin } = require("powercord/entities");
const { getModule } = require("powercord/webpack");
const { get, post } = require("powercord/http");
const { sleep } = require("powercord/util");

const { Settings } = require("./components/Settings");
const { Http, Logger, _ } = require("./build/service");
const { main } = require("./build/generic-discord-rich-presence");

module.exports = class GenericDiscordRichPresence extends Plugin {
	async startPlugin() {
		const { getActivities } = await getModule(["getActivities"]);
		const { getCurrentUser } = await getModule(["getCurrentUser"]);
		const { getCurrentGame } = await getModule(["getCurrentGame", "getGameForPID"]);
		const lodash = await getModule(["add", "chunk", "isEqual"]);

		powercord.api.settings.registerSettings("generic-discord-rich-presence", {
			category: this.entityID,
			label: "Generic Rich Presence",
			render: (props) => {
				props.getCurrentGame = getCurrentGame;
				return Settings(props);
			},
		});

		const getCurrentUserAsync = async () => {
			let user;
			while (!(user = getCurrentUser())) {
				await sleep(1000);
			}
			return user;
		};

		const getCurrentOkGame = async (currApplicationId, name) => {
			if (!this.settings.get("rpEnabledAll", true)) return null;

			const { id } = await getCurrentUserAsync();

			const currentGame = getCurrentGame();
			if (currentGame == null) return null;

			// Don't include custom statuses
			const activities = getActivities(id).filter((activity) => activity.type !== 4);

			// Die if Rich Presence is already enabled from another application
			if (activities.some((a) => a.name === name && a.application_id !== currApplicationId))
				return null;

			if (!this.settings.get(`rpEnabled_${currentGame.name.replace(/\s+/g, "")}`, true))
				return null;

			return currentGame;
		};

		const getSteamId = () => {
			return this.settings.get("rpSteamId", "");
		};

		_.initialize(lodash);

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

		this.closePlugin = await main({
			getCurrentGame: getCurrentOkGame,
			getSteamId: getSteamId,
		});
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings("generic-discord-rich-presence");
		this.closePlugin();
	}
};
