# Zoe-XD WhatsApp Bot
A WhatsApp bot built with Node.js.

---

## Fork this Repository
First, fork this repository to your GitHub account:  
[![Fork](https://img.shields.io/badge/FORK%20REPO-FFf61C?style=for-the-badge&logo=&logoColor=black)](https://github.com/Xirtexe/Zoe/fork)


## Get Session ID
Generate your session ID by scanning the QR code at:  
[![Scan](https://img.shields.io/badge/SCAN%20QR-FFf61C?style=for-the-badge&logo=&logoColor=black)](https://zoe-xd-ofc.onrender.com)

---

## Deployment Methods

### Deploy to Heroku
If you don't have an account in Heroku, create one:  

[![Heroku](https://img.shields.io/badge/-Create-FFf61C?style=for-the-badge&logo=heroku&logoColor=black)](https://signup.heroku.com/)

Now deploy:  

[![DEPLOY](https://img.shields.io/badge/-DEPLOY-FFf61C?style=for-the-badge&logo=heroku&logoColor=black)](https://zoe-xd-ofc.onrender.com/deploy/heroku)

---

### Deploy to Koyeb
If you don't have an account in Koyeb, create one:  

[![Koyeb](https://img.shields.io/badge/-Create-FFf61C?style=for-the-badge&logo=koyeb&logoColor=black)](https://app.koyeb.com/auth/signup)

Get your Koyeb API key.  

Now deploy:  

[![DEPLOY](https://img.shields.io/badge/-DEPLOY-FFf61C?style=for-the-badge&logo=koyeb&logoColor=black)](https://zoe-xd-ofc.onrender.com/deploy/koyeb)

---

### Deploy to Render
If you don't have an account in Render, create one:  

[![Render](https://img.shields.io/badge/-Create-FFf61C?style=for-the-badge&logo=render&logoColor=black)](https://render.com/signup)

Now deploy:  

[![DEPLOY](https://img.shields.io/badge/-DEPLOY-FFf61C?style=for-the-badge&logo=render&logoColor=black)](https://zoe-xd-ofc.onrender.com/deploy/render)

---

### Deploy to Railway
If you don't have an account in Railway, create one:  

[![Railway](https://img.shields.io/badge/-Create-FFf61C?style=for-the-badge&logo=railway&logoColor=black)](https://railway.app/login)

Now deploy:  

[![DEPLOY](https://img.shields.io/badge/-DEPLOY-FFf61C?style=for-the-badge&logo=railway&logoColor=black)](https://zoe-xd-ofc.onrender.com/deploy/railway)

---

### Deploy to VPS

**1.**  Quick setup

```bash
bash <(curl -fsSL https://bit.ly/42Wj4Wa)
```
- Enter SESSION, MODE, HANDLER, and SUDO. 
- (To change other environment variables after installation, edit config.env.)

- Manage with PM2:

```bash
pm2 list
pm2 restart zoe-bot
pm2 stop zoe-bot
pm2 logs zoe-bot
```

**2.**  Manual setup

- Set environment variables (in .env file or system)

```js
SUDO=919747257996,919037780075
SESSION=Zoe-XD^...
MODE=private
HANDLER=,
```

- Update System and Install Dependencies.

```bash
sudo apt update && sudo apt upgrade -y && \
sudo apt install -y git ffmpeg curl && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs && \
sudo npm install -g yarn && \
yarn global add pm2
```

- Clone the Repository and Start the Bot

```bash
git clone https://github.com/Xirtexe/Zoe
cd Zoe
npm install
npm start
```
```bash
npm start // to start bot
npm stop // to stop bot
npm restart // to restart bot
```
---
## Important warning

- Using unofficial APIs or automation with WhatsApp may violate their Terms of Service.

- Your account may be temporarily or permanently banned if WhatsApp detects automated or unauthorized access.

- Proceed only if you understand and accept this risk
---

## Special thanks to
- [Shuhaib ❤️](https://github.com/Abhiiyh) <br>

---

[![WhatsApp](https://img.shields.io/badge/JOIN%20WHATSAPP%20GROUP-FFf61C?style=for-the-badge&logo=whatsapp&logoColor=black)](https://chat.whatsapp.com/BxNvOg51FYk2Q2JYmfogCm)

[![WhatsApp](https://img.shields.io/badge/JOIN%20WHATSAPP%20CHANNEL-FFf61C?style=for-the-badge&logo=whatsapp&logoColor=black)](https://whatsapp.com/channel/0029Va8q83cBPzjV0sFn2F03)

[![EXplugs](https://img.shields.io/badge/EXTERNAL%20PLUGINS-FFf61C?style=for-the-badge&logo=&logoColor=black)](https://zoe-xd-ofc.onrender.com/plugins)

---
