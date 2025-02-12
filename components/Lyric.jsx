import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Lyric = ({ currentTrack, showLyrics, setShowLyrics }) => {
  const [lyricsCache, setLyricsCache] = useState({});
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');

  const fetchLyrics = async (artist, title) => {
    if (!artist || !title) {
      setLyricsError('No artist or title provided');
      return;
    }

    const songKey = `${artist}-${title}`;
    if (lyricsCache[songKey]) return;

    setIsLoadingLyrics(true);
    setLyricsError('');

    try {
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

      if (!response.ok) {
        throw response.status === 404 
          ? new Error('No lyrics found') 
          : new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setLyricsCache(prev => ({ ...prev, [songKey]: data.lyrics || '' }));
    } catch (error) {
      setLyricsError(error.message);
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  useEffect(() => {
    if (showLyrics && currentTrack?.artist && currentTrack?.title) {
      const songKey = `${currentTrack.artist}-${currentTrack.title}`;
      if (!lyricsCache[songKey]) fetchLyrics(currentTrack.artist, currentTrack.title);
    }
  }, [showLyrics, currentTrack, lyricsCache]);

  const currentSongKey = currentTrack ? `${currentTrack.artist}-${currentTrack.title}` : '';
  const lyrics = lyricsCache[currentSongKey] || '';

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
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-8"
            >
              {currentTrack?.title || 'Current Track'} Lyrics
            </motion.h2>

            <div className="text-white text-center w-full max-h-[60vh] overflow-y-auto 
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
              
          

              {isLoadingLyrics ? (
                <div className="flex justify-center items-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-12 w-12 border-4 border-emerald-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : lyricsError ? (
                <motion.p
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-red-400 text-xl font-medium"
                >
                  {lyricsError}
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                  className="text-lg space-y-4 px-4 pb-8 pt-4 text-cyan-100"
                >
                  {(lyrics || '').split('\n').map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="font-medium tracking-wide"
                    >
                      {line || <br />}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLyrics(false)}
              className="mt-8 px-8 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl 
                hover:bg-emerald-500/30 transition-all font-semibold text-lg
                backdrop-blur-lg border border-emerald-500/30"
            >
              Close Lyrics
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lyric;