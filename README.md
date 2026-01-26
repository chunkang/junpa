# What is junpa?
Junpa is originally from nickname for Johnny at home which is named by Father. This app is streaming video based on google drive.

# Why we decided to start this project?
Just dreammed to provide a platform where everybody can stream their own story with no additional burden during the conversation between Johnny and Chun.
Google Drive was thought to be used to use streaming storage and HTTP-based adaptive streaming source.

# Service Components
This app is composed of three parts
- admin web
- streamer
- frontend web

# video stream
We will have two different video streams
- On Demand Stream
- Live Playlist

# admin web
In order to access, user have to sign-in Google Account for accessing Google Drive
We will save all profiles at /.junpa at Google Drive
We will build video library for streaming which format is based in json and will be stored at /.junpa/library.json
Each video have its own unique ID.
User can select video content from Google Photo or upload the video directly.
Each video content should have its title name. The filename can be used as video title in default.
We can build playlist based on video library.
Each playlist has its own starting time (start_at).

# streamer
- streamer is for supporting the live playlist we created in admin web.
- when user access the streaming URL, the playback position should be based in the progreess point, not the beginning of the playlist.
- when the playback position reaches at the end, the playback will be restarted from the beginning again.

# frontend web
- show the list of the registered video assets
- show the live channels that is created as playlist.
