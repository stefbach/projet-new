// PM2 Configuration for Tibok Medical Evaluation
module.exports = {
  apps: [
    {
      name: 'tibok-medical-evaluation',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=tibok-medical-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ]
}
