import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, GitCompare, ExternalLink, Loader2 } from 'lucide-react';
import { Destination, Mood } from '../types';
import { getOtaRedirectUrl, OTA_PARTNERS } from '../services/otaService';
import { trackOutboundClick } from '../services/analyticsService';
import PriceDisclaimer from './PriceDisclaimer';

interface ActionCTABarProps {
    destination: Destination;
    selectedMood: Mood | null;
    isSaved: boolean;
    isCompared: boolean;
    onToggleSave: () => void;
    onToggleCompare: () => void;
}

export default function ActionCTABar({ destination, selectedMood, isSaved, isCompared, onToggleSave, onToggleCompare }: ActionCTABarProps) {
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        // Log analytics event
        trackOutboundClick({
            destination_name: destination.name,
            destination_cost_range: destination.estimatedCost,
            cheapest_month: destination.cheapestMonth,
            mood: selectedMood || 'Unknown',
            ota_partner: OTA_PARTNERS.MAKEMYTRIP,
        });

        // Small visual feedback before opening new tab
        setIsRedirecting(true);
        setTimeout(() => {
            setIsRedirecting(false);
            window.open(getOtaRedirectUrl(destination, OTA_PARTNERS.MAKEMYTRIP), '_blank');
        }, 400);
    };
    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
        >
            <div className="max-w-[1200px] mx-auto px-6 pt-3 pb-4">
                <PriceDisclaimer />
                <div className="flex items-center gap-3 mt-1">
                    {/* Save Button */}
                    <button
                        onClick={onToggleSave}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isSaved
                            ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                            : 'bg-slate-100 text-slate-700 border border-gray-200 hover:bg-slate-200'
                            }`}
                        aria-label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={onToggleCompare}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${isCompared
                            ? 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100'
                            : 'bg-slate-100 text-slate-700 border border-gray-200 hover:bg-slate-200'
                            }`}
                        aria-label={isCompared ? 'Remove from compare' : 'Compare later'}
                    >
                        <GitCompare className={`w-5 h-5`} />
                        <span className="hidden sm:inline">{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>

                    {/* Booking Button */}
                    <a
                        href={getOtaRedirectUrl(destination, OTA_PARTNERS.MAKEMYTRIP)}
                        onClick={handleBookingClick}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-white transition-all shadow-md shadow-blue-200 relative overflow-hidden group"
                    >
                        {isRedirecting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Redirecting...</span>
                            </>
                        ) : (
                            <>
                                <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                <span>View Booking Options</span>
                            </>
                        )}
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
