import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Song from './Song';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { shuffle } from 'lodash';
import { PlayIcon } from '@heroicons/react/24/solid';

const colors = [
  'from-emerald-500',
  'from-green-500',
  'from-teal-500',
  'from-cyan-500',
  'from-blue-500',
  'from-indigo-500',
  'from-purple-500'
];

// Separate header component for the artist
const ArtistHeader = ({ artistData, opacity, textOpacity }) => {
  return (
    <header
      style={{ opacity }}
      className="text-white sticky top-0 h-20 z-10 text-4xl bg-gradient-to-b from-black to-emerald-900/20 p-8 flex items-center font-bold transition-colors"
    >
      <div style={{ opacity: textOpacity }} className="flex items-center">
        {artistData && artistData.images?.[0]?.url && (
          <img
            className="h-8 w-8 mr-6 rounded-full"
            src={artistData.images[0].url}
            alt={`${artistData.name} profile`}
            loading="lazy"
          />
        )}
        <p>{artistData?.name}</p>
      </div>
    </header>
  );
};

ArtistHeader.propTypes = {
  artistData: PropTypes.object,
  opacity: PropTypes.number.isRequired,
  textOpacity: PropTypes.number.isRequired
};

const Artist = ({
  setView,
  globalArtistId,
  setGlobalArtistId,
  setGlobalCurrentSongId,
  setGlobalIsTrackPlaying
}) => {
  const { data: session } = useSession();
  const [color, setColor] = useState(colors[0]);
  const [opacity, setOpacity] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);
  const [artistData, setArtistData] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which song is selected (only one can be selected at a time)
  const [selectedSongId, setSelectedSongId] = useState(null);

  // Debounce function for scroll performance
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleScroll = useCallback(
    debounce((scrollPos) => {
      const offset = 300;
      const textOffset = 10;
      if (scrollPos < offset) {
        const newOpacity = 1 - ((offset - scrollPos) / offset);
        setOpacity(newOpacity);
        setTextOpacity(0);
      } else {
        setOpacity(1);
        const delta = scrollPos - offset;
        const newTextOpacity = 1 - ((textOffset - delta) / textOffset);
        setTextOpacity(newTextOpacity);
      }
    }, 10),
    []
  );

  // Fetch artist data with error handling
  async function getArtistData() {
    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${globalArtistId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch artist data');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Fetch top tracks with error handling
  async function getTopTracks() {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${globalArtistId}/top-tracks?` +
          new URLSearchParams({ market: "US" }),
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch top tracks');
      const data = await response.json();
      return data.tracks;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // Fetch data when session and artist ID are available
  useEffect(() => {
    async function fetchData() {
      if (session && session.accessToken && globalArtistId) {
        setLoading(true);
        const [artist, tracks] = await Promise.all([getArtistData(), getTopTracks()]);
        setArtistData(artist);
        setTopTracks(tracks);
        setLoading(false);
      }
    }
    fetchData();
  }, [session, globalArtistId]);

  // Change background color when artist changes and reset selected song
  useEffect(() => {
    setColor(shuffle(colors).pop());
    setSelectedSongId(null);
  }, [globalArtistId]);

  // Handler for selecting a song
  const handleSongSelect = (songId) => {
    setSelectedSongId(songId);
  };

  return (
    <div className="flex-grow h-screen">
      {/* Header Section */}
      <ArtistHeader
        artistData={artistData}
        opacity={opacity}
        textOpacity={textOpacity}
      />

      {/* Logout Button */}
      <div
        onClick={() => signOut()}
        role="button"
        aria-label="Logout"
        className="absolute z-20 top-5 right-8 flex items-center bg-black bg-opacity-70 text-white space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full p-1 pr-2"
      >
        <img
          className="rounded-full w-7 h-7"
          src={session?.user?.image}
          alt="Profile"
          loading="lazy"
        />
        <p className="text-sm">Logout</p>
        <ChevronDownIcon className="h-5 w-5" />
      </div>

      {/* Content Scroll Area */}
      <div
        onScroll={(e) => handleScroll(e.target.scrollTop)}
        className="relative -top-20 h-screen overflow-y-scroll bg-gradient-to-b from-black to-emerald-900/10"
      >
        <section
          className={`flex items-end space-x-7 bg-gradient-to-b ${color} to-black h-80 text-white p-8 transition-colors`}
        >
          {artistData && artistData.images?.[0]?.url && (
            <img
              className="h-44 w-44 rounded-full"
              src={artistData.images[0].url}
              alt={artistData.name}
              loading="lazy"
            />
          )}
          <div>
            <p className="text-sm font-bold">Artist</p>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-extrabold">
              {artistData?.name}
            </h1>
          </div>
        </section>

        <div className="space-y-4">
          <h2 className="text-xl font-bold px-8 text-white">Top tracks</h2>

          {loading ? (
            <div className="text-white px-8">Loading...</div>
          ) : (
            <div className="text-white px-8 flex flex-col space-y-1 pb-6">
              {topTracks.slice(0, 5).map((track, i) => (
                <Song
                  // Set the onSelect callback to select only this song.
                  onSelect={() => handleSongSelect(track.id)}
                  setView={setView}
                  setGlobalArtistId={setGlobalArtistId}
                  setGlobalIsTrackPlaying={setGlobalIsTrackPlaying}
                  setGlobalCurrentSongId={setGlobalCurrentSongId}
                  key={track.id}
                  sno={i}
                  track={track}
                  isSelected={selectedSongId === track.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Artist.propTypes = {
  setView: PropTypes.func.isRequired,
  globalArtistId: PropTypes.string.isRequired,
  setGlobalArtistId: PropTypes.func.isRequired,
  setGlobalCurrentSongId: PropTypes.func.isRequired,
  setGlobalIsTrackPlaying: PropTypes.func.isRequired
};

export default Artist;
