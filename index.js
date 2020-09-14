/* eslint-disable */
const { Plugin } = require("powercord/entities");
const { getModule, getAllModules } = require("powercord/webpack");
const { get, post } = require("powercord/http");
const { sleep } = require("powercord/util");

const { Settings } = require("./components/Settings");
const { Http, Logger, LoDashHost } = require("./build/service");
const { main } = require("./build/generic-discord-rich-presence");

module.exports = class GenericDiscordRichPresence extends Plugin {
	async startPlugin() {
		const { getActivities } = await getModule(["getActivities"]);
		const { getCurrentUser } = await getModule(["getCurrentUser"]);
		const { getCurrentGame } = await getModule(["getCurrentGame", "getGameForPID"]);
		const { getToken } = await getModule(["getToken"]);
		const _ = await getModule(["add", "chunk", "isEqual"]);

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

		const search = /(isEqual)/gi;
		const modules = getAllModules(
			(module) =>
				Object.keys(module).some((key) => key.match(search)) ||
				(module.__proto__ && Object.keys(module.__proto__).some((key) => key.match(search))),
		);
		this.log(modules);
		const thing = await getModule(["add", "isEqual"]);
		setInterval(async () => {
			this.log(thing);
		}, 5000);

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

			if (!this.settings.get(`rpEnabled_${currentGame.name.replace(/\s+/g, "")}`, false))
				return null;

			return currentGame;
		};

		const _getAllConnections = async () => {
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

		LoDashHost.initialize(_);

		Logger.initialize({
			self: this,
			log: this.log,
			debug: this.debug,
			warn: this.warn,
			error: this.error,
		});

		this.closePlugin = await main({
			getCurrentGame: getCurrentOkGame,
			getAllConnections: _getAllConnections,
		});
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings("generic-discord-rich-presence");
		this.closePlugin();
	}
};
