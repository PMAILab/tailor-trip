/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Heart, TrendingDown, Clock, Brain, ChevronDown, Eye, Calendar,
} from 'lucide-react';
import Badge from './Badge';
import { useMood } from '../state/MoodContext';
import type { Destination } from '../types';

interface DestinationCardProps {
    destination: Destination;
    index?: number;
    onToggleSave?: (id: string) => void;
}

export default function DestinationCard({ destination, index = 0, onToggleSave }: DestinationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { isSaved, toggleSaveDestination } = useMood();
    const saved = isSaved(destination.id);

    const handleToggleSave = () => {
        if (onToggleSave) {
            onToggleSave(destination.id);
        } else {
            toggleSaveDestination(destination.id);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            className={`bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden flex flex-col group h-full border relative ${saved ? 'border-primary/40 ring-1 ring-primary/20' : 'border-gray-100'
                }`}
            aria-label={`Destination: ${destination.name}`}
        >
            {/* Wishlist / Save button */}
            <div className="absolute top-3 right-3 z-20">
                <button
                    onClick={handleToggleSave}
                    aria-label={saved ? `Remove ${destination.name} from wishlist` : `Save ${destination.name} to wishlist`}
                    className={`backdrop-blur-sm p-2 rounded-full shadow-sm transition-all duration-300 ${saved
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/90 text-gray-400 hover:bg-red-50 hover:text-red-500'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Hero Image */}
            <Link
                to={`/trip/${destination.id}`}
                className="relative h-56 overflow-hidden block"
                aria-label={`View details for ${destination.name}`}
            >
                {/* Badge overlay */}
                {destination.badge && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-accent-green/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {destination.badge}
                        </span>
                    </div>
                )}

                {/* Match % badge */}
                <div className="absolute top-3 right-12 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {destination.matchPercent}% match
                    </span>
                </div>

                <img
                    src={destination.img}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                    <h3 className="text-xl font-bold leading-tight">{destination.name}</h3>
                    <p className="text-white/85 text-sm font-medium">{destination.region}</p>
                </div>
            </Link>

            {/* Card body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Cost + Duration row */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Est. Cost</p>
                        <p className="text-lg font-bold text-slate-800">{destination.estimatedCost}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Duration</p>
                        <div className="flex items-center gap-1 justify-end">
                            <Clock className="w-[18px] h-[18px] text-slate-500" />
                            <p className="text-sm font-medium text-slate-700">{destination.duration}</p>
                        </div>
                    </div>
                </div>

                {/* Cheapest month indicator */}
                {destination.cheapestMonth && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg w-fit">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-semibold">Cheapest in {destination.cheapestMonth}</span>
                    </div>
                )}

                {/* Contextual Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {destination.tags.map((tag, i) => (
                        <Badge key={i} tag={tag} />
                    ))}
                </div>

                {/* Why this fits you — collapsible */}
                {destination.whyItFitsYou && (
                    <div className="mt-auto bg-slate-50 rounded-lg border border-slate-100">
                        <button
                            id={`why-btn-${destination.id}`}
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-expanded={isExpanded}
                            aria-controls={`why-content-${destination.id}`}
                            className="w-full flex items-center justify-between p-3 cursor-pointer select-none"
                        >
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                                <Brain className="w-4 h-4" />
                                Why this fits you
                            </span>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ChevronDown className="w-[18px] h-[18px] text-slate-400" />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isExpanded && (
                                <motion.div
                                    id={`why-content-${destination.id}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-3 pb-3 pt-0">
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {destination.whyItFitsYou}
                                        </p>

                                        {/* View Details CTA (Expanded state) */}
                                        <Link
                                            to={`/trip/${destination.id}`}
                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View Details
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.article>
    );
}
