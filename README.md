# esas18-layouts

> The on-screen graphics used during European Speedrunner Assembly Summer 2018.

*This is a bundle for [NodeCG](https://nodecg.com/); if you do not understand what that is, we advise you read their website first for more information.*

This is a [NodeCG](https://nodecg.com) v1 bundle. You will need to have NodeCG v1 installed to run it. It also requires you to install the [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol) bundle.

This bundle heavily relies on the [obs-websocket](https://github.com/Palakis/obs-websocket) plugin, so make sure you have this installed (custom address/port and password can be specified in the bundle's config if needed).


## Music Playback

This bundle interfaces with a [Music Player Daemon (MPD)](https://www.musicpd.org/) server for music playback. Nothing fancy is needed; if you get a build of MPD and run with a config like this, everything that needs to be done will be done by this bundle when/if needed. You could also configure MPD to use some alternative sound card if needed (although not documented here).

```
music_directory "C:/directory/of/music"
db_file "mpd.db"
log_file "mpd.log"
state_file "state"
```


## Automatic Twitch Ads

To have Twitch ads play automatically when you switch to a certain scene, put `(ads)` somewhere in the scene's name.


## Transition

For the overlay transition to work, you need to add a new Stinger, call it `Blank Stinger`, set it to the `BlankTransition.mov` file in the `obs-assets` directory in this bundle, and set the transition point to 900ms.


## FlagCarrier Configuration

You will need to install the [speedcontrol-flagcarrier](https://github.com/speedcontrol/speedcontrol-flagcarrier) bundle to use this part, along with using one of the FlagCarrier applications to set them.

For donation readers (the ones off camera), their group_id should be `donations`, and there should only be 1 position, which should be `reader`.

For hosts (the ones on camera), their group_id should be `hosts`, and the available positions should be `left`, `midleft`, `middle`, `midright` and `right`.


## API Endpoints

These are mostly intended for using on a Stream Deck.

- `/api/playsponsorvideo` to trigger playing a sponsor video if applicable (the scene should be named `Sponsor Video`).
- `/api/changestctext` to change to/cycle the Save the Children blurb that is on the host dashboard.
- `/api/changesponsortext` to change to/cycle the sponsor blurb that is on the host dashboard.

## "Featured Channels" Twitch Extension
This bundle has the ability to automatically update the [Featured Channels](https://www.twitch.tv/ext/3zorofke3r7bu8pd0mb7s86qtfrgzj) Twitch extension, currently using the FrankerFaceZ support from the speedcontrol bundle to know when/what to set these as. For this to work a token from the extension must be supplied in the config.