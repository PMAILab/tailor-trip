/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
    message: string;
    visible: boolean;
    onUndo: () => void;
    onDismiss: () => void;
    duration?: number;
}

export default function UndoToast({
    message,
    visible,
    onUndo,
    onDismiss,
    duration = 4000,
}: UndoToastProps) {
    const [progress, setProgress] = useState(100);
    const [expired, setExpired] = useState(false);

    // When the timer expires, trigger dismiss in a separate effect
    // to avoid calling onDismiss inside a setState updater
    useEffect(() => {
        if (expired) {
            setExpired(false);
            onDismiss();
        }
    }, [expired, onDismiss]);

    useEffect(() => {
        if (!visible) {
            setProgress(100);
            setExpired(false);
            return;
        }

        setProgress(100);
        setExpired(false);
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev - step;
                if (next <= 0) {
                    clearInterval(timer);
                    setExpired(true);
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [visible, duration]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
                >
                    <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4">
                            <p className="text-sm font-medium flex-1 truncate">{message}</p>

                            <button
                                onClick={() => {
                                    onUndo();
                                }}
                                className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors shrink-0 cursor-pointer"
                            >
                                <Undo2 className="w-4 h-4" />
                                Undo
                            </button>

                            <button
                                onClick={onDismiss}
                                className="text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="h-[3px] bg-slate-700">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: '100%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.05, ease: 'linear' }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
