# Zoe-XD WhatsApp Bot 🤖💬

![Zoe Logo](https://i.imgur.com/MCkdz2x.jpeg)

> A powerful **multi-device WhatsApp bot** built with Node.js.  
> Developer: **Badan Ser**  

---

## 🚀 Features
- Multi-device WhatsApp connection  
- Anti-delete messages  
- Auto read messages/commands (optional)  
- Warn system  
- Sticker & audio watermark support  
- Easy deployment (Heroku, Koyeb, Render, Railway, VPS)  

---

## 🆔 Get Session ID
Before deploying, you need to **generate a SESSION ID** here:  
👉 [Zoe Session Generator](https://zoee-xd-web.onrender.com)  

Copy the generated **SESSION ID** and paste it in your deployment env variables.

---

## ⚙️ Environment Variables

Here are the required environment variables you must set before deploying:

| Variable              | Description                                   | Default Value |
|-----------------------|-----------------------------------------------|---------------|
| HANDLER               | Handler for bot                               | `null`        |
| HEROKU_APP_NAME       | Heroku app name                               | ``            |
| HEROKU_API_KEY        | Heroku API key                                | ``            |
| MODE                  | Bot mode (`public` or `private`)              | `private`     |
| ERROR_MSG             | Enable error messages                         | `false`       |
| LOG_MSG               | Enable log messages                           | `false`       |
| READ_CMD              | Auto read commands                            | `false`       |
| READ_MSG              | Auto read messages                            | `false`       |
| ANTI_DELETE           | Enable deleted message recovery               | `false`       |
| WARN_COUNT            | Number of warnings before action              | `3`           |
| BOT_INFO              | Bot info (name;logo URL)                      | `Team-XD;https://files.catbox.moe/85pjxr.png` |
| AUDIO_DATA            | Audio watermark data                          | `ZOE-XD;badan ser!!!;https://files.catbox.moe/zhkwkn.png` |
| STICKER_PACKDATA      | Sticker pack metadata                         | `ZOE-XD;badan ser!!!` |
| SUDO                  | Owner number(s)                               | `919747257996,919037780075,124704912326723` |
| SESSION               | WhatsApp session ID                           | `Zoe-XD^baqdg3_badan` |
| LANGUAGE              | Bot language                                  | `english`     |
| RAILWAY_API           | Railway API key                               | ``            |
| RAILWAY_PROJECT_NAME  | Railway project name                          | ``            |
| KOYEB_API             | Koyeb API key                                 | ``            |
| KOYEB_APP_NAME        | Koyeb app name                                | ``            |
| RENDER_API            | Render API key                                | ``            |
| RENDER_APP_NAME       | Render app name                               | ``            |

---

## 📦 Deployment

⚠️ **First fork this repo:**  
👉 [Fork Zoe Repo](https://github.com/Xirtexe/Zoe/fork)

Then deploy to your preferred platform:

### 🔹 Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Xirtexe/Zoe)

### 🔹 Koyeb
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/Xirtexe/Zoe&branch=main&env[SESSION]=your_session_id&env[HANDLER]=null&env[MODE]=private&env[ANTI_DELETE]=true)

### 🔹 Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Xirtexe/Zoe)

### 🔹 Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Xirtexe/Zoe)

### 🔹 VPS
1. Clone repo  
   ```bash
   git clone https://github.com/Xirtexe/Zoe
   cd Zoe
   ```
2. Install dependencies  
   ```bash
   npm install
   ```
3. Set environment variables (in `.env` file or system)  
4. Start bot  
   ```bash
   npm start
   ```

---

## 👨‍💻 Developer
- Name: **Badan Ser**  
- Project: **Zoe-XD WhatsApp Bot**  
- Repo: [Zoe](https://github.com/Xirtexe/Zoe)

---

## 📸 Screenshots
![Bot Demo](https://files.catbox.moe/85pjxr.png)

---

## ⭐ Support
If you like this project, consider giving it a star ⭐ on GitHub!
