import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Check, 
  Sparkles, 
  Package, 
  Download,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface MarketModalProps {
  profile: UserProfile;
  onClose: () => void;
  onPurchaseItem: (cost: number, itemName: string) => boolean;
}

interface MarketItem {
  id: string;
  name: string;
  category: 'pack' | 'avatar' | 'utility';
  description: string;
  cost: number;
  icon: string;
  purchased?: boolean;
}

const MARKET_CATALOG: MarketItem[] = [
  {
    id: 'pack-waec-past-questions',
    name: 'WAEC Offline Past Question Pack',
    category: 'pack',
    description: '150 solved questions with everyday breakdown analogies cached 100% offline.',
    cost: 50,
    icon: '📚'
  },
  {
    id: 'pack-science-experiments',
    name: 'Zero-Cost Home Science Lab Guide',
    category: 'pack',
    description: '20 safe STEM experiments using kitchen salt, plastic bottles, and hibiscus flower tea.',
    cost: 40,
    icon: '🧪'
  },
  {
    id: 'util-streak-freeze',
    name: 'NEPA / Power Outage Streak Shield',
    category: 'utility',
    description: 'Protects your consecutive study streak for 48 hours during power or data cuts.',
    cost: 100,
    icon: '🛡️'
  },
  {
    id: 'avatar-scholar-cap',
    name: 'Golden Scholar Graduate Cap',
    category: 'avatar',
    description: 'Exclusive golden graduation cap avatar badge for your profile header.',
    cost: 80,
    icon: '🎓'
  },
  {
    id: 'avatar-bush-lantern',
    name: 'Òyè Midnight Lantern Badge',
    category: 'avatar',
    description: 'Symbol of perseverance honoring late-night study by kerosene lamp or candle.',
    cost: 60,
    icon: '🏮'
  },
  {
    id: 'util-printable-summary',
    name: 'Printable Pocket Revision Sheet',
    category: 'utility',
    description: 'High-contrast low-ink printable cheat sheet for offline revision on physical paper.',
    cost: 30,
    icon: '📄'
  }
];

export const MarketModal: React.FC<MarketModalProps> = ({
  profile,
  onClose,
  onPurchaseItem
}) => {
  const [purchasedIds, setPurchasedIds] = React.useState<string[]>([]);

  const handleBuy = (item: MarketItem) => {
    if (profile.sparks < item.cost) {
      sounds.playTap();
      return;
    }

    const success = onPurchaseItem(item.cost, item.name);
    if (success) {
      setPurchasedIds(prev => [...prev, item.id]);
      sounds.playSparkEarned();
      fireConfetti();
    }
  };

  return (
    <div 
      id="market-modal-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                Òyè Sparks Bazaar
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight text-slate-900 dark:text-white">
                Study Packs & Rewards Market
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sparks Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-black">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{profile.sparks} Sparks</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MARKET_CATALOG.map((item) => {
            const isPurchased = purchasedIds.includes(item.id);
            const canAfford = profile.sparks >= item.cost;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPurchased
                    ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-300'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 inline-block">
                      {item.icon}
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <Zap className="w-3.5 h-3.5 fill-amber-500" />
                      {item.cost} Sparks
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-3 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4">
                  {isPurchased ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 opacity-90 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Unlocked & Active</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Redeem Item' : 'Need More Sparks'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 text-center text-xs text-slate-500">
          💡 Earn more Sparks by completing lesson steps (+15) and clearing diagnostic quizzes (+30)!
        </div>

      </div>
    </div>
  );
};
