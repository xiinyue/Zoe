const express = require('express');
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

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
