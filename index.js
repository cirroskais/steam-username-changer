const crypto = require("crypto")
const totp = require("steam-totp-strict")
const SteamUser = require("steam-user")
const client = new SteamUser()

let updateLoop

client.on("loggedOn", (details, parental) => {
	if (updateLoop) return
	console.log(`Successfully logged into [STEAMID ${details.client_supplied_steamid}]`)
	updateLoop = setInterval(() => {
		const name = crypto.randomBytes(16).toString("hex")
		client.setPersona(SteamUser.EPersonaState.Online, name)
		console.log("Profile Name set to", name)
	}, 30 * 1000)
})

client.on("steamGuard", async (domain, callback, lastCodeWrong) => {
	if (lastCodeWrong) return console.log("FUCK FUCK FUCK")
	if (domain) console.log("Email sent to", domain)
	else totp.getTimeOffset((error, offset, latency) => callback(totp.getAuthCode(process.env.TOTP, offset)))
})

client.on("disconnected", async (eresult, msg) => {
	console.log("disconnected", eresult, msg)
})

client.on("error", async (error) => {
	console.log(error)
})

totp.getTimeOffset((error, offset, latency) => {
	client.logOn({
		accountName: process.env.USERNAME,
		password: process.env.PASSWORD,
		twoFactorCode: totp.getAuthCode(process.env.TOTP, offset),
	})
})
