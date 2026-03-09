import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Hotel, Coffee, Camera, Users, Minus, Plus } from 'lucide-react';
import type { CostBreakdownData } from '../types';

interface CostBreakdownProps {
    costBreakdown: CostBreakdownData;
    estimatedCost: string;
}

const CATEGORIES = [
    { key: 'travel' as const, label: 'Travel', icon: Plane, color: '#135bec' },
    { key: 'stay' as const, label: 'Stay', icon: Hotel, color: '#8b5cf6' },
    { key: 'food' as const, label: 'Food', icon: Coffee, color: '#f59e0b' },
    { key: 'experiences' as const, label: 'Experiences', icon: Camera, color: '#10b981' },
];

function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function CostBreakdown({ costBreakdown, estimatedCost }: CostBreakdownProps) {
    const [travelers, setTravelers] = useState(1);
    const total = costBreakdown.travel + costBreakdown.stay + costBreakdown.food + costBreakdown.experiences;
    const perPerson = Math.round(total / travelers);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cost Breakdown</h3>
            <p className="text-sm text-slate-500 mb-6">Estimated total: <span className="font-semibold text-slate-700">{estimatedCost}</span></p>

            {/* Segmented Bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-6 shadow-inner bg-gray-100">
                {CATEGORIES.map((cat, i) => {
                    const value = costBreakdown[cat.key];
                    const pct = total > 0 ? (value / total) * 100 : 25;
                    return (
                        <motion.div
                            key={cat.key}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                            className="h-full relative group cursor-pointer"
                            style={{ backgroundColor: cat.color }}
                            title={`${cat.label}: ${formatINR(value)}`}
                        >
                            {/* Hover tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {cat.label}: {formatINR(value)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend + amounts */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {CATEGORIES.map(cat => {
                    const value = costBreakdown[cat.key];
                    const Icon = cat.icon;
                    const pct = total > 0 ? Math.round((value / total) * 100) : 25;
                    return (
                        <div key={cat.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${cat.color}15` }}
                            >
                                <Icon className="w-4 h-4" style={{ color: cat.color }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">{cat.label}</p>
                                <p className="text-sm font-bold text-slate-800">{formatINR(value)} <span className="text-slate-400 font-normal">({pct}%)</span></p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Per-person estimate */}
            <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-primary/10 rounded-xl">
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Per Person</p>
                    <p className="text-xl font-black text-primary">{formatINR(perPerson)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setTravelers(Math.max(1, travelers - 1))}
                            disabled={travelers <= 1}
                            className="p-2 text-slate-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease travelers"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-slate-800 w-6 text-center">{travelers}</span>
                        <button
                            onClick={() => setTravelers(travelers + 1)}
                            className="p-2 text-slate-500 hover:text-primary transition-colors"
                            aria-label="Increase travelers"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
