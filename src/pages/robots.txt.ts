import type { APIRoute } from 'astro';

/**
 * robots.txt – élesben mindent enged (az /api/ kivételével).
 * Netlify előnézeti telepítéseken, vagy ROBOTS_NOINDEX=1 esetén mindent tilt.
 */
export const GET: APIRoute = ({ site }) => {
  const tilt =
    process.env.ROBOTS_NOINDEX === '1' || (process.env.NETLIFY === 'true' && process.env.CONTEXT !== 'production');
  const torzs = tilt
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`;
  return new Response(torzs, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
