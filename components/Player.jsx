import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const Player = ({
  globalCurrentSongId,
  setGlobalCurrentSongId,
  globalIsTrackPlaying,
  setGlobalIsTrackPlaying
}) => {
  const { data: session } = useSession();
  const [songInfo, setSongInfo] = useState(null);

  // Fetch detailed info for the track
  async function fetchSongInfo(trackId) {
    if (trackId && session?.accessToken) {
      try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSongInfo(data);
        } else {
          console.error("Failed to fetch track info:", response.status);
        }
      } catch (error) {
        console.error("Error fetching track info:", error);
      }
    }
  }

  // Retrieve the currently playing track and device info
  async function getCurrentlyPlaying() {
    if (!session?.accessToken) return null;
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });
      if (response.status === 204) {
        console.log("No track is currently playing (204 response)");
        return null;
      }
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Error fetching currently playing track:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error in getCurrentlyPlaying:", error);
      return null;
    }
  }

  // Handle play/pause action
  async function handlePlayPause() {
    if (!session?.accessToken) return;

    const currentlyPlaying = await getCurrentlyPlaying();
    if (!currentlyPlaying || !currentlyPlaying.item) {
      console.log("No active device or no track playing. Please open Spotify on a device.");
      return;
    }

    try {
      if (currentlyPlaying.is_playing) {
        // Pause playback
        const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });
        if (response.status === 204) {
          setGlobalIsTrackPlaying(false);
        } else {
          console.error("Failed to pause playback:", response.status);
        }
      } else {
        // Resume playback. Adding an empty JSON body and Content-Type header.
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({}) // empty body in case the endpoint requires it
        });
        if (response.status === 204) {
          setGlobalIsTrackPlaying(true);
          setGlobalCurrentSongId(currentlyPlaying.item.id);
        } else {
          console.error("Failed to resume playback:", response.status);
        }
      }
    } catch (error) {
      console.error("Error in handlePlayPause:", error);
    }
  }

  // Effect to fetch song info when the current song changes or when the session is ready
  useEffect(() => {
    async function fetchData() {
      if (session?.accessToken) {
        if (!globalCurrentSongId) {
          // Get the currently playing track from Spotify
          const currentlyPlayingData = await getCurrentlyPlaying();
          if (currentlyPlayingData && currentlyPlayingData.item) {
            setGlobalCurrentSongId(currentlyPlayingData.item.id);
            if (currentlyPlayingData.is_playing) {
              setGlobalIsTrackPlaying(true);
            }
            await fetchSongInfo(currentlyPlayingData.item.id);
          }
        } else {
          await fetchSongInfo(globalCurrentSongId);
        }
      }
    }
    fetchData();
    // Run the effect whenever the current song or session changes
  }, [globalCurrentSongId, session, setGlobalCurrentSongId, setGlobalIsTrackPlaying]);

  return (
    <div className='h-24 bg-neutral-800 border-t border-neutral-700 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8'>
      <div className='flex items-center space-x-4'>
        {songInfo?.album?.images?.[0]?.url && (
          <img
            className='hidden md:inline h-10 w-10'
            src={songInfo.album.images[0].url}
            alt="Album cover"
          />
        )}
        <div>
          <p className='text-white text-sm'>{songInfo?.name}</p>
          <p className='text-neutral-400 text-xs'>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>
      <div className='flex items-center justify-center'>
        {globalIsTrackPlaying ? (
          <PauseCircleIcon
            onClick={handlePlayPause}
            className='h-10 w-10 cursor-pointer'
          />
        ) : (
          <PlayCircleIcon
            onClick={handlePlayPause}
            className='h-10 w-10 cursor-pointer'
          />
        )}
      </div>
      <div></div>
    </div>
  );
};

export default Player;
