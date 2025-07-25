const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/datashop-proxy',
    createProxyMiddleware({
      target: 'https://pslc-qa.andrew.cmu.edu/log/server',
      changeOrigin: true,
      pathRewrite: {
        '^/datashop-proxy': ''
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Request:', req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[Proxy] Response:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('[Proxy] Error:', err);
      }
    })
  );
};