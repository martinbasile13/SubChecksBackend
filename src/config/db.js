import { createPool } from "mysql2/promise";
import { config } from "dotenv";

config();

// Parsear la URL de Railway si existe
const RAILWAY_DB_URL = process.env.DATABASE_URL;
let dbConfig;

if (RAILWAY_DB_URL) {
    // Si estamos en Railway, usar la URL de conexión
    const matches = RAILWAY_DB_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    dbConfig = {
        user: matches[1],
        password: matches[2],
        host: matches[3],
        port: parseInt(matches[4]),
        database: matches[5],
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    // Configuración local
    dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };
}

// Configuraciones adicionales
const poolConfig = {
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('Configuración de base de datos:', {
    host: poolConfig.host,
    database: poolConfig.database,
    port: poolConfig.port
});

const db = createPool(poolConfig);

console.log('✅ Base de datos configurada');

// Verificar conexión
try {
    const connection = await db.getConnection();
    console.log('Conexión exitosa a la base de datos');
    connection.release();
} catch (error) {
    console.error('Error al conectar a la base de datos:', error);
}

export default db;

