/* eslint-disable */
const { React } = require("powercord/webpack");
const { SwitchItem } = require("powercord/components/settings");

const { useEffect, useState } = React;

// I would write this in TypeScript for consistency (wouldn't get Intellisense with
// Powercord stuff), but it's not worthwhile to jump through the hoops needed to
// transpile to JSX without installing my own copy of React and doing ../../../../
// to get to the Powercord components.

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
					toggleSetting(`rpEnabled_${currentGame.replace(/\s+/g, "")}`);
				}}
				note={`Turn ${currentGame != null ? "off" : "on"} Rich Presence for this game.`}
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
