# esas18-layouts#esamov18
The on-screen graphics used during European Speedrunner Assembly Movember 2018.

This NodeCG bundle also needs [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol) to change run information, play Twitch ads, etc.

This bundle also heavily relies on the [obs-websocket](https://github.com/Palakis/obs-websocket) plugin, so make sure you have this installed (custom address/port and password can be specified in the bundle's config if needed).

## Music Playback
This bundle interfaces with a [Music Player Daemon (MPD)](https://www.musicpd.org/) server for music playback. Nothing fancy is needed; if you get a build of MPD and run with a config like this, everything that needs to be done will be done by this bundle when/if needed. You could also configure MPD to use some alternative sound card if needed (although not documented here).

```
music_directory "C:/directory/of/music"
db_file "mpd.db"
log_file "mpd.log"
state_file "state"
```

I also like to use a batch file like this to run MPD on Windows, to try and make sure it has CPU priority.

```
START mpd.exe mpd.conf
WMIC process where name="mpd.exe" CALL setpriority "above normal"
```

## Automatic Twitch Ads
To have Twitch ads play automatically when you switch to a certain scene, put `(ads)` somewhere in the scene's name.

## Transition
For the overlay transition to work, you need to add a new Stinger, call it `Blank Stinger`, set it to the `BlankTransition.mov` file in the `obs-assets` directory in this bundle, and set the transition point to 900ms.

## FlagCarrier Configuration
You will need to install the [speedcontrol-flagcarrier](https://github.com/speedcontrol/speedcontrol-flagcarrier) bundle to use this part, along with using one of the FlagCarrier applications to set them.

For donation readers (the ones off camera), their group_id should be `donations`, and there should only be 1 position, which should be `reader`.

For hosts (the ones on camera), their group_id should be `hosts`, and the available positions should be `left`, `midleft`, `middle`, `midright` and `right`.

## "Featured Channels" Twitch Extension
This bundle has the ability to automatically update the [Featured Channels](https://www.twitch.tv/ext/3zorofke3r7bu8pd0mb7s86qtfrgzj) Twitch extension, currently using the FrankerFaceZ support from the speedcontrol bundle to know when/what to set these as. For this to work a token from the extension must be supplied in the config.