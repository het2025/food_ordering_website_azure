import { Gift, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useUser } from '../../context/UserContext';
import { motion } from 'framer-motion';

// --- 🍑 WARM PEACH THEME (With Clean White Cards) ---
// bgMain: '#FFF3E8'
// borderOrange: '#E85D04'
// accentAmber: '#F48C06'
// textDark: '#2C1810'
// textMuted: '#5C3D2E'

const dynamicRewardsTiers = [
  { orders: 5, discount: 20, code: 'ORDER20-5', description: '20% off on your next order!', bgGradient: 'bg-gradient-to-r from-[#F48C06] to-[#E85D04]' },
  { orders: 10, discount: 25, code: 'ORDER25-10', description: '25% off on your next order!', bgGradient: 'bg-gradient-to-r from-[#E85D04] to-[#C1440E]' },
  { orders: 15, discount: 30, code: 'ORDER30-15', description: '30% off on your next order!', bgGradient: 'bg-gradient-to-r from-[#C1440E] to-[#A07850]' },
  { orders: 20, discount: 35, code: 'ORDER35-20', description: '35% off on your next order!', bgGradient: 'bg-gradient-to-r from-[#F48C06] to-[#C1440E]' },
  { orders: 30, discount: 40, code: 'ORDER40-30', description: '40% off on your next order!', bgGradient: 'bg-gradient-to-r from-[#E85D04] to-[#A07850]' },
  { orders: 40, discount: 50, code: 'ORDER50-40', description: '50% off on your next order!', bgGradient: 'bg-gradient-to-r from-[#C1440E] to-[#5C3D2E]' },
];

const Rewards = () => {
  const { user, refreshUser } = useUser();
  const completedOrdersCount = user?.completedOrdersCount || 0;
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    refreshUser(true); // Silent refresh to avoid global loading flicker/unmount
  }, []); // Refresh user data on mount to get latest order count

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
  };

  const calculateStatus = (tierOrders) => {
    if (completedOrdersCount >= tierOrders) {
      return 'unlocked';
    } else {
      return 'pending';
    }
  };

  const getNextTierInfo = () => {
    for (const tier of dynamicRewardsTiers) {
      if (completedOrdersCount < tier.orders) {
        return {
          remaining: tier.orders - completedOrdersCount,
          nextDiscount: tier.discount,
          nextOrders: tier.orders
        };
      }
    }
    return null; // All tiers unlocked
  };

  const nextTier = getNextTierInfo();

  return (
    <div className="min-h-screen bg-[#FFF3E8] font-['Inter',_sans-serif]">
      <Header />
      <main className="pt-20">
        <div className="py-10 bg-white border-b border-[rgba(44,24,16,0.05)] shadow-[0_4px_30px_rgba(44,24,16,0.02)] sm:py-14">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2C1810] sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Your Loyalty Rewards
              </h1>
              <p className="max-w-2xl mx-auto mt-4 text-base font-medium text-[#5C3D2E] sm:mt-5 sm:text-lg">
                Complete orders to unlock exclusive discounts and offers! You've completed
                <span className="font-extrabold text-[#E85D04]"> {completedOrdersCount} </span>
                orders so far.
              </p>
              {nextTier && (
                <div className="inline-block px-5 py-2.5 mt-5 bg-[#FFF3E8] border border-[#E85D04]/20 rounded-full shadow-sm">
                  <p className="text-sm font-semibold text-[#5C3D2E] sm:text-base">
                    Complete <span className="font-extrabold text-[#E85D04]">{nextTier.remaining}</span> more orders to unlock
                    <span className="font-extrabold text-[#E85D04]"> {nextTier.nextDiscount}% off!</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6 sm:py-14 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
            {dynamicRewardsTiers.map((reward, index) => {
              const status = calculateStatus(reward.orders);
              const isUnlocked = status === 'unlocked';
              const nextOrderToUnlock = reward.orders;
              const ordersRemaining = nextOrderToUnlock - completedOrdersCount;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className={`relative flex flex-col overflow-hidden transition-all duration-300 transform border shadow-[0_10px_40px_rgba(44,24,16,0.06)] rounded-3xl ${isUnlocked
                    ? 'bg-white border-[rgba(44,24,16,0.05)] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(232,93,4,0.15)] hover:border-[#E85D04]/30'
                    : 'bg-white/60 border-[rgba(44,24,16,0.05)] opacity-80 cursor-not-allowed grayscale-[20%]'
                    }`}
                >
                  <div className={`p-6 sm:p-8 flex items-center justify-center ${isUnlocked ? reward.bgGradient : 'bg-gray-300'}`}>
                    <Gift className={`w-8 h-8 sm:w-10 sm:h-10 ${isUnlocked ? 'text-white drop-shadow-md' : 'text-gray-500'}`} />
                  </div>

                  <div className="flex flex-col flex-grow p-5 sm:p-7 relative z-10 bg-white">
                    <h3 className="mb-1.5 text-xl font-extrabold text-[#2C1810] sm:mb-2 sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {reward.discount}% Off!
                    </h3>
                    <p className="flex-grow text-sm font-medium text-[#5C3D2E] sm:text-base leading-relaxed">
                      {reward.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[rgba(44,24,16,0.05)]">
                      <p className="text-sm font-bold text-[#5C3D2E]">
                        Requires: <span className="font-extrabold text-[#E85D04]">{reward.orders} Orders</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-[rgba(44,24,16,0.02)] border-t border-[rgba(44,24,16,0.05)]">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleCopy(reward.code)}
                        className="flex items-center justify-center w-full px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-extrabold text-[#E85D04] bg-[#FFF3E8] border border-[#E85D04]/30 rounded-xl cursor-pointer group hover:bg-[#E85D04] hover:text-white transition-all duration-300 shadow-sm"
                      >
                        {copiedCode === reward.code ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied to Clipboard!
                          </>
                        ) : (
                          <>
                            <span className="truncate tracking-wider">{reward.code}</span>
                            <Copy className="flex-shrink-0 w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center w-full px-4 py-3 sm:px-5 sm:py-3.5 text-xs font-bold text-center text-[#5C3D2E]/60 bg-gray-100/80 rounded-xl sm:text-sm border border-gray-200/50">
                        Complete {ordersRemaining} more order{ordersRemaining > 1 ? 's' : ''} to unlock
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rewards;