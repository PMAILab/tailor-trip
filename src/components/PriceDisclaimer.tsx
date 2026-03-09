/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info } from 'lucide-react';

export default function PriceDisclaimer() {
    return (
        <div className="flex items-start md:items-center gap-2 text-xs text-slate-500 max-w-3xl mx-auto px-1 pb-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 md:mt-0 text-slate-400" />
            <p>
                Prices shown are estimates based on recent data. Actual prices on the booking platform may vary.
            </p>
        </div>
    );
}
