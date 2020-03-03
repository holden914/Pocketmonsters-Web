# Pocketmonsters Web

Pocketmonsters: simple Phonegap mobile game. 

## Getting Started
To start the game in the browser execute the following commands in the terminal:
```
npm install
phonegap serve
```
Otherwise use phonegap run followed by the name of the platform (android / ios) to execute it on an emulator or a physical device:
```
phonegap run android
```

### Prerequisites

Executing the game will require you to have npm and phonegap installed. 
You will also need your own Google Maps JS api key in order to play the game.
Once you have it, change "YOUR_API_KEY" string inside the last script of the file map.html with your own key. 

```
<script src="https://maps.googleapis.com/maps/api/js?key=YOU_API_KEY&callback=initMap" async defer></script>
```