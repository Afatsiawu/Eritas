
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config({ path: './.env' });

async function testSpotify() {
    console.log("Testing Spotify Credentials...");
    console.log("Client ID:", process.env.SPOTIFY_CLIENT_ID);

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    try {
        const data = await spotifyApi.clientCredentialsGrant();
        console.log('Access token retrieved successfully!');
        spotifyApi.setAccessToken(data.body['access_token']);

        const search = await spotifyApi.searchTracks('Harry Styles');
        console.log('Search successful! Found', search.body.tracks.total, 'tracks.');
    } catch (error) {
        console.error('Error testing Spotify:', error.message);
        if (error.body) console.error('Details:', error.body);
    }
}

testSpotify();
