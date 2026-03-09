import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Wallet, IndianRupee } from 'lucide-react';

const SALARY_KEY = 'tailortrip_monthly_salary';

interface BudgetFitMeterProps {
    totalCost: number;
}

function loadSalary(): number | null {
    try {
        const raw = localStorage.getItem(SALARY_KEY);
        if (raw) return Number(raw);
    } catch { }
    return null;
}

function getColor(pct: number): string {
    if (pct <= 20) return '#10b981';
    if (pct <= 40) return '#f59e0b';
    return '#ef4444';
}

function getLabel(pct: number): string {
    if (pct <= 10) return 'Very affordable';
    if (pct <= 20) return 'Comfortable';
    if (pct <= 30) return 'Moderate';
    if (pct <= 40) return 'Significant';
    return 'Consider budgeting';
}

export default function BudgetFitMeter({ totalCost }: BudgetFitMeterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [salary, setSalary] = useState<number | null>(loadSalary);
    const [inputValue, setInputValue] = useState<string>(salary ? salary.toString() : '');

    useEffect(() => {
        if (salary) {
            localStorage.setItem(SALARY_KEY, salary.toString());
        }
    }, [salary]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setInputValue(raw);
        const val = Number(raw);
        if (val > 0) setSalary(val);
    };

    const percentage = salary && salary > 0 ? Math.round((totalCost / salary) * 100) : null;
    const displaySalary = inputValue
        ? new Intl.NumberFormat('en-IN').format(Number(inputValue))
        : '';

    // Auto-open if salary was previously saved
    useEffect(() => {
        if (salary) setIsOpen(true);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">Budget Fit Meter</p>
                        <p className="text-xs text-slate-500">Check how this trip fits your budget (optional)</p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 space-y-4">
                            {/* Salary input */}
                            <div>
                                <label className="text-xs text-slate-500 font-medium mb-1 block">Monthly Income</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={displaySalary}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 50,000"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50"
                                    />
                                </div>
                            </div>

                            {/* Gauge */}
                            {percentage !== null && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-3"
                                >
                                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: getColor(percentage) }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-slate-700">
                                            This trip is approx <span className="font-black" style={{ color: getColor(percentage) }}>{percentage}%</span> of your monthly income.
                                        </p>
                                        <span
                                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{
                                                backgroundColor: `${getColor(percentage)}15`,
                                                color: getColor(percentage),
                                            }}
                                        >
                                            {getLabel(percentage)}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
