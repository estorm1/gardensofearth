// Verified owner handoff, 25 October 2026. These are hosted checkout routes,
// never paid-file URLs. Owner approved release and confirmed both products in a
// private-browser cart on 26 October 2026. Paid delivery remains untested here.
export type AudiobookOffer = {
  id: "volume-i" | "volume-ii";
  volume: string;
  priceUsd: number;
  available: boolean;
  checkoutUrl: string;
};

export const audiobookOffers: AudiobookOffer[] = [
  { id: "volume-i", volume: "Volume I", priceUsd: 7, available: true,
    checkoutUrl: "https://payhip.com/buy?link=QMZfk" },
  { id: "volume-ii", volume: "Volume II", priceUsd: 7, available: true,
    checkoutUrl: "https://payhip.com/buy?link=wAYy7" },
];

export const audiobookPlaybackNote = "Works with Apple Books on Mac and VLC on Mac and Windows.";

// Verified public Kindle listings, 29 October 2026. Retail pages showed preorder
// delivery, so link neutrally without promising immediate reading or download.
export const kindleEditions: Record<AudiobookOffer["id"], { amazonUrl: string }> = {
  "volume-i": { amazonUrl: "https://www.amazon.com/dp/B0HPMMQKSJ" },
  "volume-ii": { amazonUrl: "https://www.amazon.com/dp/B0HPMW8H9P" },
};

// Volume I paperback verified live on Amazon, 29 October 2026.
// Volume II remains unpublished; never infer a retail link from a KDP draft.
export const printEditions = {
  "volume-i": { amazonUrl: "https://www.amazon.com/dp/B0HPPHPJVC", label: "Available on Amazon" },
  "volume-ii": { amazonUrl: null, label: "Available soon" },
} as const;
