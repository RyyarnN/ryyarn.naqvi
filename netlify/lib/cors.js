// The challenge page is also embedded in the Crescent Jewelers Shopify store, so the
// API answers cross-origin requests. Both endpoints are public and use no cookies.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export const preflight = () => new Response(null, { status: 204, headers: CORS_HEADERS });
