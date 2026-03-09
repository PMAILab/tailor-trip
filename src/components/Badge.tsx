/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Droplets, Snowflake, Thermometer, Users } from 'lucide-react';
import type { DestinationTag } from '../types';

function getCrowdStyle(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('low')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (lower.includes('high')) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
}

function getWeatherStyle(): string {
    return 'bg-sky-50 text-sky-700 border-sky-200';
}

function getWeatherIcon(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes('rain') || lower.includes('humid') || lower.includes('rainy'))
        return <Droplets className="w-3.5 h-3.5" />;
    if (lower.includes('cold') || lower.includes('chilly') || lower.includes('snow'))
        return <Snowflake className="w-3.5 h-3.5" />;
    if (lower.includes('hot'))
        return <Thermometer className="w-3.5 h-3.5" />;
    return <Sun className="w-3.5 h-3.5" />;
}

interface BadgeProps {
    tag: DestinationTag;
}

export default function Badge({ tag }: BadgeProps) {
    const isCrowd = tag.type === 'crowd';
    const style = isCrowd ? getCrowdStyle(tag.text) : getWeatherStyle();
    const icon = isCrowd ? <Users className="w-3.5 h-3.5" /> : getWeatherIcon(tag.text);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}
        >
            {icon}
            {tag.text}
        </span>
    );
}
