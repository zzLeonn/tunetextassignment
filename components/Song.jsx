import { PlayIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

const Song = ({ sno, track, isSelected, onSelect, setGlobalCurrentSongId, setGlobalIsTrackPlaying, setView, setGlobalArtistId }) => {
    const { data: session } = useSession();
    const [hover, setHover] = useState(false);

    async function playSong(track) {
        setGlobalCurrentSongId(track.id);
        setGlobalIsTrackPlaying(true);
        if (session && session.accessToken) {
            const response = await fetch("https://api.spotify.com/v1/me/player/play", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    uris: [track.uri]
                })
            });
            console.log("on play", response.status);
        }
    }

    function millisToMinutesAndSeconds(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return (
            seconds == 60 ?
                (minutes + 1) + ":00" :
                minutes + ":" + (seconds < 10 ? "0" : "") + seconds
        );
    }

    function selectArtist(artist) {
        setView("artist");
        setGlobalArtistId(artist.id);
    }

    return (
        <div
            onDoubleClick={() => {
                playSong(track);
                onSelect(); // Set this song as selected
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`grid grid-cols-2 text-neutral-400 text-sm py-4 px-5 rounded-lg cursor-default transition-all
                ${isSelected ? 'bg-emerald-950' : 'hover:bg-white hover:bg-opacity-10'}
            `}
        >
            <div className='flex items-center space-x-4'>
                {hover ? (
                    <PlayIcon
                        onClick={async () => {
                            await playSong(track);
                            onSelect(); // Set this song as selected
                        }}
                        className='h-5 w-5 text-emerald-400'
                    />
                ) : (
                    <p className={`w-5 ${isSelected ? 'text-emerald-400' : ''}`}>{sno + 1}</p>
                )}
                {track?.album?.images[0]?.url && (
                    <img
                        className='h-10 w-10 rounded-sm'
                        src={track.album.images[0].url}
                        alt={track.name}
                    />
                )}
                <div>
                    <p className={`w-36 lg:w-64 truncate text-base ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {track.name}
                    </p>
                    <p className='w-36 truncate'>
                        {track.artists.map((artist, i) => (
                            <React.Fragment key={artist.id}>
                                <span
                                    onClick={() => selectArtist(artist)}
                                    className={`hover:underline ${isSelected ? 'text-emerald-300' : ''}`}
                                >
                                    {artist.name}
                                </span>
                                {i !== track.artists.length - 1 && ", "}
                            </React.Fragment>
                        ))}
                    </p>
                </div>
            </div>
            <div className='flex items-center justify-between ml-auto md:ml-0'>
                <p className={`w-40 truncate hidden md:inline ${isSelected ? 'text-emerald-300' : ''}`}>
                    {track.album.name}
                </p>
                <p className={isSelected ? 'text-emerald-400' : ''}>
                    {millisToMinutesAndSeconds(track.duration_ms)}
                </p>
            </div>
        </div>
    );
};

export default Song;