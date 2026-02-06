const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
const client = require('./lib/Client')

app.get("/", (req, res) => res.send("Bot is running"));

const connect = async () => {
	try {
		await client.initialize()
	} catch (error) {
		console.error(error)
	}
}

connect();

const serverType = process.env.RENDER_EXTERNAL_URL
  ? 'RENDER'
  : process.env.KOYEB_PUBLIC_DOMAIN
  ? 'KOYEB'
  : null;

const uptimeUrl = serverType === 'RENDER'
  ? process.env.RENDER_EXTERNAL_URL
  : serverType === 'KOYEB'
  ? 'https://' + process.env.KOYEB_PUBLIC_DOMAIN
  : null;

setInterval(() => {
  if (!uptimeUrl) return;

  axios.get(uptimeUrl, {
    timeout: 5000,
    headers: { 'User-Agent': 'Uptime-Bot' },
    validateStatus: status => status < 500
  }).then(res => {
    console.log(`[${new Date().toISOString()}] Uptime Ping Success: ${res.status}`);
  }).catch(err => {
    console.log(`[${new Date().toISOString()}] Uptime Ping Failed: ${err.message}`);
  });
}, 5 * 60 * 1000);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
