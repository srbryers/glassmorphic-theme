#!/usr/bin/env npx tsx
/**
 * Shopify OAuth Script
 *
 * One-time script to authenticate with Shopify and save the access token.
 * This handles the OAuth flow for apps created in the Partner Dashboard.
 *
 * Prerequisites:
 *   1. Create app in Shopify Partner Dashboard
 *   2. Set redirect URL to: http://localhost:3456/callback
 *   3. Add required scopes: read_products, write_products
 *
 * Usage:
 *   1. Create .env.local with SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET
 *   2. Run: pnpm shopify:auth
 *   3. Authorize in browser
 *   4. Token saved to .env.local automatically
 *
 * Environment Variables Required:
 *   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   SHOPIFY_CLIENT_ID=your-client-id
 *   SHOPIFY_CLIENT_SECRET=your-client-secret
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });
import http from 'node:http';
import { URL } from 'node:url';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// =============================================================================
// Configuration
// =============================================================================

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = 'read_products,write_products';

interface Config {
  storeDomain: string;
  clientId: string;
  clientSecret: string;
}

function getConfig(): Config {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  const missing: string[] = [];
  if (!storeDomain) missing.push('SHOPIFY_STORE_DOMAIN');
  if (!clientId) missing.push('SHOPIFY_CLIENT_ID');
  if (!clientSecret) missing.push('SHOPIFY_CLIENT_SECRET');

  if (missing.length > 0) {
    console.error('\n❌ Missing environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error('\nCreate .env.local with:');
    console.error('   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com');
    console.error('   SHOPIFY_CLIENT_ID=your-client-id');
    console.error('   SHOPIFY_CLIENT_SECRET=your-client-secret');
    console.error('\nGet these from Shopify Partner Dashboard → Apps → Your App → Client credentials');
    process.exit(1);
  }

  return {
    storeDomain: storeDomain!.replace(/^https?:\/\//, ''),
    clientId: clientId!,
    clientSecret: clientSecret!,
  };
}

// =============================================================================
// OAuth Helpers
// =============================================================================

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function buildAuthUrl(config: Config, nonce: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: nonce,
  });

  return `https://${config.storeDomain}/admin/oauth/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(
  config: Config,
  code: string
): Promise<{ access_token: string; scope: string }> {
  const url = `https://${config.storeDomain}/admin/oauth/access_token`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${text}`);
  }

  return response.json();
}

function saveTokenToEnv(token: string): void {
  const envPath = path.join(process.cwd(), '.env.local');

  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
  }

  // Check if SHOPIFY_ADMIN_ACCESS_TOKEN already exists
  if (content.includes('SHOPIFY_ADMIN_ACCESS_TOKEN=')) {
    // Replace existing token
    content = content.replace(
      /SHOPIFY_ADMIN_ACCESS_TOKEN=.*/,
      `SHOPIFY_ADMIN_ACCESS_TOKEN=${token}`
    );
  } else {
    // Add new token
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += `SHOPIFY_ADMIN_ACCESS_TOKEN=${token}\n`;
  }

  fs.writeFileSync(envPath, content);
}

function openBrowser(url: string): void {
  const platform = process.platform;
  let command: string;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log('\n⚠️  Could not open browser automatically.');
      console.log('   Please open this URL manually:\n');
      console.log(`   ${url}\n`);
    }
  });
}

// =============================================================================
// HTTP Server
// =============================================================================

function startServer(config: Config, nonce: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${PORT}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        // Verify state to prevent CSRF
        if (state !== nonce) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Error: Invalid state parameter</h1><p>Please try again.</p>');
          reject(new Error('Invalid state parameter - possible CSRF attack'));
          server.close();
          return;
        }

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<h1>Error: ${error}</h1><p>${errorDescription || 'Authorization failed'}</p>`);
          reject(new Error(`OAuth error: ${error} - ${errorDescription}`));
          server.close();
          return;
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Error: No authorization code received</h1>');
          reject(new Error('No authorization code received'));
          server.close();
          return;
        }

        // Exchange code for token
        try {
          console.log('\n🔄 Exchanging authorization code for access token...');
          const tokenData = await exchangeCodeForToken(config, code);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authorization Successful</title>
                <style>
                  body { font-family: system-ui, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
                  h1 { color: #16a34a; }
                  p { color: #666; }
                  code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1>✅ Authorization Successful!</h1>
                <p>Access token has been saved to <code>.env.local</code></p>
                <p>You can close this window and return to the terminal.</p>
                <p><strong>Scopes granted:</strong> ${tokenData.scope}</p>
              </body>
            </html>
          `);

          server.close();
          resolve(tokenData.access_token);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<h1>Error exchanging token</h1><p>${(err as Error).message}</p>`);
          reject(err);
          server.close();
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });

    server.listen(PORT, () => {
      console.log(`\n🌐 OAuth callback server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        reject(new Error(`Port ${PORT} is already in use. Please close other applications using this port.`));
      } else {
        reject(err);
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out after 5 minutes'));
    }, 5 * 60 * 1000);
  });
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Shopify OAuth Authentication');
  console.log('═══════════════════════════════════════════════════════════════');

  const config = getConfig();
  const nonce = generateNonce();

  console.log(`\n🏪 Store: ${config.storeDomain}`);
  console.log(`📋 Scopes: ${SCOPES}`);

  // Check if app redirect URL is configured
  console.log('\n⚠️  Make sure your app has this redirect URL configured:');
  console.log(`   ${REDIRECT_URI}`);
  console.log('\n   (Shopify Partner Dashboard → Apps → Your App → App setup → URLs)');

  // Build auth URL and start server
  const authUrl = buildAuthUrl(config, nonce);

  // Start server first
  const tokenPromise = startServer(config, nonce);

  // Then open browser
  console.log('\n🔗 Opening browser for authorization...');
  openBrowser(authUrl);

  console.log('\n⏳ Waiting for authorization...');
  console.log('   (Complete the authorization in your browser)');

  try {
    const token = await tokenPromise;

    // Save token to .env.local
    saveTokenToEnv(token);

    console.log('\n✅ Success! Access token saved to .env.local');
    console.log('\n   You can now run: pnpm seed:products');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Authorization failed:', (error as Error).message);
    process.exit(1);
  }
}

main();
