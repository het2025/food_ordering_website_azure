import { motion } from 'framer-motion'
import { RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const Error500 = () => {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#E85D04]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#F48C06]/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-sm sm:max-w-md bg-white p-8 sm:p-12 rounded-3xl shadow-[0_20px_60px_rgba(44,24,16,0.08)] border border-[rgba(44,24,16,0.05)] relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="text-7xl sm:text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-[#E85D04] to-[#F48C06] bg-clip-text text-transparent mb-2 sm:mb-4 leading-tight drop-shadow-sm pb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          500
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Server Error
        </h1>

        <p className="text-sm sm:text-base font-medium text-[#5C3D2E] mb-8 px-2">
          Oops! Something went wrong on our end. Please try again later.
        </p>

        <div className="flex flex-col gap-3 w-full sm:flex-row sm:gap-4 sm:justify-center">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[rgba(44,24,16,0.05)] text-[#2C1810] font-bold rounded-xl hover:bg-[rgba(44,24,16,0.1)] transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Try Again
          </button>

          <Link
            to="/home"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white font-bold rounded-xl shadow-lg shadow-[#E85D04]/20 hover:scale-105 transition-transform duration-200"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Error500