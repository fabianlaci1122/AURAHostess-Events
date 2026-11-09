// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SITE_URL = (process.env.SITE_URL || env.SITE_URL || 'https://example.com').replace(/\/+$/, '');
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || env.DEPLOY_TARGET || 'netlify';

// Betűfájlok a telepített @fontsource csomagokból (latin + latin-ext: így az ő és ű is megvan).
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'.split(',');
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'.split(',');
const RESZHALMAZOK = /** @type {const} */ ([
  ['latin', LATIN],
  ['latin-ext', LATIN_EXT],
]);

const cormorant = [600].flatMap((weight) =>
  /** @type {const} */ (['normal', 'italic']).flatMap((style) =>
    RESZHALMAZOK.map(([reszhalmaz, tartomany]) => ({
      src: /** @type {[string]} */ ([`./node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-${reszhalmaz}-${weight}-${style}.woff2`]),
      weight,
      style,
      unicodeRange: /** @type {[string, ...string[]]} */ (tartomany),
    })),
  ),
);
const jost = RESZHALMAZOK.map(([reszhalmaz, tartomany]) => ({
  src: /** @type {[string]} */ ([`./node_modules/@fontsource-variable/jost/files/jost-${reszhalmaz}-wght-normal.woff2`]),
  weight: '100 900',
  style: /** @type {const} */ ('normal'),
  unicodeRange: /** @type {[string, ...string[]]} */ (tartomany),
}));

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  output: 'static',
  adapter: DEPLOY_TARGET === 'node' ? node({ mode: 'standalone' }) : netlify(),
  server: { port: 8150 },

  // Most csak magyar; az angol később a /en/ alá kerül (lásd src/i18n/utak.ts).
  i18n: {
    locales: ['hu'],
    defaultLocale: 'hu',
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    sitemap({
      filter: (oldal) => !oldal.includes('/koszonjuk/') && !oldal.includes('/404'),
    }),
  ],

  build: { inlineStylesheets: 'always' },

  // Betűk saját tárhelyről (nincs Google Fonts CDN) – latin + latin-ext, hogy az ő és ű is meglegyen.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      fallbacks: ['Georgia', 'serif'],
      options: { variants: /** @type {any} */ (cormorant) },
    },
    {
      provider: fontProviders.local(),
      name: 'Jost',
      cssVariable: '--font-jost',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: /** @type {any} */ (jost) },
    },
  ],

  env: {
    schema: {
      CRM_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CRM_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_PLAUSIBLE_DOMAIN: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_PLAUSIBLE_SRC: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://plausible.io/js/script.js',
      }),
    },
  },

  vite: { plugins: [tailwindcss()] },
});
