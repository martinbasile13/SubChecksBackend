import db from "../config/db.js";

export const procesarPagoSpotify = async (req, res) => {
    try {
        const { monto } = req.body;
        
        if (!monto) {
            return res.status(400).json({ error: 'El monto es requerido' });
        }

        const montoDecimal = typeof monto === 'number' ? monto : parseFloat(monto);

        // 1. Obtener remitentes
        const [remitentes] = await db.query("SELECT id, remitente, monto FROM saldo");
        
        if (remitentes.length === 0) {
            return res.status(400).json({ error: 'No hay remitentes para distribuir el pago' });
        }

        // 2. Calcular monto por remitente
        const montoIndividual = montoDecimal / remitentes.length;

        // 3. Actualizar saldos
        for (const remitente of remitentes) {
            const nuevoMonto = parseFloat(remitente.monto) - montoIndividual;
            await db.query(
                "UPDATE saldo SET monto = ? WHERE id = ?",
                [nuevoMonto, remitente.id]
            );
        }

        // 4. Guardar pago Spotify
        const [result] = await db.query(
            "INSERT INTO pago_spotify (pagospotify) VALUES (?)",
            [montoDecimal]
        );

        res.json({
            message: 'Pago procesado correctamente',
            id: result.insertId,
            monto: montoDecimal,
            montoPorRemitente: montoIndividual
        });
    } catch (error) {
        console.error('Error al procesar pago:', error);
        res.status(500).json({ error: error.message });
    }
};

export const obtenerPagosSpotify = async (req, res) => {
    try {
        const [pagos] = await db.query("SELECT * FROM pago_spotify ORDER BY id DESC");
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarPagoSpotify = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM pago_spotify WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        res.json({ message: 'Pago eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarTodosPagosSpotify = async (req, res) => {
    try {
        await db.query("DELETE FROM pago_spotify");
        res.json({ message: 'Todos los pagos han sido eliminados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 