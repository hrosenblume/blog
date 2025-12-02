/**
 * PM2 Ecosystem Configuration
 * 
 * Manages both production and staging environments on the Droplet.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js        # Start all apps
 *   pm2 restart blog-prod                # Restart production
 *   pm2 restart blog-staging             # Restart staging
 *   pm2 logs blog-prod                   # View production logs
 *   pm2 save                             # Save current process list
 */

module.exports = {
  apps: [
    {
      name: 'blog',
      cwd: '/var/www/blog',
      script: 'node',
      args: '.next/standalone/server.js',
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
      script: 'node',
      args: '.next/standalone/server.js',
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

