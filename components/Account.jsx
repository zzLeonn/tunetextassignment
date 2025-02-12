import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

const Account = () => {
  const { data: session } = useSession();

  // Mock stats for demonstration
  const userStats = {
    playlists: 17,
    followers: 10,
    following: 81,
    totalSongsPlayed: 2056,
    topGenres: ["Pop", "Rock", "Country"],
    favoriteArtist: "Taylor Swift",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 bg-gradient-to-br from-black via-zinc-900 to-emerald-900 p-8 flex items-center justify-center"
    >
      <div className="relative max-w-4xl w-full">
        {/* Gradient background */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-3xl blur opacity-30 transition duration-1000"></div>

        {/* Main content */}
        <div className="relative bg-zinc-900 rounded-3xl p-8 backdrop-blur-xl border border-zinc-800 shadow-2xl">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            {/* Profile picture */}
            <motion.img
              src={session?.user.image}
              alt="Profile"
              className="w-40 h-40 rounded-full mb-6 border-4 border-emerald-400/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />

            {/* User name and email */}
            <h2 className="text-4xl font-bold text-emerald-400 mb-2">
              {session?.user.name}
            </h2>
            <p className="text-zinc-400 mb-8">{session?.user.email}</p>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {/* Playlists */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700"
              >
                <h3 className="text-emerald-400 text-xl font-bold mb-2">
                  Playlists
                </h3>
                <p className="text-zinc-400">{userStats.playlists} Playlists</p>
              </motion.div>

              {/* Followers */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700"
              >
                <h3 className="text-emerald-400 text-xl font-bold mb-2">
                  Followers
                </h3>
                <p className="text-zinc-400">{userStats.followers} Followers</p>
              </motion.div>

              {/* Following */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700"
              >
                <h3 className="text-emerald-400 text-xl font-bold mb-2">
                  Following
                </h3>
                <p className="text-zinc-400">{userStats.following} Following</p>
              </motion.div>

              {/* Total Songs Played */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700"
              >
                <h3 className="text-emerald-400 text-xl font-bold mb-2">
                  Total Songs Played
                </h3>
                <p className="text-zinc-400">{userStats.totalSongsPlayed} Songs</p>
              </motion.div>

              {/* Top Genres */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700"
              >
                <h3 className="text-emerald-400 text-xl font-bold mb-2">
                  Top Genres
                </h3>
                <p className="text-zinc-400">
                  {userStats.topGenres.join(", ")}
                </p>
              </motion.div>

              {/* Favorite Artist */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700"
              >
                <h3 className="text-emerald-400 text-xl font-bold mb-2">
                  Favorite Artist
                </h3>
                <p className="text-zinc-400">{userStats.favoriteArtist}</p>
              </motion.div>
            </div>

            {/* Logout button */}
            <motion.button
              onClick={() => signOut()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-400/30 hover:bg-emerald-500/20 transition-all"
            >
              Logout
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Account;