export default function handler(req, res) {
  const { guild_id, user_id } = req.query;
  if (!guild_id || !user_id) return res.status(400).send("Missing guild_id or user_id");

  const redirect_uri = encodeURIComponent(process.env.REDIRECT_URI);
  const client_id = process.env.CLIENT_ID;

  const oauthURL = `https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=identify%20guilds&state=${guild_id}:${user_id}`;

  res.redirect(oauthURL);
}
