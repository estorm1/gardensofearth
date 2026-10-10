# Network Dispatch imagery and geographic data

Downloaded 2026-09-09. These are historical satellite composites, not current/live imagery or engineered plans. No API credentials or third-party runtime map requests are required.

## Earth, city and regional images

EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017).

License: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/ . The 2016 product has this license; do not silently substitute the newer non-commercial products.

License references:
- https://cloudless.eox.at/pricing
- https://eox.at/2017/08/sentinel-2-global-cloudless-mosaic/
- https://tiles.maps.eox.at/wms?service=WMS&request=GetCapabilities

Source: EOX WMS `s2cloudless` (EPSG:4326, Earth) and `s2cloudless_3857` (EPSG:3857, cities). JPEG exports resampled to 4096x2048 for Earth and 2048 pixels wide for local views. City bounds are recorded in sites.json; regional images use four times each city width and height about the same center. Imagery is texture-mapped onto a sphere, with feathered patch edges. Atmosphere and lighting are illustrative rendering, not observed weather.

## LA River

Copyright OpenStreetMap contributors, https://www.openstreetmap.org/copyright . Open Database License (ODbL): https://opendatacommons.org/licenses/odbl/1-0/ .

Source: https://overpass-api.de/api/interpreter . Query: `way["waterway"]["name"="Los Angeles River"](33.7,-118.7,34.4,-118.1);out geom;` (JSON). Extracted as GeoJSON LineStrings with source OSM way IDs. The cyan highlight is widened for visibility; it does not depict bank width. Coordinate geometry is retained rather than drawn by hand.

## Reproduction

The tour covers Los Angeles, Singapore, Medellin, Copenhagen, Shenzhen, and Basel. The Shenzhen stop hosts the paired Wuhan/Shenzhen profile; it does not imply that both cities occupy the same location. City bounds and camera stops share `app/network-geo.ts` as their source. Use `--missing-only` to fetch newly added satellite views without replacing existing assets or river geometry.

Editorial illustration prompts and provenance are recorded in `public/images/network-illustrations.md`. These conceptual scenes are separate from the georeferenced satellite maps. Profile evidence links live in `app/network-profiles.ts`; targets and reported results are deliberately distinguished.

Run `node scripts/fetch-network-assets.mjs` with network access. No account/key needed. Review licenses before updating imagery to any different epoch. Asset fetching is an explicit development step, not part of site runtime or build.
