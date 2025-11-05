import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("Bot-Verifizierung aktiv ✅");
});

app.get("/verify", (req, res) => {
  const { id } = req.query;
  res.send(`Verifizierung abgeschlossen für User ${id}`);
});

app.listen(3000, () => console.log("Server läuft auf Port 3000"));
