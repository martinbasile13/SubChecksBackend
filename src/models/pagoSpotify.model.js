import db from "../config/db.js";

const PagoSpotify = {
    crearPago: async (monto) => {
        try {
            const [result] = await db.query(
                "INSERT INTO pago_spotify (pagospotify) VALUES (?)",
                [monto]
            );
            console.log('Nuevo pago Spotify creado:', { monto });
            return result.insertId;
        } catch (error) {
            console.error('Error en crearPago Spotify:', error);
            throw error;
        }
    },
    
    obtenerPagos: async () => {
        try {
            const [rows] = await db.query(
                "SELECT id, pagospotify, fecha FROM pago_spotify ORDER BY fecha DESC"
            );
            return rows;
        } catch (error) {
            console.error('Error en obtenerPagos Spotify:', error);
            throw error;
        }
    }
};

export default PagoSpotify; 