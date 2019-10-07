module.exports = {
  apps: [
    {
      name: 'igo2Api',
      script: './build/index.js',
      source_map_support: true,
      instances: 4,
      exec_mode: 'cluster',
      error_file: '/var/log/pm2/igo2Api.error.log',
      out_file: '/var/log/pm2/igo2Api.out.log',
      combine_logs: true,
      env: {
        NODE_ENV: 'prod'
      }
    }
  ]
};
