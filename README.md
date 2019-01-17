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


## FlagCarrier Configuration

You will need to install the [speedcontrol-flagcarrier](https://github.com/speedcontrol/speedcontrol-flagcarrier) bundle to use this part, along with using one of the FlagCarrier applications to set them.

For donation readers (the ones off camera), their group_id should be `donations`, and there should only be 1 position, which should be `reader`.

For hosts (the ones on camera), their group_id should be `hosts`, and the available positions should be `left`, `midleft`, `middle`, `midright` and `right`.