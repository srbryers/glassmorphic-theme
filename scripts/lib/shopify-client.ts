/**
 * Shopify Admin GraphQL Client
 *
 * A lightweight GraphQL client for the Shopify Admin API with retry logic
 * and rate limit handling.
 */

const API_VERSION = '2025-01';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

interface ShopifyClientConfig {
  storeDomain: string;
  accessToken: string;
}

function getConfig(): ShopifyClientConfig {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!storeDomain) {
    throw new Error(
      'Missing SHOPIFY_STORE_DOMAIN environment variable.\n' +
        'Set it in .env.local: SHOPIFY_STORE_DOMAIN=your-store.myshopify.com'
    );
  }

  if (!accessToken) {
    throw new Error(
      'Missing SHOPIFY_ADMIN_ACCESS_TOKEN environment variable.\n' +
        'Create a custom app in Shopify Admin → Settings → Apps → Develop apps\n' +
        'Then set the token in .env.local: SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx'
    );
  }

  return { storeDomain, accessToken };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a GraphQL query against the Shopify Admin API
 */
export async function shopifyGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const { storeDomain, accessToken } = getConfig();

  // Ensure domain doesn't have protocol
  const cleanDomain = storeDomain.replace(/^https?:\/\//, '');
  const endpoint = `https://${cleanDomain}/admin/api/${API_VERSION}/graphql.json`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
        console.log(`   ⏳ Rate limited. Waiting ${retryAfter}s before retry...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      // Handle server errors with retry
      if (response.status >= 500) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`   ⚠️  Server error (${response.status}). Retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Parse response
      const json = (await response.json()) as GraphQLResponse<T>;

      // Check for throttle status and warn if low
      if (json.extensions?.cost?.throttleStatus) {
        const { currentlyAvailable, maximumAvailable } = json.extensions.cost.throttleStatus;
        if (currentlyAvailable < maximumAvailable * 0.1) {
          console.log(`   ⏳ Rate limit low (${currentlyAvailable}/${maximumAvailable}). Slowing down...`);
          await sleep(1000);
        }
      }

      return json;
    } catch (error) {
      lastError = error as Error;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`   ⚠️  Network error. Retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Failed after max retries');
}

/**
 * Helper to check if response has errors
 */
export function hasErrors<T>(response: GraphQLResponse<T>): boolean {
  return !!(response.errors?.length);
}

/**
 * Helper to format GraphQL errors for display
 */
export function formatErrors<T>(response: GraphQLResponse<T>): string {
  if (!response.errors?.length) return '';

  return response.errors
    .map((e) => {
      const path = e.path ? ` (at ${e.path.join('.')})` : '';
      return `  - ${e.message}${path}`;
    })
    .join('\n');
}
