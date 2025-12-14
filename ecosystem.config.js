/**
 * PM2 Ecosystem Configuration
 * 
 * Uses server.js wrapper with cluster mode for zero-downtime deployments.
 * The server.js file loads .env.local via dotenv and signals PM2 when ready.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --only blog   # Start production
 *   pm2 reload blog                             # Zero-downtime restart
 *   pm2 logs blog                               # View logs
 *   pm2 save                                    # Save process list
 */

module.exports = {
  apps: [
    {
      name: 'blog',
      cwd: '/var/www/blog',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      // Restart if memory exceeds 500MB
      max_memory_restart: '500M',
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      // Merge logs into single file
      merge_logs: true,
      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'blog-staging',
      cwd: '/var/www/blog-staging',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      max_memory_restart: '500M',
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
