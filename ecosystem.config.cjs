module.exports = {
  apps: [
    {
      name: 'rubylight-tala-proxy',
      script: 'server/tala-proxy.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      env: {
        PORT: 3009,
        NODE_ENV: 'production',
      },
    },
  ],
}
