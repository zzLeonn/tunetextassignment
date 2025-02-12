import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Lyric = ({ currentTrack, showLyrics, setShowLyrics }) => {
  const [lyrics, setLyrics] = useState('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');

  const fetchLyrics = async (artist, title) => {
    if (!artist || !title) {
      setLyrics('');
      return;
    }

    setIsLoadingLyrics(true);
    setLyricsError('');

    try {
      // Clean up artist/title strings
      const cleanArtist = artist
        .replace(/ *\([^)]*\) */g, "")
        .replace(/ *\-.*/, "")
        .replace(/feat\..*/, "")
        .trim();

      const cleanTitle = title
        .replace(/ *\([^)]*\) */g, "")
        .replace(/ *\-.*/, "")
        .trim();

      const response = await fetch(
        `https://cors-anywhere.herokuapp.com/https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`
      );

      console.log('Lyrics API Response:', response); // Debug log

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No lyrics found for this track');
        }
        throw new Error(`Failed to fetch lyrics: ${response.status}`);
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

  useEffect(() => {
    if (showLyrics && currentTrack?.artist && currentTrack?.title) {
      fetchLyrics(currentTrack.artist, currentTrack.title);
    }
  }, [showLyrics, currentTrack]);

  return (
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
                  {lyrics || 'Lyrics not available for this track'}
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
  );
};

export default Lyric;