/**
 * PM2 Ecosystem Configuration
 * 
 * Uses a wrapper script (start.sh) to load environment variables from .env.local
 * before starting the Next.js application.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --only blog   # Start production
 *   pm2 restart blog                            # Restart
 *   pm2 logs blog                               # View logs
 *   pm2 save                                    # Save process list
 */

module.exports = {
  apps: [
    {
      name: 'blog',
      cwd: '/var/www/blog',
      script: './start.sh',
      interpreter: '/bin/bash',
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
      script: './start.sh',
      interpreter: '/bin/bash',
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
