/* eslint-disable */
const { Plugin } = require("powercord/entities");
const { getModule } = require("powercord/webpack");
const { Logger } = require("./build/Logger");
const { main } = require("./build/generic-discord-rich-presence");

module.exports = class GenericDiscordRichPresence extends Plugin {
	async startPlugin() {
		const { getActivities } = await getModule(["getActivities"]);
		const { getCurrentUser } = await getModule(["getCurrentUser"]);

		let getCurrentGame = () => {
			const user = getCurrentUser();
			if (user == null) return ""; // user can be null on initialization

			// Don't include custom statuses or games that already have Rich Presence.
			const activities = getActivities(user.id).filter(
				(activity) => activity.type !== 4 && !activity.assets && !activity.state,
			);

			const { name } = activities[0] || { name: "" };

			return name;
		};

		Logger.initialize({
			self: this,
			log: this.log,
			debug: this.debug,
			warn: this.warn,
			error: this.error,
		});

		main(getCurrentGame);
	}
};
