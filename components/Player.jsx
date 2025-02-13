import { PauseCircleIcon, PlayCircleIcon, SpeakerWaveIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import Lyric from './Lyric';

const Player = ({ globalIsTrackPlaying, setGlobalIsTrackPlaying }) => {
  const { data: session, update } = useSession();
  const [volume, setVolume] = useState(50);
  const [debouncedVolume] = useDebounce(volume, 500);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  const handleSpotifyApiCall = async (url, options = {}) => {
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
  };

  const fetchCurrentTrack = useDebouncedCallback(async () => {
    try {
      const response = await handleSpotifyApiCall(
        'https://api.spotify.com/v1/me/player/currently-playing'
      );
      
      if (response.status === 200) {
        const data = await response.json();
        setCurrentTrack({
          title: data.item.name,
          artist: data.item.artists.map(artist => artist.name).join(', '),
          album: data.item.album.name,
          image: data.item.album.images[0]?.url
        });
        setGlobalIsTrackPlaying(data.is_playing);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  }, 1000);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCurrentTrack();
      const interval = setInterval(fetchCurrentTrack, 5000);
      return () => clearInterval(interval);
    }
  }, [session, fetchCurrentTrack]);

  const handlePlayPause = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await handleSpotifyApiCall(
        `https://api.spotify.com/v1/me/player/${globalIsTrackPlaying ? 'pause' : 'play'}`,
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
  }, [debouncedVolume, session, update]);

  useEffect(() => {
    if (session?.accessToken) {
      const interval = setInterval(fetchCurrentTrack, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

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
        className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-t border-emerald-500/20 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4 justify-start">
            {currentTrack?.image && (
              <img 
                src={currentTrack.image} 
                alt="Album cover" 
                className="h-12 w-12 rounded-md"
              />
            )}
            <div className="text-left">
              <p className="text-emerald-400 font-medium truncate">
                {currentTrack?.title || 'No track playing'}
              </p>
              <p className="text-gray-400 text-sm truncate">
                {currentTrack?.artist}
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {globalIsTrackPlaying ? (
                <PauseCircleIcon className="h-14 w-14 drop-shadow-lg" />
              ) : (
                <PlayCircleIcon className="h-14 w-14 drop-shadow-lg" />
              )}
            </motion.button>
          </div>

          <div className="flex-1 flex items-center justify-end space-x-3">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
              disabled={!currentTrack}
            >
              <MusicalNoteIcon className="h-6 w-6" />
            </button>
            <SpeakerWaveIcon className="h-6 w-6 text-emerald-400/80" />
            <div className="relative w-32">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-600/50 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg
                  hover:[&::-webkit-slider-thumb]:bg-emerald-300 transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Player;