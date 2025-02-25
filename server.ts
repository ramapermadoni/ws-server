import WebSocket, { Server } from "ws";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

let clients: WebSocket[] = [];

// Menangani koneksi WebSocket
wss.on("connection", (ws: WebSocket) => {
  console.log("Koneksi WebSocket baru");
  clients.push(ws);

  ws.on("message", (message: WebSocket.Data) => {
    console.log("Pesan diterima:", message);
    const messageString = message.toString();

    // Mengirim pesan kembali ke semua klien
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Pesan diterima: ${messageString}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("Koneksi ditutup");
    clients = clients.filter((client) => client !== ws);
  });
});

// Endpoint API untuk mengirim pesan
app.use(express.json());
app.post("/api/send-message", (req, res) => {
  const { message } = req.body;
  console.log("Pesan dari API:", message);

  // Kirim pesan ke semua klien
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  res.json({ status: "success", message: "Pesan terkirim" });
});

// Menjalankan server di port 8080
server.listen(8080, () => {
  console.log("Server WebSocket berjalan di ws://localhost:8080");
});
