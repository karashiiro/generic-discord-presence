/* eslint-disable */
const base64Img = require("base64-img");
const fs = require("fs");
const jimp = require("jimp");
const tmp = require("tmp");
const util = require("util");
const webp = require("webp-converter");
const GenericRequest = require("../../../../fake_node_modules/powercord/http/GenericRequest");
const { sleep } = require("../../../../fake_node_modules/powercord/util");

const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

const USER_TOKEN = process.env["GRP_APPLICATION_USER_TOKEN"];

function get(url) {
	return new GenericRequest("GET", url).execute();
}

function post(url, data, contentType) {
	return new GenericRequest("POST", url)
		.set("Content-Type", contentType)
		.set("Authorization", USER_TOKEN)
		.send(data)
		.execute();
}

async function getApplications() {
	const res = await new GenericRequest("GET", "https://discord.com/api/v8/applications")
		.set("Authorization", USER_TOKEN)
		.execute();
	return res.body;
}

async function discordWebpToPngBase64(applicationId, key) {
	const url = `https://cdn.discordapp.com/app-icons/${applicationId}/${key}.webp?size=1024&keep_aspect_ratio=false`;

	const fileHandle = tmp.fileSync();
	await writeFile(fileHandle.name, (await get(url)).raw);

	const newFileName = fileHandle.name + ".png";
	console.log(await webp.dwebp(fileHandle.name, newFileName, "-o"));

	fileHandle.removeCallback();

	return new Promise((resolve) => {
		jimp.read(newFileName, (_, jImage) => {
			jImage.resize(1024, 1024).write(newFileName, () => {
				resolve([base64Img.base64Sync(newFileName), () => unlink(newFileName)]);
			});
		});
	});
}

async function initializeApplications() {
	const dic = {};

	// Start from where we left off
	const existing = await getApplications();
	const gamesList = JSON.parse(
		(
			await get(
				"https://gist.githubusercontent.com/DeadSix27/b8e377c9fed6d98bff22dcdf8807e207/raw/52d1f2d31be7168a0486a3a355e06a2d751bdc44/gameslist.json",
			)
		).raw.toString(),
	);
	for (const game of existing) {
		dic[gamesList.find((g) => g.name === game.name).id] = game.id;
	}

	const trimmedGamesList = gamesList.filter(
		(game) => !existing.map((o) => o.name).includes(game.name),
	);
	console.log(trimmedGamesList.length, "applications to initialize.");

	for (const game of trimmedGamesList) {
		const { id, name, icon, splash } = game;
		if (id == null || name == null || (splash == null && icon == null)) continue;

		const largeImageKey = splash || icon;
		const smallImageKey = splash == null ? null : icon;

		let b64Large, closeLarge, b64Small, closeSmall;
		try {
			[b64Large, closeLarge] = await discordWebpToPngBase64(id, largeImageKey);
			[b64Small, closeSmall] = await discordWebpToPngBase64(id, smallImageKey);
		} catch (err) {
			console.error("Image processing error!", err, "Skipping...");
			continue;
		}

		console.log("Creating application for object", name);
		let createRes;
		try {
			createRes = await post(
				"https://discord.com/api/v8/applications",
				{
					name,
					team_id: null,
				},
				"application/json",
			);
		} catch (err) {
			console.error("Critical error!", err);
			await writeFile("dictionary.txt", JSON.stringify(dic));
			return;
		}
		console.log("Created object successfully with ID:", createRes.body.id);

		const applicationId = createRes.body.id;

		// The rate limiting on these endpoints is really harsh; they aren't
		// supposed to be used for automation at all. Exceeding the rate limit
		// will bust you for 3 hours (10800 seconds).
		await sleep(60000);

		console.log("Uploading large image for object", name);
		try {
			await post(
				`https://discord.com/api/v8/oauth2/applications/${applicationId}/assets`,
				{
					image: b64Large,
					name: "large",
					type: "1",
				},
				"application/json",
			);

			await closeLarge();
		} catch (err) {
			console.error("Critical error!", err);
			await writeFile("dictionary.txt", JSON.stringify(dic));
			return;
		}
		console.log("Uploaded large image successfully.");

		await sleep(60000);

		if (smallImageKey != null) {
			console.log("Uploading small image for object", name);
			try {
				await post(
					`https://discord.com/api/v8/oauth2/applications/${applicationId}/assets`,
					{
						image: b64Small,
						name: "small",
						type: "1",
					},
					"application/json",
				);

				await closeSmall();
			} catch (err) {
				console.error("Critical error!", err);
				await writeFile("dictionary.txt", JSON.stringify(dic));
				return;
			}
			console.log("Uploaded small image successfully.");

			await sleep(60000);
		}

		dic[id] = applicationId;
		await writeFile("dictionary.txt", JSON.stringify(dic));
	}
}

initializeApplications();
