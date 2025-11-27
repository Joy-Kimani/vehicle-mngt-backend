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
      user: DB_USER,
      password:DB_PASSWORD,
      server: DB_SERVER || 'localhost',
      port: parseInt(DB_PORT || '1433'),
      database: DB_DATABASE,
      pool:{
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      },
      options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
     }


let globalPool: sql.ConnectionPool | null = null;

const initDatabaseConnection = async () => {
    if (globalPool && globalPool.connected) {
        console.log('Using existing database connection');
        return globalPool;
    }

    try {
        globalPool = await sql.connect(Config);
        console.log('Connected to Database');
        return globalPool;
    } catch (error) {
        console.error('Database Connection Failed! ', error);
        throw error;
    }
};

export const getDbPool = (): sql.ConnectionPool => {
    if (!globalPool || !globalPool.connected) {
        throw new Error('Database not connected. Call initDatabaseConnection() first.');
    }
    return globalPool;
};

export default initDatabaseConnection;