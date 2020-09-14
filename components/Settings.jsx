/* eslint-disable */
const { React } = require("powercord/webpack");
const { Text } = require("powercord/components");

// I would write this in TypeScript for consistency (wouldn't get Intellisense with
// Powercord stuff), but it's not worthwhile to jump through the hoops needed to
// transpile to JSX without installing my own copy of React and doing ../../../../
// to get to the Powercord components.

function Settings(props) {
	const { getSetting, updateSetting, toggleSetting } = props;

	return (
		<div>
			<Text>Hi yes hello</Text>
		</div>
	);
}

module.exports = { Settings };
