# ⚠️ DISCLAIMER
I did not understand Javascript when I wrote this. I have no idea if it's stable or might crash your computer. Please don't hold me liable for anything that ensues from using this. Also, this is a shitpost; please do not take it seriously.

---

## AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Welcome to MemeBot™.

### Usage
- `npm run bot`
- Every now and then, memebot will spot a meme in someone's post and will enthusiastically jump into the chat to show you!
- If you mention certain words or phrases while in VC, memebot will join VC with you to give you some hearty chuckles. 
- `@memebot stfu` interrupts the currently playing meme soundbyte.
- `@memebot gtfo` tells memebot to leave the VC channel.

### Adding audio files
Just some conventions to follow:
- Trim the file appropriately.
- Do your best to remove background noise ([Audacity](http://www.darkaudacity.com/download.html): `Effects > Noise Reduction`).
- Normalise the audio to -1.0 dB ([Audacity](http://www.darkaudacity.com/download.html): `Effects > Normalize`).
- Save the file as an appropriately named Ogg Vorbis file (quality 10, unless the file is larger than 1 MB).
- Make sure it's funny.

work everything else out yourself lolol,,, it's not my job to educate you 😂💯

### To Do
~~lmao none of this is ever getting done~~
- Disconnect from VC after no trigger has been called for a period of time
- Multi-word triggers overrule single-word triggers (e.g. `not funny` overrules `funny` if matched)
- Discord message API to upload soundbytes (give externally hosted file link?) or set trigger words
- Discord message API to alter settings (e.g. change `MEME_PROBABILITY`, change the channel-join soundbyte)
- Enable meme-recognition to play a meme audio if present in VC
- Add audio and trigger encryption based on server ID (add privacy policy!)
- Normalise audio files on upload (`npm/normalize-volume`)
- Server-customisable command aliases
- Role-specific trigger permissions (e.g. restrict uploaded memes/triggered memes to messages posted by users with a certain role)
- Set `WORD_MEME_ALIASES` array to prevent matching similarish words (e.g. `memed`)?
- Allow `WORD_MEME` to be an array (match multiple meme words)
