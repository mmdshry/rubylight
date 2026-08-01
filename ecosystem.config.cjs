module.exports = {
  apps: [
    {
      name: 'Rubylight',
      script: 'server/tala-proxy.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        PORT: 3009,
        HOST: '127.0.0.1',
        NODE_ENV: 'production',
      },
    },
  ],
}
