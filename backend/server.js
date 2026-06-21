const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const app = require("./src/app");
const seedAccounts = require("./src/seed/seedAccounts");

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "Gym";
const MAX_PORT_RETRIES = 10;

const listenWithRetry = (initialPort) =>
  new Promise((resolve, reject) => {
    let retries = 0;
    let currentPort = Number(initialPort);

    const tryListen = () => {
      const server = app
        .listen(currentPort, () => {
          resolve({ server, port: currentPort });
        })
        .on("error", (error) => {
          if (error.code === "EADDRINUSE" && retries < MAX_PORT_RETRIES) {
            retries += 1;
            currentPort += 1;
            console.warn(
              `Port in use. Retrying on port ${currentPort} (${retries}/${MAX_PORT_RETRIES})...`
            );
            tryListen();
            return;
          }

          reject(error);
        });
    };

    tryListen();
  });

const startServer = async () => {
  try {
    process.env.MONGODB_DB_NAME = MONGODB_DB_NAME;
    await connectDB(MONGODB_URI);

    // Seed accounts if collection is empty
    await seedAccounts();

    const { port } = await listenWithRetry(PORT);
    console.log(`Gymkak API listening on port ${port} (db: ${MONGODB_DB_NAME})`);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

