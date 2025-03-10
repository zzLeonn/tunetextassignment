import { 
  PauseCircleIcon, 
  PlayCircleIcon, 
  SpeakerWaveIcon, 
  MusicalNoteIcon 
} from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import Lyric from './Lyric';

const Player = ({ globalIsTrackPlaying, setGlobalIsTrackPlaying }) => {
  const { data: session, update } = useSession();
  const [volume, setVolume] = useState(50);
  const [debouncedVolume] = useDebounce(volume, 500);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackProgress, setTrackProgress] = useState(0); // current progress in ms
  const [trackDuration, setTrackDuration] = useState(0); // total duration in ms

  // Helper function to call Spotify API with token refresh if needed.
  const handleSpotifyApiCall = useCallback(
    async (url, options = {}) => {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (response.status === 401) {
        await update();
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
      }
      return response;
    },
    [session, update]
  );

  // Fetches the current track and updates state including progress and duration.
  const fetchCurrentTrack = useDebouncedCallback(async () => {
    try {
      const response = await handleSpotifyApiCall(
        'https://api.spotify.com/v1/me/player/currently-playing'
      );
      if (response.status === 200) {
        const data = await response.json();
        if (data && data.item) {
          setCurrentTrack({
            title: data.item.name,
            artist: data.item.artists.map((artist) => artist.name).join(', '),
            album: data.item.album.name,
            image: data.item.album.images[0]?.url,
          });
          setGlobalIsTrackPlaying(data.is_playing);
          setTrackProgress(data.progress_ms);
          setTrackDuration(data.item.duration_ms);
        }
      } else {
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  }, 1000);

  // Poll current track every 5 seconds.
  useEffect(() => {
    if (session?.accessToken) {
      fetchCurrentTrack();
      const interval = setInterval(fetchCurrentTrack, 5000);
      return () => clearInterval(interval);
    }
  }, [session, fetchCurrentTrack]);

  // Poll track progress every second while playing.
  useEffect(() => {
    let progressInterval = null;
    if (globalIsTrackPlaying && currentTrack) {
      progressInterval = setInterval(() => {
        setTrackProgress((prev) => {
          const newProgress = prev + 1000;
          return newProgress > trackDuration ? trackDuration : newProgress;
        });
      }, 1000);
    }
    return () => progressInterval && clearInterval(progressInterval);
  }, [globalIsTrackPlaying, currentTrack, trackDuration]);

  // Handle play/pause action.
  const handlePlayPause = async () => {
    if (!session?.accessToken) return;

    try {
      const endpoint = globalIsTrackPlaying ? 'pause' : 'play';
      const response = await handleSpotifyApiCall(
        `https://api.spotify.com/v1/me/player/${endpoint}`,
        { method: 'PUT' }
      );

      if (response.status === 204) {
        setGlobalIsTrackPlaying(!globalIsTrackPlaying);
        await fetchCurrentTrack();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  // Update Spotify volume when debouncedVolume changes.
  useEffect(() => {
    const setVolumeOnSpotify = async () => {
      if (session?.accessToken) {
        await handleSpotifyApiCall(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${debouncedVolume}`,
          { method: 'PUT' }
        );
      }
    };
    setVolumeOnSpotify();
  }, [debouncedVolume, session, handleSpotifyApiCall]);

  // Handle seeking the track.
  const handleSeek = async (e) => {
    const newPosition = Number(e.target.value);
    setTrackProgress(newPosition);
    if (session?.accessToken) {
      try {
        const response = await handleSpotifyApiCall(
          `https://api.spotify.com/v1/me/player/seek?position_ms=${newPosition}`,
          { method: 'PUT' }
        );
        if (response.status === 204) {
          // Successfully seeked.
        }
      } catch (error) {
        console.error('Seek error:', error);
      }
    }
  };

  // Format milliseconds into MM:SS.
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <Lyric
        currentTrack={currentTrack}
        showLyrics={showLyrics}
        setShowLyrics={setShowLyrics}
      />

    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-t border-gray-700/50 z-50"
    >
      <div className="w-full px-4 py-3 flex flex-col">
        {/* Progress Bar - Centered Above Controls */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 w-full max-w-[600px]">
          <input
            type="range"
            min="0"
            max={trackDuration}
            value={trackProgress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer 
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:bg-gray-300 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-700
              hover:[&::-webkit-slider-thumb]:bg-gray-200 transition-all"
          />
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between h-16 mt-4"> {/* Added mt-4 for spacing */}
          {/* Left Section: Album Art & Song Info */}
          <div className="flex items-center gap-4 flex-1">
            {currentTrack?.image && (
              <img
                src={currentTrack.image}
                alt="Album cover"
                className="h-14 w-14 rounded-md shadow-lg border border-gray-600"
              />
            )}
            <div className="flex flex-col min-w-0">
              <p className="text-white font-medium truncate text-sm">
                {currentTrack?.title || 'No track playing'}
              </p>
              <p className="text-gray-400 text-xs truncate">{currentTrack?.artist}</p>
            </div>
          </div>

          {/* Center Section: Play Button */}
          <div className="flex-1 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className="text-gray-100 hover:text-white transition-colors mt-6"
            >
              {globalIsTrackPlaying ? (
                <PauseCircleIcon className="h-14 w-14" />
              ) : (
                <PlayCircleIcon className="h-14 w-14" />
              )}
            </motion.button>
          </div>

          {/* Right Section: Lyrics & Volume Controls */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLyrics((prev) => !prev)}
              className="flex items-center justify-center bg-gray-600 p-2.5 rounded-full shadow-md text-white hover:bg-gray-500 transition-colors"
              disabled={!currentTrack}
            >
              <MusicalNoteIcon className="h-5 w-5" />
            </motion.button>

            <div className="flex items-center gap-2 w-32">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:bg-gray-300 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-700
                  hover:[&::-webkit-slider-thumb]:bg-gray-200 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
        </>
      );
    };

export default Player;
