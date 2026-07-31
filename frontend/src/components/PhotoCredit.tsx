import type { ImageCredit } from '../types/types';

// Unsplash's API Guidelines require links back to carry UTM parameters
// naming the app. The photographer's own profile link arrives from the API
// already tagged (see backend/src/services/images.ts); this covers the
// "on Unsplash" half of the credit.
const UNSPLASH_HOME_URL = 'https://unsplash.com/?utm_source=TailorTrip&utm_medium=referral';

/** Photographer credit for an Unsplash photo, overlaid on the bottom edge of
 *  the image it belongs to. Required wherever an API-sourced photo is shown,
 *  and a condition of Unsplash production API access.
 *
 *  Renders nothing when the photo has no credit — the hand-authored catalog's
 *  hardcoded images and the generic fallbacks have no known photographer.
 *
 *  Positioned absolutely rather than nested with the image because cards wrap
 *  their image in a router <Link>, and these credits are themselves links —
 *  anchors can't legally nest. `imageHeightClass` should match the height of
 *  the image being credited so the overlay lands on its bottom edge. */
export default function PhotoCredit({
  credit,
  imageHeightClass = 'h-64',
}: {
  credit?: ImageCredit;
  imageHeightClass?: string;
}) {
  if (!credit) return null;

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-end ${imageHeightClass}`}>
      <p className="w-full bg-gradient-to-t from-black/55 to-transparent px-4 pb-2 pt-8 text-[10px] leading-tight text-white/85">
        Photo by{' '}
        <a
          href={credit.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          // Re-enabled only on the links themselves, so the credit never
          // swallows clicks meant for the card underneath it.
          className="pointer-events-auto underline underline-offset-2 hover:text-white"
        >
          {credit.photographer}
        </a>{' '}
        on{' '}
        <a
          href={UNSPLASH_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto underline underline-offset-2 hover:text-white"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}
