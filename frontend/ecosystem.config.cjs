module.exports = {
  apps: [
    {
      name: "mom-frontend",
      script: "node_modules/vite/bin/vite.js",
      args: "--host",
      cwd: "./",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};