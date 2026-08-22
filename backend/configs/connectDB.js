import dns from "node:dns";
import mongoose from "mongoose";

export function resolveDnsServers(rawDnsServers = process.env.DNS_SERVERS) {
  if (!rawDnsServers) {
    return ["8.8.8.8", "8.8.4.4"];
  }

  return rawDnsServers
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
}

export function configureMongoDns() {
  const dnsServers = resolveDnsServers(process.env.DNS_SERVERS);

  try {
    const activeDnsServers = dns.getServers();
    const isAlreadyConfigured = dnsServers.some((server) =>
      activeDnsServers.includes(server),
    );

    if (!isAlreadyConfigured) {
      dns.setServers(dnsServers);
      console.log(`[INFO] MongoDB DNS configured to: ${dnsServers.join(", ")}`);
    }
  } catch (error) {
    console.warn(
      "[WARN] Could not override DNS servers for MongoDB SRV resolution:",
      error.message,
    );
  }
}

export function buildConnectionString(connectionString, password) {
  const resolvedConnectionString =
    connectionString ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_CONNECTION_STRING;

  if (!resolvedConnectionString) {
    const missingUriError = new Error(
      "Missing DATABASE_CONNECTION_STRING or MONGODB_URI environment variable.",
    );
    missingUriError.code = "MISSING_DATABASE_URI";
    throw missingUriError;
  }

  const configuredPassword =
    password || process.env.DATABASE_PASSWORD || process.env.MONGODB_PASSWORD;

  if (
    resolvedConnectionString.includes("<db_password>") ||
    resolvedConnectionString.includes("<password>")
  ) {
    if (!configuredPassword) {
      const missingPasswordError = new Error(
        "Database password placeholder detected, but DATABASE_PASSWORD or MONGODB_PASSWORD is missing.",
      );
      missingPasswordError.code = "MISSING_DATABASE_PASSWORD";
      throw missingPasswordError;
    }

    return resolvedConnectionString.replace(
      /<db_password>|<password>/gi,
      configuredPassword,
    );
  }

  return resolvedConnectionString;
}

export default async function connectDB() {
  try {
    configureMongoDns();

    const connectionString = buildConnectionString(
      process.env.DATABASE_CONNECTION_STRING || process.env.MONGODB_URI,
      process.env.DATABASE_PASSWORD || process.env.MONGODB_PASSWORD,
    );

    const connection = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });

    console.log(
      `[SUCCESS] DB connected successfully: ${connection.connection.host}`,
    );

    return connection;
  } catch (error) {
    console.error("[FAILED] DB connection failed:", error.message);
    if (
      error.code === "MISSING_DATABASE_URI" ||
      error.code === "MISSING_DATABASE_PASSWORD"
    ) {
      console.error(
        "[FIX] Set DATABASE_CONNECTION_STRING (or MONGODB_URI) and DATABASE_PASSWORD in the active .env file.",
      );
    }
    return null;
  }
}