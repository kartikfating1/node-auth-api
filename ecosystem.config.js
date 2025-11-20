module.exports = {
    apps: [
      {
        name: "identityService",
        script: "src/index.js",
        env: {
          NODE_ENV: "staging", // Set the environment to staging
          PORT: 3020, // Port for staging
          DB_HOST: "localhost",
          DB_USER: "root",
          DB_PASSWORD: "Caxsol@123", // Use the staging password
        },
        env_dev: {
          NODE_ENV: "dev", // Set the environment to development
          PORT: 3020, // Port for development
          DB_HOST: "localhost",
          DB_USER: "root",
          DB_PASSWORD: "dev@1234", // Use the development password
        },
        env_production: {
          NODE_ENV: "production", // Set the environment to production
          PORT: 3020, // Port for production
          DB_HOST: "localhost",
          DB_USER: "root",
          DB_PASSWORD: "prod@1234", // Use the production password
        },
      },
    ],
  };
  
