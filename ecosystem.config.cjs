module.exports = {
  apps: [
    {
      name: 'lms-api',
      script: 'dist/app/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'lms-worker',
      script: 'dist/app/worker.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '350M',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
