import fetch from "node-fetch";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send("Missing code or state");

    const [guild_id, user_id] = state.split(":");

    // Token holen
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).send("Token fehlgeschlagen");

    // User Info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // Account Alter berechnen
    const createdAt = new Date((BigInt(user.id) / 4194304n) + 1420070400000n);
    const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Serveranzahl
    const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `${tokenData.token_type} ${tokenData.access_token}` },
    });
    const guilds = await guildsRes.json();

    // Prüfen ob Nutzer in DB existiert
    const dbCheck = await pool.query("SELECT * FROM logins WHERE id=$1", [user.id]);

    if (dbCheck.rowCount === 0) {
      // Neu anlegen
      await pool.query(
        "INSERT INTO logins (id, username, account_age_days, server_count) VALUES ($1,$2,$3,$4)",
        [user.id, user.username, accountAgeDays, guilds.length]
      );
      res.send("✅ Neue Verifizierung gespeichert!");
    } else {
      // Update
      await pool.query(
        "UPDATE logins SET username=$2, account_age_days=$3, server_count=$4 WHERE id=$1",
        [user.id, user.username, accountAgeDays, guilds.length]
      );
      res.send("✅ Verifizierung aktualisiert!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Fehler bei der Verifizierung");
  }
}
