import { Router } from "express";
import {
    procesarPagoSpotify,
    obtenerPagosSpotify,
    eliminarPagoSpotify,
    eliminarTodosPagosSpotify
} from "../controllers/pagoSpotify.controller.js";

const router = Router();

console.log("🎵 Configurando rutas de Spotify...");

// Cambiamos de /spotify a /pagospotify para mantener consistencia
router.post("/pagospotify", procesarPagoSpotify);
router.get("/pagospotify", obtenerPagosSpotify);
router.delete("/pagospotify/:id", eliminarPagoSpotify);
router.delete("/pagospotify", eliminarTodosPagosSpotify);

console.log("✅ Rutas de Spotify configuradas");

export default router; 