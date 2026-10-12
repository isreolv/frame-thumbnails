# Frame — YouTube thumbnail studio

Nuxt 4 application for comparing proposed thumbnails in a YouTube-style home feed, search results, mobile feed, and a side-by-side view at 360, 240, and 168 pixel widths. Includes image uploads, multiple variants, video details, feed placement, light/dark previews, and live YouTube searches.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. The sample feed works without credentials. Upload JPG, PNG, or WebP files (up to 10 MB each, 12 variants). Images stay in browser memory and are released when removed; refreshing clears the workspace. Non-16:9 images are cropped for the preview.

## Live YouTube results

1. Create a Google Cloud project and enable **YouTube Data API v3**.
2. Create an API key and restrict its API access to YouTube Data API v3.
3. Either enter the key using **Connect YouTube**, or copy `.env.example` to `.env` and set `NUXT_YOUTUBE_API_KEY`.
4. Enter a query in the preview search bar and submit. The selected variant is inserted into the returned results at your chosen position.

Channel name, search region, and your entered API key are cached in localStorage in this browser. The saved key is never filled into the connection textbox; leave the field empty to reuse it, enter a new key to replace it, or select **Forget saved key** to remove it. Both credential options use a same-origin Nuxt server endpoint. Server keys are private runtime configuration and never included in frontend bundles. Since requests originate on the server, browser-referrer key restrictions do not apply; use a server IP restriction where your host has a stable outbound IP. OAuth/service-account JSON is not required or accepted for public search.

Search uses `search.list` and `videos.list` for thumbnails, titles, channel names, durations, and view counts. It uses Google Cloud quota; consult current [YouTube quota documentation](https://developers.google.com/youtube/v3/determine_quota_cost). Results come from the Data API and are not personalized or guaranteed to match the youtube.com ranking. Demo entries are illustrative and clearly labeled. The acoustic/rock sample feed is inspired by Talles Cattarin’s covers of the Ramones, John Lennon, and Gigi D’Agostino, with studio and music vlog examples. Titles, channels, and metrics in the sample feed are illustrative.

## Validate / production

```sh
npm run typecheck
npm run build
npm run preview
```

The production app requires a server runtime; do not use a static export for the API integration. Set `NUXT_YOUTUBE_API_KEY` in the runtime environment (production does not automatically load `.env`). The default Nitro build runs with `node .output/server/index.mjs`; `PORT` defaults to 3000. Place behind authentication and request rate limiting before sharing a deployment backed by your server key. This project has not been published.

Demo photography: Unsplash. Interface icons: Lucide. Fonts: DM Sans and Manrope via Google Fonts.

## Browser tests

```sh
npx playwright install chromium
npm run build
npm test
```

The tests cover upload and removal, placement, comparison widths, mobile overflow, cached-key search UI (mocked provider results), and API input/origin validation. Live Google requests require your own key and were not exercised during development.

Dependency audit currently reports 14 transitive findings (7 high, 7 critical), including disabled Nuxt development tooling and Nitro dependencies. Some have no patched release in the resolved dependency ranges. Review `npm audit` before production deployment; automatic forced fixes suggest downgrading Nuxt and are not applied.


Music theme references: [Ramones acoustic cover](https://soundcloud.com/talles-cattarin/the-ramones-the-kkk-took-my-bay-away-acoustic-cover), [Imagine rock cover](https://soundcloud.com/talles-cattarin/john-lennon-imagine-rock-cover), [L’Amour Toujours rock cover](https://soundcloud.com/talles-cattarin/gigig-dagostino-lamour-toujours-rock-cover).
# frame-thumbnails
