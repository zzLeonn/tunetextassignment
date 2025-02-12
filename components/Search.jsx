import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import SearchResults from './SearchResults';

const Search = ({ setView, setGlobalPlaylistId, setGlobalCurrentSongId, setGlobalIsTrackPlaying, setGlobalArtistId }) => {
    const { data: session } = useSession();
    const [searchData, setSearchData] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    async function updateSearchResults(query) {
        if (!query) {
            setSearchData(null); // Clear search results if the query is empty
            return;
        }

        try {
            const response = await fetch("https://api.spotify.com/v1/search?" + new URLSearchParams({
                q: query,
                type: ["artist", "playlist", "track"],
            }), {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setSearchData(data);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchData(null); // Clear search results in case of error
        }
    }

    useEffect(() => {
        inputRef.current.focus(); // Focus the input field on mount
    }, [inputRef]);

    return (
        <div className='flex-grow h-screen bg-gradient-to-br from-black via-zinc-900 to-emerald-900'>
            {/* Search header */}
            <header className='text-white sticky top-0 h-20 z-10 flex items-center px-8 backdrop-blur-lg bg-black/50 border-b border-zinc-800'>
                <div className='relative w-full max-w-2xl'>
                    <MagnifyingGlassIcon className='absolute top-1/2 left-4 h-5 w-5 text-zinc-400 -translate-y-1/2' />
                    <input
                        value={inputValue}
                        onChange={async (e) => {
                            setInputValue(e.target.value);
                            await updateSearchResults(e.target.value);
                        }}
                        ref={inputRef}
                        className='w-full rounded-full bg-white/10 backdrop-blur-sm text-white text-base py-3 pl-12 pr-4 font-normal outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-400 transition-all'
                        placeholder='Search for artists, playlists, or tracks'
                    />
                </div>
            </header>

            {/* Logout button */}
            <div onClick={() => signOut()} className='absolute z-20 top-5 right-8 flex items-center bg-black/70 text-white space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full p-1 pr-2 transition-all'>
                <img className='rounded-full w-7 h-7' src={session?.user.image} alt="profile pic" />
                <p className='text-sm'>Logout</p>
                <ChevronDownIcon className='h-5 w-5' />
            </div>

            {/* Default search page */}
            {searchData === null && (
                <div className='p-8 flex flex-col items-center justify-center h-[calc(100vh-5rem)]'>
                    <div className='text-center max-w-2xl'>
                        <h1 className='text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4'>
                            Explore Music
                        </h1>
                        <p className='text-zinc-400 text-lg mb-8'>
                            Discover new artists, playlists, and tracks. Start typing in the search bar to begin your journey.
                        </p>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <div className='bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 text-center'>
                                <h3 className='text-xl font-semibold text-emerald-400 mb-2'>Artists</h3>
                                <p className='text-zinc-400'>
                                    Find your favorite artists and explore their music.
                                </p>
                            </div>
                            <div className='bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 text-center'>
                                <h3 className='text-xl font-semibold text-emerald-400 mb-2'>Playlists</h3>
                                <p className='text-zinc-400'>
                                    Browse curated playlists for every mood and genre.
                                </p>
                            </div>
                            <div className='bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 text-center'>
                                <h3 className='text-xl font-semibold text-emerald-400 mb-2'>Tracks</h3>
                                <p className='text-zinc-400'>
                                    Search for individual tracks and enjoy seamless playback.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search results */}
            {searchData !== null && (
                <SearchResults
                    playlists={searchData?.playlists?.items || []}
                    songs={searchData?.tracks?.items || []}
                    artists={searchData?.artists?.items || []}
                    setView={setView}
                    setGlobalPlaylistId={setGlobalPlaylistId}
                    setGlobalCurrentSongId={setGlobalCurrentSongId}
                    setGlobalIsTrackPlaying={setGlobalIsTrackPlaying}
                    setGlobalArtistId={setGlobalArtistId}
                />
            )}
        </div>
    );
};

export default Search;