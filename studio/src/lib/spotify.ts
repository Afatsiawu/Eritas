/**
 * @fileOverview A service for interacting with the Spotify Web API via Backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/spotify` : "http://localhost:3000/spotify";

/**
 * Searches for tracks on Spotify via Backend.
 * @param {string} query The search query.
 * @param {number} [limit=10] The maximum number of results to return.
 * @returns {Promise<any[]>} A promise that resolves to an array of track items.
 */
export async function searchTracks(query: string, limit: number = 10): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
        throw new Error(`Failed to search Spotify tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Backend returns items directly
}

/**
 * Searches for artists on Spotify.
 * Note: Backend currently only implements track search. 
 * For full parity, backend needs artist search update or fallback.
 * For now, we will just return empty or error if backend doesn't support.
 * Update: I will implement a quick mock or TODO since backend only has "searchTracks".
 * Actually, let's just leave it aiming at tracks for now or update backend later.
 */
export async function searchArtists(query: string, limit: number = 20): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/artists?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Failed to search Spotify artists: ${response.statusText}`);
    }
    return await response.json();
}

export async function getArtist(artistId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/artist/${artistId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch artist details: ${response.statusText}`);
    }
    return await response.json();
}

export async function getArtistAlbums(artistId: string, limit: number = 20): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/artist/${artistId}/albums?limit=${limit}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch artist albums: ${response.statusText}`);
    }
    return await response.json();
}

export async function getAlbumTracks(albumId: string, limit: number = 50): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/album/${albumId}/tracks`);
    if (!response.ok) {
        throw new Error(`Failed to fetch album tracks: ${response.statusText}`);
    }
    return await response.json();
}
