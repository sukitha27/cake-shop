import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/send-confirmation", async (req, res) => {
    const { email, orderDetails } = req.body;

    if (!email || !orderDetails) {
      return res.status(400).json({ error: "Missing email or order details" });
    }

    const formatPrice = (price: number) => {
      if (orderDetails.currency === 'USD') {
        return `$${price.toFixed(2)}`;
      }
      return `Rs. ${(price * 300).toLocaleString()}`;
    };

    try {
      const { data, error } = await resend.emails.send({
        from: "Magnolia Bakery <onboarding@resend.dev>",
        to: [email],
        subject: "Order Confirmation - Magnolia Bakery",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #6B4E3D;">Thank you for your order!</h1>
            <p>Hi there,</p>
            <p>We've received your order and we're getting it ready for you. Here are your order details:</p>
            
            <div style="background-color: #F9F9F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <ul style="list-style: none; padding: 0;">
                ${orderDetails.items.map((item: any) => `
                  <li style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <span>${item.name} (x${item.quantity})</span>
                    <span style="font-weight: bold;">${formatPrice(item.price * item.quantity)}</span>
                  </li>
                `).join('')}
              </ul>
              <div style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 15px; color: #6B4E3D;">
                Total: ${formatPrice(orderDetails.total)}
              </div>
            </div>
            
            <p>We'll notify you when your treats are on their way!</p>
            <p style="color: #888; font-size: 0.8em; margin-top: 30px;">
              Magnolia Bakery - Sweetening your day, one treat at a time.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: "Failed to send email" });
      }

      res.status(200).json({ message: "Email sent successfully", data });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
