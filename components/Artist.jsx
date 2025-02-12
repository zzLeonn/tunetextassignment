import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Song from './Song';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { shuffle } from 'lodash';
import { PlayIcon } from '@heroicons/react/24/solid';

const colors = [
    'from-indigo-500',
    'from-blue-500',
    'from-green-500',
    'from-red-500',
    'from-yellow-500',
    'from-pink-500',
    'from-purple-500'
];

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

    function changeOpacity(scrollPos) {
        // scrollPos = 0 -> opacity = 0 
        // scrollPos = 300 -> opacity = 1, textOpacity = 0
        // scrollPos = 310 -> opacity = 1, textOpacity = 1
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
    }

    async function getArtistData() {
        const response = await fetch(`https://api.spotify.com/v1/artists/${globalArtistId}`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        });
        const data = await response.json();
        return data;
    }

    async function getTopTracks() {
        const response = await fetch(
            `https://api.spotify.com/v1/artists/${globalArtistId}/top-tracks?` +
                new URLSearchParams({ market: "US" }),
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                }
            }
        );
        const data = await response.json();
        return data.tracks;
    }

    useEffect(() => {
        async function fetchData() {
            if (session && session.accessToken) {
                setArtistData(await getArtistData());
                setTopTracks(await getTopTracks());
            }
        }
        fetchData();
    }, [session, globalArtistId]);

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [globalArtistId]);

    return (
        <div className='flex-grow h-screen'>
            <header
                style={{ opacity: opacity }}
                className='text-white sticky top-0 h-20 z-10 text-4xl bg-neutral-800 p-8 flex items-center font-bold'
            >
                <div style={{ opacity: textOpacity }} className='flex items-center'>
                    {artistData && (
                        <img
                            className='h-8 w-8 mr-6'
                            src={artistData.images[0].url}
                            alt={artistData.name}
                        />
                    )}
                    <p>{artistData?.name}</p>
                </div>
            </header>
            <div
                onClick={() => signOut()}
                className='absolute z-20 top-5 right-8 flex items-center bg-black bg-opacity-70 text-white space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full p-1 pr-2'
            >
                <img
                    className='rounded-full w-7 h-7'
                    src={session?.user.image}
                    alt='profile pic'
                />
                <p className='text-sm'>Logout</p>
                <ChevronDownIcon className='h-5 w-5' />
            </div>
            <div
                onScroll={(e) => changeOpacity(e.target.scrollTop)}
                className='relative -top-20 h-screen overflow-y-scroll bg-neutral-900'
            >
                <section
                    className={`flex items-end space-x-7 bg-gradient-to-b to-neutral-900 ${color} h-80 text-white p-8`}
                >
                    {artistData && (
                        <img
                            className='h-44 w-44 rounded-full'
                            src={artistData.images[0].url}
                            alt={artistData.name}
                        />
                    )}
                    <div>
                        <p className='text-sm font-bold'>Artist</p>
                        <h1 className='text-2xl md:text-3xl lg:text-5xl font-extrabold'>
                            {artistData?.name}
                        </h1>
                    </div>
                </section>
                <div className='space-y-4'>
                    <h2 className='text-xl font-bold px-8'>Top tracks</h2>
                    <div className='text-white px-8 flex flex-col space-y-1 pb-6'>
                        {topTracks.slice(0, 5).map((track, i) => (
                            <Song
                                setView={setView}
                                setGlobalArtistId={setGlobalArtistId}
                                setGlobalIsTrackPlaying={setGlobalIsTrackPlaying}
                                setGlobalCurrentSongId={setGlobalCurrentSongId}
                                key={track.id}
                                sno={i}
                                track={track}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Artist;
