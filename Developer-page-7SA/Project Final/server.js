// 📦 Importar dependencias necesarias
import express from 'express';          // Framework para crear el servidor web
import dotenv from 'dotenv';            // Para usar variables de entorno desde un archivo .env
import Stripe from 'stripe';            // SDK oficial de Stripe para trabajar con pagos

// 🔐 Cargar variables del archivo .env
dotenv.config();

// 🚀 Inicializar la app de Express
const app = express();

// 💳 Configurar Stripe con la API Key desde .env
const stripeGateway = new Stripe(process.env.stripe_api, {
  apiVersion: '2025-04-30.basil', // Versión de la API de Stripe
});

// 🌐 Dominio base que usará Stripe para redirigir (definido en .env)
const DOMAIN = process.env.DOMAIN;

// 📁 Hacer que la carpeta "public" sirva archivos estáticos (HTML, CSS, JS frontend)
app.use(express.static('public'));

// 🔄 Middleware para que Express pueda leer JSON en peticiones POST
app.use(express.json());

// 🌍 Ruta para mostrar el HTML principal
app.get("/", (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// ✅ Página de éxito después de un pago exitoso
app.get("/success", (req, res) => {
  res.sendFile('success.html', { root: 'public' });
});

// ❌ Página a la que se redirige si el pago es cancelado
app.get("/cancel", (req, res) => {
  res.sendFile('cancel.html', { root: 'public' });
});

// 📦 Ruta para iniciar el proceso de pago con Stripe
app.post("/stripe-checkout", async (req, res) => {
  try {
    // 🧾 Convertir productos recibidos desde el frontend al formato que Stripe necesita
    const lineItems = req.body.items.map((item) => {
      // 🎯 Convertir el precio de texto (ej. "$12.99") a número en centavos (1299)
      const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);

      return {
        price_data: {
          currency: 'usd',                // Moneda en USD
          product_data: {
            name: item.title,             // Nombre del producto
            images: [item.productImg],    // Imagen del producto
          },
          unit_amount: unitAmount,        // Precio en centavos
        },
        quantity: item.quantity,          // Cantidad de productos
      };
    });

    // 🧾 Crear una sesión de pago con Stripe
    const session = await stripeGateway.checkout.sessions.create({
      payment_method_types: ['card'],     // Métodos de pago aceptados
      mode: "payment",                    // Tipo de sesión (pago único)
      billing_address_collection: "required", // Solicitar dirección de facturación
      success_url: `${DOMAIN}/success`,   // Redirigir aquí si el pago fue exitoso
      cancel_url: `${DOMAIN}/cancel`,     // Redirigir aquí si el usuario cancela
      line_items: lineItems,              // Productos a pagar
    });

    // 🔁 Devolver la URL de Stripe para redirigir al usuario
    res.json({ url: session.url });
  } catch (error) {
    // ⚠️ En caso de error, devolver un mensaje de error
    console.error("Error al crear sesión de pago:", error.message);
    res.status(500).json({ error: "Fallo al crear la sesión de pago." });
  }
});

// ▶️ Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
