import { PauseCircleIcon, PlayCircleIcon, SpeakerWaveIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'use-debounce';

const Player = ({
  globalIsTrackPlaying,
  setGlobalIsTrackPlaying,
  currentTrack // Expecting { artist: string, title: string }
}) => {
  const { data: session, update } = useSession();
  const [volume, setVolume] = useState(50);
  const [debouncedVolume] = useDebounce(volume, 500);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');

  // Fetch lyrics when current track changes
  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentTrack?.artist || !currentTrack?.title) {
        setLyrics('');
        return;
      }
      
      setIsLoadingLyrics(true);
      setLyricsError('');
      
      try {
        const encodedArtist = encodeURIComponent(currentTrack.artist);
        const encodedTitle = encodeURIComponent(currentTrack.title);
        
        const response = await fetch(
          `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`
        );

        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'No lyrics found for this track'
            : 'Failed to fetch lyrics');
        }

        const data = await response.json();
        setLyrics(data.lyrics || 'No lyrics available');
      } catch (error) {
        console.error("Lyrics fetch error:", error);
        setLyricsError(error.message);
        setLyrics('');
      } finally {
        setIsLoadingLyrics(false);
      }
    };

    fetchLyrics();
  }, [currentTrack]);

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

  const handlePlayPause = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await handleSpotifyApiCall(
        `https://api.spotify.com/v1/me/player/${globalIsTrackPlaying ? 'pause' : 'play'}`,
        { method: 'PUT' }
      );

      if (response.status === 204) {
        setGlobalIsTrackPlaying(!globalIsTrackPlaying);
      }
    } catch (error) {
      console.error("Playback error:", error);
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

  return (
    <>
      <AnimatePresence>
        {showLyrics && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-lg z-40 p-8"
          >
            <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-emerald-400 mb-4">
                {currentTrack?.title || 'Current Track'} Lyrics
              </h2>
              
              <div className="text-white text-center w-full max-h-[60vh] overflow-y-auto">
                {isLoadingLyrics ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  </div>
                ) : lyricsError ? (
                  <p className="text-red-400">{lyricsError}</p>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                    {lyrics}
                  </pre>
                )}
              </div>

              <button
                onClick={() => setShowLyrics(false)}
                className="mt-8 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/30 transition-all"
              >
                Close Lyrics
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-t border-emerald-500/20 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex-1 flex items-center justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log("Lyrics button clicked", currentTrack);
                setShowLyrics(!showLyrics);
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
              disabled={!currentTrack}
            >
              <MusicalNoteIcon className="h-8 w-8" />
            </motion.button>
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