module.exports = {
  apps: [
    {
      name: 'vetcare',
      script: 'npm',
      args: 'run start',
      cwd: '/home/rodrigo/projects/vetcare',
      env: {
        NODE_ENV: 'production',
        PATH: process.env.PATH,
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
}
