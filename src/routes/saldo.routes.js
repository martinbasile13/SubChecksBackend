import { Router } from "express";
import { 
    // Saldos
    procesarSaldo,
    obtenerSaldos,
    obtenerSaldoPorId,
    actualizarSaldo,
    eliminarSaldo,
    eliminarTodos,
    // Historial
    obtenerHistorial,
    obtenerHistorialPorId,
    actualizarHistorial,
    eliminarHistorialPorId,
    eliminarTodoHistorial,
    // Spotify
    eliminarPagoSpotify
} from "../controllers/saldo.controller.js";

const router = Router();

console.log("🚦 Configurando rutas de saldos...");

// Rutas para Saldos
router.post("/process-saldos", procesarSaldo);                    // Crear nuevo saldo
router.get("/saldos", obtenerSaldos);                     // Obtener todos los saldos
router.get("/saldos/:id", obtenerSaldoPorId);            // Obtener un saldo específico
router.patch("/saldos/:id", actualizarSaldo);            // Actualizar un saldo
router.delete("/saldos/:id", eliminarSaldo);             // Eliminar un saldo
router.delete("/saldos", eliminarTodos);                 // Eliminar todos los saldos

// Rutas para Historial de Pagos
router.get("/historial", obtenerHistorial);               // Obtener todo el historial
router.get("/historial/:id", obtenerHistorialPorId);     // Obtener un registro específico
router.patch("/historial/:id", actualizarHistorial);     // Actualizar un registro
router.delete("/historial/:id", eliminarHistorialPorId); // Eliminar un registro
router.delete("/historial", eliminarTodoHistorial);      // Eliminar todo el historial

// Rutas para Spotify
router.delete("/pagospotify/:id", (req, res, next) => {
    console.log('Recibida petición DELETE para pagospotify:', req.params.id);
    next();
}, eliminarPagoSpotify);     // Eliminar un pago de Spotify

console.log("✅ Rutas de saldos configuradas");

export default router; 