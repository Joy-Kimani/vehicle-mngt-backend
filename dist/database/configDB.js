import sql from 'mssql';
import dotenv from 'dotenv';
import assert from 'assert';
dotenv.config();
const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_DATABASE } = process.env;
assert(DB_USER, 'SQL_USER is not defined in environment variables');
assert(DB_PASSWORD, 'SQL_PASSWORD is not defined in environment variables');
assert(DB_SERVER, 'SQL_SERVER is not defined in environment variables');
assert(DB_PORT, 'SQL_PORT is not defined in environment variables');
assert(DB_DATABASE, 'SQL_DATABASE is not defined in environment variables');
//Database Configuration
export const Config = {
    sqlConfig: {
        user: DB_USER,
        password: DB_PASSWORD,
        server: DB_SERVER || 'localhost',
        port: parseInt(DB_PORT || '1433'),
        database: DB_DATABASE,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        },
    },
    //azure sql config
    azureConfig: {
        user: DB_USER,
        password: DB_PASSWORD,
        server: DB_SERVER,
        database: DB_DATABASE,
        port: parseInt(DB_PORT || '1433'),
        connectionTimeout: 30000,
        requestTimeout: 30000,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true,
            trustServerCertificate: false,
            enableArithAbort: true,
            connectTimeout: 30000,
            requestTimeout: 30000
        }
    }
};
let globalPool = null;
const initDatabaseConnection = async () => {
    if (globalPool && globalPool.connected) {
        console.log('Using existing database connection');
        return globalPool;
    }
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const config = isProduction ? Config.azureConfig : Config.sqlConfig;
        console.log(`Connecting to database with server: ${config.server}`);
        console.log(`Using ${isProduction ? 'Azure' : 'Local'} configuration`);
        globalPool = await sql.connect(config);
        console.log('Connected to SQL SERVER Database');
        return globalPool;
    }
    catch (error) {
        console.error('Database Connection Failed! ', error);
        // Log additional debugging information
        console.error('Environment variables:');
        console.error(`DB_SERVER: ${DB_SERVER}`);
        console.error(`DB_DATABASE: ${DB_DATABASE}`);
        console.error(`DB_USER: ${DB_USER}`);
        console.error(`NODE_ENV: ${process.env.NODE_ENV}`);
        // console.error(`WEBSITE_SITE_NAME: ${process.env.WEBSITE_SITE_NAME}`);
        throw error;
    }
};
export const getDbPool = () => {
    if (!globalPool || !globalPool.connected) {
        throw new Error('Database not connected. Call initDatabaseConnection() first.');
    }
    return globalPool;
};
export default initDatabaseConnection;
