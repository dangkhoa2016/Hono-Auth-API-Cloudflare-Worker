/**
 * Favicon Routes
 * Serves favicon files using Cloudflare Workers Assets binding
*/

import { Hono } from 'hono';
import { faviconRoutes_log } from '../utils/debug.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';

const favicon = new Hono();
favicon.use('*', unifiedMiddlewares.auto());

/**
 * Handle favicon.ico requests
*/
favicon.on('GET', ['/favicon.ico', '/favicon'], (c) => {
  faviconRoutes_log('Serving favicon.ico via assets');

  try {
    // Use assets binding to serve the static file
    const request = new Request(`${c.req.url.split('/').slice(0, 3).join('/')}/favicon.ico`);
    return c.env.ASSETS.fetch(request);
  } catch (error) {
    faviconRoutes_log(`Error serving favicon.ico: ${error.message}`);
    return c.text('Favicon not found', 404);
  }
});

/**
 * Handle favicon.png requests
*/
favicon.get('/favicon.png', (c) => {
  faviconRoutes_log('Serving favicon.png via assets');

  try {
    const request = new Request(`${c.req.url.split('/').slice(0, 3).join('/')}/favicon.png`);
    return c.env.ASSETS.fetch(request);
  } catch (error) {
    faviconRoutes_log(`Error serving favicon.png: ${error.message}`);
    return c.text('Favicon not found', 404);
  }
});

/**
 * Apple touch icon (common request from mobile browsers)
*/
favicon.get('/apple-touch-icon.png', (c) => {
  faviconRoutes_log('Serving apple-touch-icon.png via assets');

  try {
    // Use the same favicon.png for apple touch icon
    const request = new Request(`${c.req.url.split('/').slice(0, 3).join('/')}/favicon.png`);
    return c.env.ASSETS.fetch(request);
  } catch (error) {
    faviconRoutes_log(`Error serving apple-touch-icon.png: ${error.message}`);
    return c.text('Apple touch icon not found', 404);
  }
});

/**
 * Manifest icon (for PWA)
*/
favicon.get('/icon-192.png', (c) => {
  faviconRoutes_log('Serving icon-192.png via assets');

  try {
    const request = new Request(`${c.req.url.split('/').slice(0, 3).join('/')}/icon-192.png`);
    return c.env.ASSETS.fetch(request);
  } catch (error) {
    faviconRoutes_log(`Error serving icon-192.png: ${error.message}`);
    return c.text('Icon not found', 404);
  }
});

export default favicon;
