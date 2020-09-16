/* eslint-disable */
const {
	React,
	React: { useEffect, useState },
} = require("powercord/webpack");
const { SwitchItem } = require("powercord/components/settings");

function Settings({ getSetting, toggleSetting, getCurrentGame }) {
	let game = getCurrentGame();
	const [currentGame, setCurrentGame] = useState(game ? game.name : null);

	useEffect(() => {
		setInterval(() => {
			game = getCurrentGame();
			setCurrentGame(game ? game.name : null);
		}, 1000);
	});

	return (
		<div>
			<SwitchItem
				onChange={() => {
					toggleSetting("rpEnabledAll");
				}}
				note={"Toggle Rich Presence for all applications."}
				value={getSetting("rpEnabledAll", true)}
			>
				Global
			</SwitchItem>
			<SwitchItem
				onChange={() => {
					toggleSetting(`rpEnabled_${currentGame.replace(/\s+/g, "")}`);
				}}
				note={"Toggle Rich Presence for this game."}
				value={
					currentGame != null
						? getSetting(`rpEnabled_${currentGame.replace(/\s+/g, "")}`, true)
						: false
				}
				disabled={currentGame == null}
			>
				{currentGame || "(No game detected)"}
			</SwitchItem>
		</div>
	);
}

module.exports = { Settings };
