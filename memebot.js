const SOUNDS_DIR = "memes/";
const JOIN_SOUNDBYTE = "reee.ogg";

// requires
const fs = require('fs');
const discord = require("discord.js");
const {sounds} = require("./sounds.js");

// discord authentication token
// NOTE: the replace() removes the ZWSP that randomly gets prepended, do not edit!
const DISCORD_AUTH = fs.readFileSync('./auth/discord.txt', {encoding: 'utf8', flag: 'r'}).replace("﻿", "");
const client = new discord.Client();
client.login(DISCORD_AUTH);

let connection;
let dispatcher;
let vcLastActiveTime = null;
const TIME_UNTIL_DC_FROM_VC = 100; // in ms

client.on("ready", () => {
	console.log("Logged in as " + client.user.tag + ".");
	console.log("*cracks knuckles* Fellas, let's meme.");
});

client.on("message", async message => {
	const BOT_USER_NUM = client.user.id;
	// avoid bot messages
	if (message.author.bot) {
		return;
	};

	// if (message.member.voice.channel) {
	try {
		if (message.member.voice.channel) {
			// interrupt soundbyte on command
			if (dispatcher && (message.content === "<@" + BOT_USER_NUM + "> stfu")) {
				dispatcher.destroy();
				vcLastActiveTime = 0;
				console.log(message.author.tag + " told me to shut up--- 😰");
				return;
			};
			
			// leave vc when told
			if (message.content === "<@" + BOT_USER_NUM + "> gtfo") {
				connection.disconnect();
				vcLastActiveTime = 0;
				console.log(message.author.tag + " told me to leave! 😭");
				return;
			};
					
			// detect and play triggered meme soundbytes
			// TODO: longer triggers overruling substrings (e.g. 'not funny' >>> 'funny')
			let matches = [];
			for (let trigger in sounds) {
				if (message.content.toLowerCase().search(trigger) >= 0) {
					matches.push(trigger);
				};
			};
			if (matches.length > 0) {
				const chosenTrigger = matches[Math.floor(Math.random()*matches.length)];
				const chosenSound = sounds[chosenTrigger][Math.floor(Math.random()*sounds[chosenTrigger].length)];
				sound_path = SOUNDS_DIR + chosenSound;
				console.log(sound_path + " requested by " + message.author.tag + ", joining VC~ 😊");
				connection = await message.member.voice.channel.join();
				dispatcher = connection.play(sound_path);
				vcLastActiveTime = new Date();
				return;
			};
		};
	} catch {
		console.log("Voice status bad");
	};
	
	// detect memes and reply with meme-pointers
	// this is a giant block of conditionals (think flowchart) being recursively traversed for each letter
	// TODO: optimise using search() and string-splicing?
	const MEME_PROBABILITY = 0.2;
	const WORD_MEME = "meme";
	checkMessageForMeme = (WORD_MEME, index, messageRaw, i, messageEdit, previousCharacterWasMemed) => {
		if (i === 0) {
			if (messageRaw[0].toLowerCase() === WORD_MEME[0]) {
					messageEdit = "__**" + messageRaw[0];
					return checkMessageForMeme(WORD_MEME, 1, messageRaw, 1, messageEdit, true);
			} else {
				messageEdit = messageRaw[0];
				return checkMessageForMeme(WORD_MEME, 0, messageRaw, 1, messageEdit, false);
			};
		} else {
			if (messageRaw[i].toLowerCase() === WORD_MEME[index]) {
				if (index === WORD_MEME.length - 1) {
					if (previousCharacterWasMemed === true) {
						if (i === messageRaw.length - 1) {
							return messageEdit + messageRaw[i] + "**__";
						} else {
							return messageEdit + messageRaw[i] + "**__" + messageRaw.substring(i+1);
						}
					} else {
						if (i === messageRaw.length - 1) {
								return messageEdit + "__**" + messageRaw[i] + "**__";
							} else {
								return messageEdit + "__**" + messageRaw[i] + "**__" + messageRaw.substring(i+1);
						}
					}
				} else {
					if (previousCharacterWasMemed === true) {
						messageEdit = messageEdit + messageRaw[i];
						return checkMessageForMeme(WORD_MEME, index + 1, messageRaw, i + 1, messageEdit, true)
					} else {
						messageEdit = messageEdit + "__**" + messageRaw[i];
						return checkMessageForMeme(WORD_MEME, index + 1, messageRaw, i + 1, messageEdit, true)
					}
				}
			} else {
				if (i === messageRaw.length - 1) {
					return "";
				} else {
					if (previousCharacterWasMemed === true) {
						messageEdit = messageEdit + "**__" + messageRaw[i];
						return checkMessageForMeme(WORD_MEME, index, messageRaw, i + 1, messageEdit, false)
					} else {
						messageEdit = messageEdit + messageRaw[i];
						return checkMessageForMeme(WORD_MEME, index, messageRaw, i + 1, messageEdit, false)
					}
				}
			}
		}
	};
	cleanMessageOfMD = (text) => {
		return text
			// Escape backslashes TODO FIX THIS
			.replace(/\\/g, "\\\\")
			// Remove bold
			.replace(/\*\*([\s\S]+)\*\*/gm, "$1")
			// Remove underline
			.replace(/__([\s\S]+)__/gm, "$1")
			// Remove italics
			.replace(/\*([\s\S]+)\*/gm, "$1")
			.replace(/_([\s\S]+)_/gm, "$1")
			// Remove strike-through
			.replace(/~~([\s\S]+)~~/gm, "$1")
			// Remove quote blocks
			.replace(/^> /gm, "\> ");
	};
	tidyMessageOfTagClutter = (message, text) => {
		message.content = text;
		clean = discord.Util.cleanContent(text, message);
		return clean	// NOTE: ZWSP occur below
			// Remove @everyone and @here
			.replace(/@([everyone|here])/g, "@$1")
			// Remove #1234 user discriminators
			.replace(/@(.+)#\d{4}/g, "@​$1")
	};
	// Check for memes if message:
	if (WORD_MEME.length <= message.content.length && // is long enough
			message.content.search(/([a-z]{2}:\/\/|`.+`)/im) === -1 && // doesn't contain a URL or code block
			!( message.content.toLowerCase().search(new RegExp("\\b" + WORD_MEME)) + 1 && // doesn't include the meme explicitly
				message.content.toLowerCase().search(new RegExp(WORD_MEME + "\\b")) + 1 ) &&
			Math.random() < MEME_PROBABILITY) {
		let memedMessage = checkMessageForMeme(WORD_MEME, 0, cleanMessageOfMD(message.content), 0, "", false);
		memedMessage = tidyMessageOfTagClutter(message, memedMessage);
		if (memedMessage !== "") {
			message.channel.send("> " + memedMessage.split("\n").join("\n> "));
			console.log("Meme detected in " + message.author.tag + "'s message... 👀");
			return;
		};
	};
});

// scream whenever somebody joins a channel
client.on("voiceStateUpdate", async function(oldState, newState) {
	const JOINBYTE_PROBABILITY = 1;
	if (client.user === newState.member.user) return;
	if ((oldState.channel === null && newState.channel !== null)
			|| ((oldState.channel !== null && newState.channel !== null)
			&& oldState.channel.id !== newState.channel.id)) {
		connection = await newState.member.voice.channel.join();
		dispatcher = connection.play(SOUNDS_DIR + JOIN_SOUNDBYTE);
		console.log(newState.member.user.tag + " just joined. REEE! 😩");
		vcLastActiveTime = new Date();
	}
});

// timer for auto-disconnecting from VC
// while (vcLastActiveTime) {
	// console.log(vcLastActiveTime + " / " + vcTimer);
	// let vcTimer = null;
	// do {
		// let vcTimer = new Date();
		// console.log(vcLastActiveTime + " / " + vcTimer);
	// } while (vcTimer - vcLastActiveTime < TIME_UNTIL_DC_FROM_VC);
	// connection.disconnect();
	// vcLastActiveTime = 0;
// };
