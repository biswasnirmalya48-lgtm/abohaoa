# Abohaoa

A living weather window. Ultra-minimal, immersive, and fully weather-reactive — the entire
atmosphere (sky, light, clouds, rain, snow, fog, lightning, wind motion) changes automatically
based on live conditions, local time, temperature, and sun position.

Built with **React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Zustand**.

## Features

- Live current weather, feels-like, high/low, 24-hour and 7-day forecasts
- Humidity, wind (speed + direction), UV index, visibility, precipitation chance, sunrise/sunset
- Browser geolocation with a friendly permission onboarding and graceful fallback
- Worldwide city search with autocomplete and recent searches
- Favourite cities saved in `localStorage`; swipe/drag or arrow keys to switch between them
- Unit switching: °C/°F and km/h/mph
- Realistic weather-reactive animation system:
  - clear day (sun glow, slow rays), clear night (moon, twinkling stars)
  - parallax cloud layers, overcast fog, rain and heavy rain slanted by real wind
  - snow with depth and sway, drifting fog bands, rare soft lightning, hot-weather haze
  - gradual crossfade transitions between scenes — never abrupt
- Respects `prefers-reduced-motion`, pauses particles when the tab is hidden
- Loading skeleton, API-error state, offline "last known weather" view (cached per location)
- Pull-to-refresh on mobile + subtle refresh button
- **Demo mode**: the full app works with simulated data before you add an API key

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app starts in **demo mode** automatically if no API key is set.
You can also force demo mode with `npm run dev -- --demo` (or add `?demo=1` to the URL),
or toggle it in Settings.

## API key setup (live weather)

Abohaoa uses [OpenWeatherMap](https://openweathermap.org/):

1. Create a free account at https://home.openweathermap.org/users/sign_up
2. In **API keys**, generate a key.
3. Make sure the key has access to Current Weather, 5-day/3-hour Forecast, and Geocoding.
4. Copy `.env.example` to `.env` and add your key:

```env
VITE_WEATHER_API_KEY=your_key_here
```

5. Restart the dev server. The "Demo" badge in the top-left disappears when live data is active.

## Project structure

```
src/
  components/          UI components (screens, panels, modals, icons)
    scenes/            Weather-reactive animation system
      WeatherScene.tsx   Scene composition + crossfades
      PrecipCanvas.tsx   Canvas rain/snow particles (wind-driven)
      Clouds.tsx         Parallax cloud layers
      Stars.tsx / Fog.tsx / Lightning.tsx / GlassDroplets.tsx
  hooks/               useGeolocation, useWeatherData, usePullToRefresh, environment hooks
  lib/                 units & formatting, weather-scene derivation
  services/            weatherApi.ts (OpenWeatherMap layer), mockWeather.ts (demo data)
  store/               useAppStore.ts (Zustand + localStorage persistence)
  types/               shared TypeScript types
```

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm start`       | Start the dev server           |
| `npm run dev`     | Start the dev server           |
| `npm run build`   | Type-check + production build  |
| `npm run preview` | Preview the production build   |
| `npm run typecheck` | TypeScript only              |

## Deployment

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

**Vercel / Netlify:**

1. Import this repository.
2. Build command: `npm run build` — output directory: `dist`.
3. Add `VITE_WEATHER_API_KEY` in the project's environment variables.
4. Deploy.

Environment variables prefixed with `VITE_` are embedded at build time, so rebuild after
changing the key.

## Notes

- Weather data and favourite cities are cached in `localStorage`; the offline view shows the
  last known weather with an "Offline" badge.
- Animation intensity (Calm / Normal / Vivid) is user-controlled in Settings, and the system
  reduced-motion preference always takes priority.
