// server.js
const corsAnywhere = require('cors-anywhere');

const host = process.env.HOST || '0.0.0.0'; 
const port = process.env.PORT || 3000; 

corsAnywhere.createServer({
  originWhitelist: [],  
  requireHeader: [], 
  removeHeaders: [], 
}).listen(port, host, () => {
  console.log(`CORS Anywhere server is running on http://${host}:${port}`);
});