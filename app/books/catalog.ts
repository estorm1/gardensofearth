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

// Add only a verified public Amazon listing after a separate print release.
export const printEditions = {
  "volume-i": { amazonUrl: null, label: "In preparation" },
  "volume-ii": { amazonUrl: null, label: "Available soon" },
} as const;
