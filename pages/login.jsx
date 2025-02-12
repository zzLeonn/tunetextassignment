import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { SpotifyLogo } from '@phosphor-icons/react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-emerald-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-md w-full"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-zinc-900 rounded-3xl p-10 backdrop-blur-xl border border-zinc-800 shadow-2xl">
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8"
          >
            <svg className="w-24 h-24 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.25 12L4.75 15L12 19.25L19.25 15L14.6722 12"/>
            </svg>
          </motion.div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            TuneText
          </h1>
          
          <p className="text-zinc-400 mb-8 text-lg">
            Lyrics and music at your fingertips.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signIn('spotify', { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/30 rounded-2xl px-6 py-4 text-emerald-300 hover:text-white transition-all duration-300"
          >
            <SpotifyLogo className="w-6 h-6 text-emerald-400" weight="fill" />
            <span className="font-semibold text-lg">Continue with Spotify</span>
          </motion.button>
        </div>

        <div className="absolute inset-0 -z-10 bg-[url('/noise.svg')] opacity-10"></div>
      </motion.div>
    </div>
  );
};

export default Login;