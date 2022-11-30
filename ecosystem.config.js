module.exports = {
  apps: [
    {
      name: 'igo2Api',
      script: './build/index.js',
      source_map_support: true,
      // interpreter: 'node@14.16.0',
      instances: 4,
      exec_mode: 'cluster',
      kill_timeout: 5000,
      listen_timeout: 5000,
      wait_ready: true,
      exp_backoff_restart_delay: 100,
      error_file: '/var/log/pm2/igo2Api.error.log',
      out_file: '/var/log/pm2/igo2Api.out.log',
      combine_logs: true,
      env: {
        NODE_ENV: 'prod'
      }
    }
  ]
};
