import {
    BuildingLibraryIcon,
    MagnifyingGlassIcon,
    UserIcon
  } from '@heroicons/react/24/outline'
  import { useSession } from 'next-auth/react'
  import { useEffect, useState } from 'react'
  
  const Sidebar = ({ view, setView, setGlobalPlaylistId }) => {
    const { data: session } = useSession()
    const [playlists, setPlaylists] = useState([])
  
    // Spotify logo from login screen
    const SpotifyLogo = () => (
      <svg className="w-24 h-24 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9.25 12L4.75 15L12 19.25L19.25 15L14.6722 12"
        />
      </svg>
    )
  
    useEffect(() => {
      async function fetchPlaylists() {
        if (session?.accessToken) {
          const response = await fetch("https://api.spotify.com/v1/me/playlists", {
            headers: {
              Authorization: `Bearer ${session.accessToken}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setPlaylists(data.items)
          }
        }
      }
      fetchPlaylists()
    }, [session])
  
    return (
      <>
        <div className="w-64 bg-gradient-to-b from-black via-zinc-900 to-emerald-900/10 text-gray-300 h-screen border-r border-emerald-900/20 p-5 text-sm hidden md:inline-flex flex-col overflow-y-auto no-scrollbar flex-shrink-0 flex-grow-0">
          <div className="mb-6">
            <SpotifyLogo />
          </div>
  
          <div className="flex-1 space-y-4">
            <nav className="space-y-4">
              {/* Account Button */}
              <button
                onClick={() => setView("account")}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  view === "account"
                    ? "bg-emerald-400/10 text-white shadow-lg"
                    : "hover:bg-emerald-400/10 hover:text-white hover:shadow-lg"
                }`}
              >
                <UserIcon className="h-5 w-5" />
                <span>Account</span>
              </button>
  
              {/* Search Button */}
              <button
                onClick={() => setView("search")}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  view === "search"
                    ? "bg-emerald-400/10 text-white shadow-lg"
                    : "hover:bg-emerald-400/10 hover:text-white hover:shadow-lg"
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Search</span>
              </button>
  
              {/* Library Button */}
              <button
                onClick={() => setView("library")}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  view === "library"
                    ? "bg-emerald-400/10 text-white shadow-lg"
                    : "hover:bg-emerald-400/10 hover:text-white hover:shadow-lg"
                }`}
              >
                <BuildingLibraryIcon className="h-5 w-5" />
                <span>Your Library</span>
              </button>
            </nav>
  
            <hr className="border-emerald-900/20 my-4" />
  
            {/* Playlists */}
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    setView("playlist")
                    setGlobalPlaylistId(playlist.id)
                  }}
                  className="w-full text-left p-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:bg-emerald-400/10 hover:text-white hover:shadow-lg truncate"
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* Inline CSS to hide the scrollbar */}
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </>
    )
  }
  
  export default Sidebar