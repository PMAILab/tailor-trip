/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Destination } from '../types';

export const OTA_PARTNERS = {
    MAKEMYTRIP: 'MakeMyTrip',
    // We can add booking.com, goibibo, etc.
} as const;

export type OtaPartner = typeof OTA_PARTNERS[keyof typeof OTA_PARTNERS];

/**
 * Constructs an OTA redirect URL based on destination data.
 * For MVP, we will construct a MakeMyTrip search URL.
 * 
 * @param destination The destination object
 * @param partner The OTA partner to redirect to
 * @returns The constructed URL
 */
export function getOtaRedirectUrl(destination: Destination | null, partner: OtaPartner = OTA_PARTNERS.MAKEMYTRIP): string {
    if (!destination) {
        // Fallback to a generic search if no destination is provided
        switch (partner) {
            case OTA_PARTNERS.MAKEMYTRIP:
            default:
                return 'https://www.makemytrip.com/';
        }
    }

    // Replace spaces with hyphens or URL encode based on the OTA partner's expected format
    const queryName = encodeURIComponent(destination.name);

    switch (partner) {
        case OTA_PARTNERS.MAKEMYTRIP:
        default:
            // A generic query for MakeMyTrip (actual deep linking typically requires a city ID, 
            // but a search query parameter is a good MVP approximation)
            return `https://www.makemytrip.com/holidays/india/search?q=${queryName}`;
    }
}
