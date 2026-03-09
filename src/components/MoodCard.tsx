/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { MoodMeta } from '../types';

interface MoodCardProps {
    meta: MoodMeta;
    isSelected: boolean;
    isLoading: boolean;
    onClick: () => void;
}

export default function MoodCard({ meta, isSelected, isLoading, onClick }: MoodCardProps) {
    return (
        <button
            id={`mood-card-${meta.mood.toLowerCase().replace(/\s+/g, '-')}`}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Select mood: ${meta.mood}. ${meta.desc}`}
            disabled={isLoading}
            onClick={onClick}
            className={`
        group relative h-56 md:h-64 rounded-2xl overflow-hidden cursor-pointer 
        transition-all duration-300 text-left w-full
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2
        ${isSelected
                    ? 'ring-4 ring-white ring-offset-4 ring-offset-blue-500 scale-[1.03] shadow-2xl'
                    : 'hover:scale-[1.02] hover:shadow-xl shadow-md'
                }
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
        >
            {/* Background image */}
            <img
                src={meta.img}
                alt={meta.mood}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 transition-all duration-300 ${meta.gradient} opacity-80 group-hover:opacity-90`} />

            {/* Selected checkmark */}
            {isSelected && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md z-10">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}

            {/* Loading spinner overlay */}
            {isSelected && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-[1px]">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <p className="text-3xl mb-1">{meta.emoji}</p>
                <h3 className="text-xl font-bold text-white leading-tight mb-1">{meta.mood}</h3>
                <p className="text-white/85 text-sm font-medium leading-snug">{meta.desc}</p>
            </div>
        </button>
    );
}
