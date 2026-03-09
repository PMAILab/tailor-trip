import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, Users, Scale } from 'lucide-react';

export type TradeOffMode = 'cheapest' | 'least-crowded' | 'balanced';

interface TradeOffToggleProps {
    activeMode: TradeOffMode;
    onModeChange: (mode: TradeOffMode) => void;
}

const MODES: { key: TradeOffMode; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'cheapest', label: 'Cheapest', icon: DollarSign, desc: 'Lowest cost' },
    { key: 'least-crowded', label: 'Least Crowded', icon: Users, desc: 'Fewest people' },
    { key: 'balanced', label: 'Balanced', icon: Scale, desc: 'Best overall' },
];

export default function TradeOffToggle({ activeMode, onModeChange }: TradeOffToggleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
            <h3 className="text-lg font-bold text-slate-900 mb-1">Optimize For</h3>
            <p className="text-sm text-slate-500 mb-4">Choose what matters most to you</p>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                {MODES.map(mode => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.key;
                    return (
                        <button
                            key={mode.key}
                            onClick={() => onModeChange(mode.key)}
                            className={`relative flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all duration-300 cursor-pointer ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="trade-off-pill"
                                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-blue-200"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">
                                <Icon className="w-5 h-5" />
                            </span>
                            <span className="relative z-10 text-xs font-bold">{mode.label}</span>
                            <span className={`relative z-10 text-[10px] ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{mode.desc}</span>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
