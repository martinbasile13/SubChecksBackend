import db from "../config/db.js";

const Saldo = {
    crearSaldo: async (monto, remitente) => {
        try {
            console.log('Intentando crear saldo:', { monto, remitente });
            
            // Primero verificamos si el remitente ya existe
            const [existente] = await db.query(
                "SELECT id, monto FROM saldo WHERE remitente = ?",
                [remitente]
            );

            if (existente && existente.length > 0) {
                // Convertimos el monto existente a número
                const montoAnterior = parseFloat(existente[0].monto);
                // Sumamos los montos
                const nuevoMonto = montoAnterior + parseFloat(monto);
                
                const [result] = await db.query(
                    "UPDATE saldo SET monto = ? WHERE remitente = ?",
                    [nuevoMonto, remitente]
                );
                
                console.log('Saldo actualizado:', {
                    remitente,
                    montoAnterior,
                    montoNuevo: nuevoMonto
                });
                
                return {
                    id: existente[0].id,
                    monto: nuevoMonto,
                    remitente
                };
            } else {
                // Si no existe, creamos un nuevo registro
                const [result] = await db.query(
                    "INSERT INTO saldo (monto, remitente) VALUES (?, ?)",
                    [parseFloat(monto), remitente]
                );
                
                console.log('Nuevo saldo creado:', {
                    id: result.insertId,
                    monto,
                    remitente
                });
                
                return {
                    id: result.insertId,
                    monto: parseFloat(monto),
                    remitente
                };
            }
        } catch (error) {
            console.error('Error en crearSaldo:', error);
            throw error;
        }
    },
    
    obtenerSaldos: async () => {
        try {
            const [rows] = await db.query(
                "SELECT id, monto, remitente FROM saldo ORDER BY id DESC"
            );
            return rows;
        } catch (error) {
            console.error('Error en obtenerSaldos:', error);
            throw error;
        }
    },

    obtenerHistorialPagos: async () => {
        try {
            const [rows] = await db.query(
                "SELECT id, remitente, monto, fecha_creacion FROM historial_pagos ORDER BY fecha_creacion DESC"
            );
            return rows;
        } catch (error) {
            console.error('Error en obtenerHistorialPagos:', error);
            throw error;
        }
    },

    obtenerHistorialPorId: async (id) => {
        try {
            const [rows] = await db.query(
                "SELECT id, remitente, monto, fecha_creacion FROM historial_pagos WHERE id = ?",
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error en obtenerHistorialPorId:', error);
            throw error;
        }
    },

    eliminarSaldo: async (id) => {
        try {
            const [result] = await db.query(
                "DELETE FROM saldo WHERE id = ?", 
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en eliminarSaldo:', error);
            throw error;
        }
    },

    eliminarTodos: async () => {
        try {
            const [result] = await db.query("DELETE FROM saldo");
            return result.affectedRows;
        } catch (error) {
            console.error('Error en eliminarTodos:', error);
            throw error;
        }
    },

    eliminarHistorialPorId: async (id) => {
        try {
            // Primero obtenemos el registro del historial para saber el monto y remitente
            const [historial] = await db.query(
                "SELECT remitente, monto FROM historial_pagos WHERE id = ?",
                [id]
            );

            if (!historial || historial.length === 0) {
                return false;
            }

            const { remitente, monto } = historial[0];

            // Actualizamos el saldo del remitente restando el monto
            await db.query(
                "UPDATE saldo SET monto = monto - ? WHERE remitente = ?",
                [monto, remitente]
            );

            // Eliminamos el registro del historial
            const [result] = await db.query(
                "DELETE FROM historial_pagos WHERE id = ?",
                [id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en eliminarHistorialPorId:', error);
            throw error;
        }
    },

    obtenerSaldoPorId: async (id) => {
        try {
            const [rows] = await db.query(
                "SELECT id, monto, remitente FROM saldo WHERE id = ?",
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error en obtenerSaldoPorId:', error);
            throw error;
        }
    },

    eliminarPagoSpotify: async (id) => {
        try {
            // 1. Primero obtenemos el pago de Spotify que se va a eliminar
            const [pagoSpotify] = await db.query(
                "SELECT * FROM pago_spotify WHERE id = ?",
                [id]
            );

            console.log('1. Pago Spotify encontrado:', pagoSpotify[0]);

            if (!pagoSpotify || pagoSpotify.length === 0) {
                return {
                    success: false,
                    message: 'Pago no encontrado'
                };
            }

            const montoADistribuir = parseFloat(pagoSpotify[0].pagospotify);
            console.log('2. Monto a distribuir:', montoADistribuir);

            // 2. Obtenemos todos los remitentes
            const [remitentes] = await db.query(
                "SELECT * FROM saldo"
            );

            console.log('3. Remitentes encontrados:', remitentes);

            if (remitentes.length > 0) {
                // 3. Calculamos el monto a sumar por cada remitente
                const montoPorRemitente = montoADistribuir / remitentes.length;
                console.log('4. Monto por remitente:', montoPorRemitente);

                // 4. Actualizamos el saldo de cada remitente sumando su parte
                for (const remitente of remitentes) {
                    // Verificamos el saldo antes de la actualización
                    const [saldoAntes] = await db.query(
                        "SELECT monto FROM saldo WHERE remitente = ?",
                        [remitente.remitente]
                    );
                    console.log('5. Saldo antes de actualizar:', {
                        remitente: remitente.remitente,
                        montoActual: saldoAntes[0].monto
                    });

                    // Realizamos la actualización
                    await db.query(
                        "UPDATE saldo SET monto = monto + ? WHERE remitente = ?",
                        [montoPorRemitente, remitente.remitente]
                    );

                    // Verificamos el saldo después de la actualización
                    const [saldoDespues] = await db.query(
                        "SELECT monto FROM saldo WHERE remitente = ?",
                        [remitente.remitente]
                    );
                    console.log('6. Saldo después de actualizar:', {
                        remitente: remitente.remitente,
                        montoNuevo: saldoDespues[0].monto
                    });
                }
            }

            // 5. Eliminamos el pago de Spotify
            const [result] = await db.query(
                "DELETE FROM pago_spotify WHERE id = ?",
                [id]
            );

            console.log('7. Resultado final:', {
                pagoEliminado: result.affectedRows > 0,
                montoDistribuido: montoADistribuir,
                montoPorRemitente: remitentes.length > 0 ? montoADistribuir / remitentes.length : 0,
                cantidadRemitentes: remitentes.length
            });

            return {
                success: result.affectedRows > 0,
                montoDistribuido: montoADistribuir,
                montoPorRemitente: remitentes.length > 0 ? montoADistribuir / remitentes.length : 0,
                cantidadRemitentes: remitentes.length
            };
        } catch (error) {
            console.error('Error en eliminarPagoSpotify:', error);
            throw error;
        }
    }
};

export default Saldo; 