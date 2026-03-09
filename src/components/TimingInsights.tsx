import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, CloudSun, Sun, CloudRain, Snowflake, Flame } from 'lucide-react';
import type { MonthlyData, CrowdLevel, WeatherType } from '../types';

interface TimingInsightsProps {
    monthlyData: MonthlyData[];
    cheapestMonth: string;
    highlightMode: 'cheapest' | 'least-crowded' | 'balanced';
}

const CROWD_COLORS: Record<CrowdLevel, string> = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444',
};

const WEATHER_ICONS: Record<WeatherType, { icon: React.ElementType; label: string; color: string }> = {
    Pleasant: { icon: Sun, label: 'Pleasant', color: '#f59e0b' },
    Hot: { icon: Flame, label: 'Hot', color: '#ef4444' },
    Rainy: { icon: CloudRain, label: 'Rainy', color: '#3b82f6' },
    Cold: { icon: Snowflake, label: 'Cold', color: '#6366f1' },
};

function formatCostShort(cost: number): string {
    if (cost >= 1000) return `₹${(cost / 1000).toFixed(cost % 1000 === 0 ? 0 : 1)}k`;
    return `₹${cost}`;
}

function getRecommendedMonth(monthlyData: MonthlyData[], mode: 'cheapest' | 'least-crowded' | 'balanced'): string {
    if (mode === 'cheapest') {
        return monthlyData.reduce((best, m) => m.cost < best.cost ? m : best).month;
    }
    if (mode === 'least-crowded') {
        const crowdOrder: Record<CrowdLevel, number> = { Low: 0, Medium: 1, High: 2 };
        return monthlyData.reduce((best, m) => crowdOrder[m.crowdLevel] < crowdOrder[best.crowdLevel] ? m : best).month;
    }
    // Balanced: score = normalized cost + crowd penalty, lower is better
    const maxCost = Math.max(...monthlyData.map(m => m.cost));
    const minCost = Math.min(...monthlyData.map(m => m.cost));
    const crowdScore: Record<CrowdLevel, number> = { Low: 0, Medium: 0.5, High: 1 };
    const weatherBonus: Record<WeatherType, number> = { Pleasant: -0.2, Hot: 0.1, Rainy: 0.3, Cold: 0.1 };
    return monthlyData.reduce((best, m) => {
        const costNorm = maxCost > minCost ? (m.cost - minCost) / (maxCost - minCost) : 0;
        const score = costNorm + crowdScore[m.crowdLevel] + weatherBonus[m.weather];
        const bestCostNorm = maxCost > minCost ? (best.cost - minCost) / (maxCost - minCost) : 0;
        const bestScore = bestCostNorm + crowdScore[best.crowdLevel] + weatherBonus[best.weather];
        return score < bestScore ? m : best;
    }).month;
}

export default function TimingInsights({ monthlyData, cheapestMonth, highlightMode }: TimingInsightsProps) {
    const maxCost = Math.max(...monthlyData.map(m => m.cost));
    const recommendedMonth = getRecommendedMonth(monthlyData, highlightMode);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Timing Insights
                </h3>
                <span className="text-xs font-semibold text-primary bg-blue-50 px-3 py-1 rounded-full">
                    Best: {recommendedMonth}
                </span>
            </div>

            {/* Cheapest Month Chart */}
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-3">Monthly Cost Estimate</p>
                <div className="flex items-end gap-1.5 h-32">
                    {monthlyData.map((m, i) => {
                        const heightPct = maxCost > 0 ? (m.cost / maxCost) * 100 : 50;
                        const isHighlighted = m.month === recommendedMonth;
                        const isCheapest = m.month.toLowerCase().startsWith(cheapestMonth.toLowerCase().slice(0, 3));
                        return (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-8 bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {formatCostShort(m.cost)}
                                </div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPct}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                                    className={`w-full rounded-t-md cursor-pointer transition-colors ${isHighlighted
                                            ? 'bg-primary shadow-md shadow-blue-200'
                                            : isCheapest
                                                ? 'bg-emerald-400'
                                                : 'bg-slate-200 hover:bg-slate-300'
                                        }`}
                                />
                                <span className={`text-[10px] font-semibold ${isHighlighted ? 'text-primary' : 'text-slate-400'}`}>
                                    {m.month}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Crowd Calendar */}
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Crowd Level
                </p>
                <div className="grid grid-cols-12 gap-1">
                    {monthlyData.map(m => (
                        <div key={m.month} className="flex flex-col items-center gap-1 group relative">
                            <div
                                className="w-full h-6 rounded-md cursor-pointer transition-transform hover:scale-110"
                                style={{ backgroundColor: CROWD_COLORS[m.crowdLevel] }}
                                title={`${m.month}: ${m.crowdLevel} crowd`}
                            />
                            <span className="text-[9px] text-slate-400 font-medium">{m.month}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-2 justify-end">
                    {(['Low', 'Medium', 'High'] as CrowdLevel[]).map(level => (
                        <div key={level} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CROWD_COLORS[level] }} />
                            <span className="text-[10px] text-slate-500 font-medium">{level}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weather Pattern */}
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-3 flex items-center gap-1.5">
                    <CloudSun className="w-3.5 h-3.5" /> Weather Pattern
                </p>
                <div className="grid grid-cols-12 gap-1">
                    {monthlyData.map(m => {
                        const weatherInfo = WEATHER_ICONS[m.weather];
                        const Icon = weatherInfo.icon;
                        return (
                            <div key={m.month} className="flex flex-col items-center gap-1 group relative" title={`${m.month}: ${weatherInfo.label}`}>
                                <div className="w-full h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                                    <Icon className="w-3.5 h-3.5" style={{ color: weatherInfo.color }} />
                                </div>
                                <span className="text-[9px] text-slate-400 font-medium">{m.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

export { getRecommendedMonth };
