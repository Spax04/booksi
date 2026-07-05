export const getAllowedOrigins = () => {
  const allowedEnvOrigins = [
    'https://cdn.shopify.com',
    'https://cdn.shopify.com/',
    'https://admin.shopify.com',
    'https://admin.shopify.com/',
    process.env.FRONTEND_BASE_DOMAIN,
    `${process.env.FRONTEND_BASE_DOMAIN}/`,
    process.env.BACKEND_BASE_URL,
    `${process.env.BACKEND_BASE_URL}/`,
    process.env.ADMIN_BASE_DOMAIN,
    `${process.env.ADMIN_BASE_DOMAIN}/`,
    'https://www.managemate.io/'
  ];
  const allowedDevOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3333',
    'https://localhost:3333'
  ];

  let allowedOrigins;
  if (process.env.NODE_ENV == 'development') {
  allowedOrigins = [...allowedEnvOrigins, ...allowedDevOrigins];
  }
  if (process.env.NODE_ENV == 'staging') {
    allowedOrigins = [...allowedEnvOrigins, ...allowedDevOrigins];
  }
  if (process.env.NODE_ENV == 'production') {
    allowedOrigins = [...allowedEnvOrigins];
  }
  return allowedOrigins;
};


