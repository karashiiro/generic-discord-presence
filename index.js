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
		const { getCurrentUser } = await getModule(["getCurrentUser"]);
		const { getToken } = await getModule(["getToken"]);
		const { getCurrentGame } = await getModule(["getCurrentGame", "getGameForPID"]);

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

		const getAllConnections = async () => {
			let user;
			while (!(user = getCurrentUser())) {
				await sleep(1000);
			}
			const { id } = user;
			return (
				await get(`https://canary.discordapp.com/api/v8/users/${id}/profile`)
					.set("authorization", getToken())
					.execute()
			).body.connected_accounts;
		};

		this.closePlugin = await main(getCurrentGame, getAllConnections);
	}

	pluginWillUnload() {
		this.closePlugin();
	}
};
