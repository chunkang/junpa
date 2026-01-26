# What is junpa?
Junpa is originally from nickname for Johnny at home which is named by Father. This app is streaming video based on google drive.

# Why do we decided to start this project?
Just dreammed to create a platform where everybody can stream their own story with minimized financial burden during the conversation between Johnny and Chun.
Google Drive was thought to be used to use streaming storage and HTTP-based adaptive streaming source.
Regarding account management, Google Account solved all other painful development, so we can just focus on the development.

# Service Components
This app is composed of three parts
- Admin Web
- Streamer
- Frontend Web

# Video Stream
We will have two different video streams
- On Demand Stream - pointing to the video assets we created
- Live Playlist - video playlist based on multiple set of "On Demand Stream" which has start_at as the beginning of stream. "Live Playlist" will work like Live TV.

# Admin Web
- In order to access, user have to sign-in Google Account for accessing Google Drive
- We will save all profiles at /.junpa at Google Drive
- We will build video library for streaming which format is based in json and will be stored at /.junpa/library.json
- Each video have its own unique ID.
- User can select video content from Google Photo or upload the video directly.
- Each video content should have its title name. The filename can be used as video title in default.
- We can build playlist based on video library.
- Each playlist has its own starting time (start_at) and created time (created_at).
- We can pick specific "On Demand Stream" or "Live Playlist" as featured content.

# Streamer
- Each user will have its own service URL based in Google Account - it can be based in user email address
- Streamer is for supporting the live playlist we created in admin web.
- When user access the streaming URL, the playback position should be based in the progreess point, not the beginning of the playlist.
- When the playback position reaches at the end, the playback will be restarted from the beginning again.

# Frontend web
The Frontend web is what the user will be faced.
- Show the list of the registered video assets
- Show the live channels that is created as playlist.
