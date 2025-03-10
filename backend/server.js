const corsAnywhere = require('cors-anywhere');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3001;

corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins (keep empty for local dev)
  requireHeader: ['origin', 'x-requested-with'], // Recommended basic security
  removeHeaders: ['cookie', 'cookie2'], // Remove sensitive headers
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: true // Adds X-Forwarded headers
  }
}).listen(port, host, () => {
  console.log(`CORS Anywhere server running on http://${host}:${port}`);
});