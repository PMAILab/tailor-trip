/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function DestinationCardSkeleton() {
    return (
        <div
            className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col border border-gray-100 animate-pulse"
            aria-hidden="true"
        >
            {/* Hero image placeholder */}
            <div className="h-56 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 shimmer" />

            {/* Card body */}
            <div className="p-4 flex flex-col gap-4">
                {/* Cost + Duration row */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-3 w-14 bg-slate-200 rounded mb-2" />
                        <div className="h-5 w-28 bg-slate-200 rounded" />
                    </div>
                    <div className="text-right">
                        <div className="h-3 w-14 bg-slate-200 rounded mb-2 ml-auto" />
                        <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
                    </div>
                </div>

                {/* Badges placeholder */}
                <div className="flex items-center gap-2">
                    <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>

                {/* Why section placeholder */}
                <div className="bg-slate-50 rounded-lg p-3">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                </div>
            </div>
        </div>
    );
}
