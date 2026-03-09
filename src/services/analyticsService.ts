/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OtaPartner } from './otaService';

const ANALYTICS_KEY = 'tailortrip_analytics';

export interface OutboundClickEvent {
    destination_name: string;
    destination_cost_range: string;
    cheapest_month: string;
    mood: string;
    timestamp: string;
    ota_partner: OtaPartner;
}

/**
 * Tracks an outbound click event.
 * Currently stores the event in localStorage (MVP).
 */
export function trackOutboundClick(eventData: Omit<OutboundClickEvent, 'timestamp'>) {
    const event: OutboundClickEvent = {
        ...eventData,
        timestamp: new Date().toISOString(),
    };

    // 1. Dev-only console log
    console.log('[Analytics] Outbound Click Tracked:', event);

    // 2. Persist to localStorage
    try {
        const stored = localStorage.getItem(ANALYTICS_KEY);
        const events: OutboundClickEvent[] = stored ? JSON.parse(stored) : [];
        events.push(event);
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
    } catch (error) {
        console.error('[Analytics] Failed to save event to localStorage', error);
    }
}
