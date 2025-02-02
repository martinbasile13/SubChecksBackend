import express from "express";
import cors from "cors";
import saldoRoutes from "./routes/saldo.routes.js";
import spotifyRoutes from "./routes/spotify.routes.js";

const app = express();

console.log("🚀 Iniciando configuración del servidor...");

// Primero configurar los middleware
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({
        mensaje: "API funcionando correctamente"
    });
});

// Luego configurar las rutas
app.use("/api", saldoRoutes);
app.use("/api", spotifyRoutes);

// Cambiar la ruta POST a un path más específico
app.post('/api/process-saldo', (req, res) => {
    const { monto, remitente } = req.body;
    
    // Agregar validación de datos
    if (!monto || !remitente) {
        return res.status(400).json({ 
            error: 'Monto y remitente son requeridos' 
        });
    }
    
    // Convertir el monto a float
    const montoFloat = parseFloat(monto.replace('$', '').replace(/\./g, '').replace(',', '.'));
    
    // Validar que el monto sea un número válido
    if (isNaN(montoFloat)) {
        return res.status(400).json({ 
            error: 'El monto proporcionado no es válido' 
        });
    }
    
    console.log('Datos recibidos:');
    console.log('Monto (original):', monto);
    console.log('Monto (float):', montoFloat);
    console.log('Remitente:', remitente);
    
    res.json({ 
        message: 'Datos recibidos correctamente',
        montoFloat: montoFloat
    });
});

console.log("✅ Servidor configurado correctamente");

export default app;


