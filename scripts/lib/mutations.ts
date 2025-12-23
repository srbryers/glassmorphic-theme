/**
 * GraphQL queries and mutations for Shopify Admin API
 */

/**
 * Create or update a product with options and variants
 * Uses synchronous mode for immediate response
 */
export const PRODUCT_SET_MUTATION = `
  mutation ProductSet($synchronous: Boolean!, $input: ProductSetInput!) {
    productSet(synchronous: $synchronous, input: $input) {
      product {
        id
        handle
        title
        status
        options {
          id
          name
          values
        }
        variants(first: 150) {
          nodes {
            id
            title
            price
            sku
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Delete a product by ID
 */
export const PRODUCT_DELETE_MUTATION = `
  mutation ProductDelete($id: ID!) {
    productDelete(input: { id: $id }) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Fetch a product by handle
 */
export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
    }
  }
`;

/**
 * Fetch all products (paginated)
 */
export const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        id
        handle
        title
        status
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
