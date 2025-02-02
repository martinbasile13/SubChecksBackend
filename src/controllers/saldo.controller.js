import Saldo from "../models/saldo.model.js";
import db from "../config/db.js";

// CONTROLADORES PARA SALDOS
export const procesarSaldo = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        
        const { monto, remitente } = req.body;
        
        if (!monto || !remitente) {
            console.log('Error: datos incompletos:', { monto, remitente });
            return res.status(400).json({ 
                error: 'Monto y remitente son requeridos',
                received: req.body 
            });
        }

        // Convertir el monto si viene como string con formato
        let montoNumerico = monto;
        if (typeof monto === 'string') {
            montoNumerico = parseFloat(monto.replace('$', '').replace(/\./g, '').replace(',', '.'));
        }

        if (isNaN(montoNumerico)) {
            console.log('Error: monto no válido:', monto);
            return res.status(400).json({ 
                error: 'El monto no es válido',
                received: monto 
            });
        }

        // 1. Verificar si el remitente existe
        const [existente] = await db.query(
            "SELECT id, monto FROM saldo WHERE remitente = ?",
            [remitente]
        );

        let saldoId;
        let nuevoMonto = montoNumerico;

        if (existente && existente.length > 0) {
            // Si existe, actualizar el saldo
            const montoAnterior = parseFloat(existente[0].monto);
            nuevoMonto = montoAnterior + montoNumerico;
            
            await db.query(
                "UPDATE saldo SET monto = ? WHERE remitente = ?",
                [nuevoMonto, remitente]
            );
            
            saldoId = existente[0].id;
            
            console.log('Saldo actualizado:', {
                remitente,
                montoAnterior,
                montoNuevo: nuevoMonto
            });
        } else {
            // Si no existe, crear nuevo registro
            const [result] = await db.query(
                "INSERT INTO saldo (monto, remitente) VALUES (?, ?)",
                [montoNumerico, remitente]
            );
            
            saldoId = result.insertId;
            
            console.log('Nuevo saldo creado:', {
                id: saldoId,
                monto: montoNumerico,
                remitente
            });
        }

        // 2. Guardar en historial_pagos
        const [historialResult] = await db.query(
            "INSERT INTO historial_pagos (remitente, monto) VALUES (?, ?)",
            [remitente, montoNumerico]
        );

        console.log('Registro guardado en historial:', {
            id: historialResult.insertId,
            remitente,
            monto: montoNumerico
        });

        res.json({ 
            message: 'Saldo procesado correctamente',
            saldo: {
                id: saldoId,
                monto: nuevoMonto,
                remitente
            },
            historial: {
                id: historialResult.insertId,
                monto: montoNumerico,
                remitente
            }
        });
    } catch (error) {
        console.error('Error al procesar el saldo:', error);
        res.status(500).json({ 
            error: 'Error al procesar el saldo',
            details: error.message
        });
    }
};

export const obtenerSaldos = async (req, res) => {
    try {
        const [saldos] = await db.query(
            "SELECT id, monto, remitente FROM saldo ORDER BY id DESC"
        );
        res.json(saldos);
    } catch (error) {
        console.error('Error al obtener saldos:', error);
        res.status(500).json({ error: 'Error al obtener los saldos' });
    }
};

export const obtenerSaldoPorId = async (req, res) => {
    try {
        const saldo = await Saldo.obtenerSaldoPorId(req.params.id);
        if (!saldo) return res.status(404).json({ error: 'Saldo no encontrado' });
        res.json(saldo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarSaldo = async (req, res) => {
    try {
        const { monto, remitente } = req.body;
        const actualizado = await Saldo.actualizarSaldo(req.params.id, monto, remitente);
        if (!actualizado) return res.status(404).json({ error: 'Saldo no encontrado' });
        res.json({ message: 'Saldo actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarSaldo = async (req, res) => {
    try {
        const eliminado = await Saldo.eliminarSaldo(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Saldo no encontrado' });
        res.json({ message: 'Saldo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarTodos = async (req, res) => {
    try {
        await Saldo.eliminarTodos();
        res.json({ message: 'Todos los saldos han sido eliminados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CONTROLADORES PARA HISTORIAL
export const obtenerHistorial = async (req, res) => {
    try {
        const [historial] = await db.query(
            "SELECT id, remitente, monto, fecha_creacion FROM historial_pagos ORDER BY fecha_creacion DESC"
        );
        res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener el historial' });
    }
};

export const obtenerHistorialPorId = async (req, res) => {
    try {
        const registro = await Saldo.obtenerHistorialPorId(req.params.id);
        if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json(registro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarHistorial = async (req, res) => {
    try {
        const { monto, remitente } = req.body;
        const actualizado = await Saldo.actualizarHistorial(req.params.id, monto, remitente);
        if (!actualizado) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json({ message: 'Registro actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarHistorialPorId = async (req, res) => {
    try {
        const eliminado = await Saldo.eliminarHistorialPorId(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Registro no encontrado' });
        res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarTodoHistorial = async (req, res) => {
    try {
        await Saldo.eliminarTodoHistorial();
        res.json({ message: 'Todo el historial ha sido eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CONTROLADORES PARA SPOTIFY
export const procesarPagoSpotify = async (req, res) => {
    try {
        const { monto } = req.body;
        if (!monto) return res.status(400).json({ error: 'Monto es requerido' });
        const resultado = await Saldo.procesarPagoSpotify(monto);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerPagosSpotify = async (req, res) => {
    try {
        const pagos = await Saldo.obtenerPagosSpotify();
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarPagoSpotify = async (req, res) => {
    try {
        const { monto } = req.body;
        const actualizado = await Saldo.actualizarPagoSpotify(req.params.id, monto);
        if (!actualizado) return res.status(404).json({ error: 'Pago no encontrado' });
        res.json({ message: 'Pago actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarPagoSpotify = async (req, res) => {
    try {
        console.log('Iniciando eliminación de pago Spotify:', req.params.id);
        
        const resultado = await Saldo.eliminarPagoSpotify(req.params.id);
        
        if (!resultado.success) {
            return res.status(404).json({
                error: 'Pago no encontrado'
            });
        }

        res.json({ 
            message: 'Pago eliminado correctamente y saldos actualizados',
            id: req.params.id,
            detalles: {
                montoDistribuido: resultado.montoDistribuido,
                montoPorRemitente: resultado.montoPorRemitente,
                cantidadRemitentes: resultado.cantidadRemitentes
            }
        });
    } catch (error) {
        console.error('Error al eliminar pago:', error);
        res.status(500).json({ 
            error: 'Error al eliminar el pago',
            details: error.message
        });
    }
};

export const eliminarTodosPagosSpotify = async (req, res) => {
    try {
        const eliminado = await Saldo.eliminarTodosPagosSpotify();
        
        res.json({ 
            message: 'Todos los pagos eliminados correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar todos los pagos:', error);
        res.status(500).json({ 
            error: 'Error al eliminar los pagos' 
        });
    }
}; 