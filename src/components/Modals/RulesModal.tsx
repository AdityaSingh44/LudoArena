import { Award, BookOpen, Crown, RotateCcw, Shield, Sparkles, X } from 'lucide-react';
import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Official Ludo Rules</h3>
            <p className="text-xs text-slate-400">Standard international gameplay guidelines</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300">
          {/* Rule 1 */}
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">1. Spawning Out of Yard</h4>
              <p className="leading-relaxed text-[11px] text-slate-400">
                All 4 tokens start inside your home yard. You must roll a <strong className="text-white">6</strong> to bring a token out onto the starting cell.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">2. Extra Turns on 6 & Captures</h4>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Rolling a <strong className="text-white">6</strong> grants an extra turn. Rolling three consecutive sixes forfeits that turn. Capturing an opponent token or guiding a token into the home triangle also awards an extra roll!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">3. Safe Star Cells & Captures</h4>
              <p className="leading-relaxed text-[11px] text-slate-400">
                The 8 marked star cells and starting tiles are safe zones where tokens cannot be captured. On normal tiles, landing on an opponent token sends it back to their yard!
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">4. Home Column & Winning</h4>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Tokens enter their matching color corridor and require an exact roll to enter the central victory triangle. The first player to get all 4 tokens to home wins!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
        >
          Got It, Let's Play
        </button>
      </div>
    </div>
  );
};
