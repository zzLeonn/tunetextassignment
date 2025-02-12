import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { SpotifyLogo, MusicNotes, MicrophoneStage, Waveform } from '@phosphor-icons/react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-emerald-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-2xl w-full"
      >
        {/* Gradient background */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

        {/* Main content */}
        <div className="relative bg-zinc-900 rounded-3xl p-10 backdrop-blur-xl border border-zinc-800 shadow-2xl">
          {/* Animated logo */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-400/20">
              <MusicNotes className="w-12 h-12 text-emerald-400" weight="fill" />
            </div>
          </motion.div>

          {/* Title and tagline */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 text-center">
            TuneText
          </h1>
          <p className="text-zinc-400 mb-8 text-lg text-center max-w-md mx-auto">
            Dive into the world of music with synchronized lyrics, real-time playback, and immersive experiences.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 text-center"
            >
              <MicrophoneStage className="w-10 h-10 text-emerald-400 mx-auto mb-4" weight="fill" />
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Live Lyrics</h3>
              <p className="text-zinc-400">
                Follow along with real-time lyrics synced to your music.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 text-center"
            >
              <Waveform className="w-10 h-10 text-emerald-400 mx-auto mb-4" weight="fill" />
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Seamless Playback</h3>
              <p className="text-zinc-400">
                Enjoy uninterrupted music streaming with Spotify integration.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 text-center"
            >
              <MusicNotes className="w-10 h-10 text-emerald-400 mx-auto mb-4" weight="fill" />
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Discover Music</h3>
              <p className="text-zinc-400">
                Explore new songs and artists with curated playlists.
              </p>
            </motion.div>
          </div>

          {/* Login button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signIn('spotify', { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/30 rounded-2xl px-6 py-4 text-emerald-300 hover:text-white transition-all duration-300"
          >
            <SpotifyLogo className="w-6 h-6 text-emerald-400" weight="fill" />
            <span className="font-semibold text-lg">Continue with Spotify</span>
          </motion.button>

          {/* Footer */}
          <p className="text-zinc-500 text-sm text-center mt-6">
            By continuing, you agree to our <a href="#" className="text-emerald-400 hover:underline">Terms</a> and <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 -z-10 bg-[url('/noise.svg')] opacity-10"></div>
      </motion.div>
    </div>
  );
};

export default Login;