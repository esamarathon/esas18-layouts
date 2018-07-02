# esas18-layouts
The on-screen graphics used during European Speedrunner Assembly Summer 2018

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
