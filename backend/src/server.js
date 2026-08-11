const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');

const startServer = async () => {
  // Connect to database
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    
    // Start background jobs
    const reconciliationJob = require('./jobs/reconciliationJob');
    reconciliationJob.start();
  });
};

startServer();
