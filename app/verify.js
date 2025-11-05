export default function handler(req, res) {
  const { guild_id, user_id } = req.query;
  res.send(`Verifizierung gestartet für User ${user_id} auf Guild ${guild_id} ✅`);
};
