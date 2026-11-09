import type { APIRoute } from 'astro';
import { feldolgoz } from '../../lib/urlap-szerver';

export const prerender = false;

export const POST: APIRoute = ({ request }) => feldolgoz('ajanlatkeres', request);
