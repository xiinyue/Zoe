# Zoe - Xd by Badan - Ser

```bash
#!/bin/bash

# Check if apt package manager is available
if ! command -v apt &> /dev/null; then
    echo -e "\e[31mThis script is intended for use on Linux systems with the apt package manager.\e[0m"
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# Function to run commands with sudo if not root
run_with_sudo() {
    if [ "$EUID" -ne 0 ]; then
        sudo "$@"
    else
        "$@"
    fi
}

# Prompt for BOT name
echo -e "\e[36mEnter a name for BOT (e.g., levanter):\e[0m"
read -r BOT_NAME
BOT_NAME=${BOT_NAME:-levanter}

# Handle existing directory with the same name
if [ -d "$BOT_NAME" ]; then
    RANDOM_SUFFIX=$((1 + RANDOM % 1000))
    BOT_NAME="${BOT_NAME}${RANDOM_SUFFIX}"
    echo -e "\e[33mFolder with the same name already exists. Renaming to $BOT_NAME.\e[0m"
fi

# Prompt for SESSION_ID
echo -e "\e[36mDo you have a SESSION_ID scanned today? (y/n):\e[0m"
read -r HAS_SESSION_ID
SESSION_ID=""
if [[ "$HAS_SESSION_ID" == "y" ]]; then
    echo -e "\e[36mEnter Your SESSION_ID:\e[0m"
    read -r SESSION_ID
fi

# Function to install Node.js
install_nodejs() {
    echo -e "\e[33mInstalling Node.js version 20...\e[0m"
    curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
    if ! bash nodesource_setup.sh; then
        echo -e "\e[31mFailed to run nodesource setup script.\e[0m"
        exit 1
    fi
    if ! run_with_sudo apt-get install -y nodejs; then
        echo -e "\e[31mFailed to install Node.js.\e[0m"
        exit 1
    fi
    rm nodesource_setup.sh
}

# Function to uninstall Node.js
uninstall_nodejs() {
    echo -e "\e[33mRemoving existing Node.js installation...\e[0m"
    if ! run_with_sudo apt-get remove -y nodejs; then
        echo -e "\e[31mFailed to remove Node.js.\e[0m"
        exit 1
    fi
    if ! run_with_sudo apt-get autoremove -y; then
        echo -e "\e[31mFailed to autoremove packages.\e[0m"
        exit 1
    fi
}

# Update system packages
echo -e "\e[33mUpdating system packages...\e[0m"
if ! run_with_sudo apt update -y; then
    echo -e "\e[31mFailed to update system packages.\e[0m"
    exit 1
fi

# Install required packages
for pkg in git ffmpeg curl; do
    if ! command -v "$pkg" &> /dev/null; then
        if ! run_with_sudo apt install -y "$pkg"; then
            echo -e "\e[31mFailed to install $pkg.\e[0m"
            exit 1
        fi
    fi
done

# Check for Node.js version and reinstall if necessary
if command -v node &> /dev/null; then
    CURRENT_NODE_VERSION=$(node -v | cut -d. -f1)
    if [[ "$CURRENT_NODE_VERSION" != "v20" ]]; then
        uninstall_nodejs
        install_nodejs
    else
        echo -e "\e[32mNode.js version 20 is already installed.\e[0m"
    fi
else
    install_nodejs
fi

# Check and install Yarn
YARN_REQUIRED_VERSION="1" # Set required Yarn major version here
if command -v yarn &> /dev/null; then
    CURRENT_YARN_VERSION=$(yarn -v | cut -d. -f1)
    if [[ "$CURRENT_YARN_VERSION" != "$YARN_REQUIRED_VERSION" ]]; then
        echo -e "\e[33mRemoving existing Yarn installation...\e[0m"
        if ! run_with_sudo apt-get remove -y yarn; then
            echo -e "\e[31mFailed to remove Yarn.\e[0m"
            exit 1
        fi
        if ! run_with_sudo apt-get autoremove -y; then
            echo -e "\e[31mFailed to autoremove packages.\e[0m"
            exit 1
        fi
        echo -e "\e[33mInstalling Yarn...\e[0m"
        if ! run_with_sudo npm install -g yarn; then
            echo -e "\e[31mFailed to install Yarn.\e[0m"
            exit 1
        fi
    else
        echo -e "\e[32mYarn is already installed.\e[0m"
    fi
else
    echo -e "\e[33mInstalling Yarn...\e[0m"
    if ! run_with_sudo npm install -g yarn; then
        echo -e "\e[31mFailed to install Yarn.\e[0m"
        exit 1
    fi
fi

# Check and install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "\e[33mInstalling PM2...\e[0m"
    if ! yarn global add pm2; then
        echo -e "\e[31mFailed to install PM2.\e[0m"
        exit 1
    fi
else
    echo -e "\e[32mPM2 is already installed.\e[0m"
fi

# Clone the repository
echo -e "\e[33mCloning Levanter repository...\e[0m"
if ! git clone https://github.com/lyfe00011/levanter.git "$BOT_NAME"; then
    echo -e "\e[31mFailed to clone repository.\e[0m"
    exit 1
fi
cd "$BOT_NAME"

# Install dependencies
echo -e "\e[33mInstalling dependencies with Yarn...\e[0m"
if ! yarn install --network-concurrency 3; then
    echo -e "\e[31mFailed to install dependencies.\e[0m"
    exit 1
fi

# Create config.env file
echo -e "\e[33mCreating config.env file...\e[0m"
cat > config.env <<EOL
PREFIX=.
STICKER_PACKNAME=LyFE
ALWAYS_ONLINE=false
RMBG_KEY=null
LANGUAGE=en
WARN_LIMIT=3
FORCE_LOGOUT=false
BRAINSHOP=159501,6pq8dPiYt7PdqHz3
MAX_UPLOAD=60
REJECT_CALL=false
SUDO=989876543210
TZ=Asia/Kolkata
VPS=true
AUTO_STATUS_VIEW=true
SEND_READ=true
AJOIN=true
EOL

echo "NAME=$BOT_NAME" >> config.env

if [ -n "$SESSION_ID" ]; then
    echo "SESSION_ID=$SESSION_ID" >> config.env
fi

# Start the bot
echo -e "\e[33mStarting the bot...\e[0m"
if ! yarn pm2 start index.js --name "$BOT_NAME" --attach; then
    echo -e "\e[31mFailed to start the bot.\e[0m"
    exit 1
fi
```

```js
>lib.Zoe({ pattern:'eval', on: "text", fromMe: true, desc :'Runs a server code', type: "user"}, async (message, match) => {
  if (message.text.startsWith(">")) {
    const m = message;
    try {
      let evaled = await eval(`(async () => { ${message.text.replace(">", "")}})()`);
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      await message.reply(evaled);
    } catch (err) {
      await message.reply(util.format(err));
    }
  }
});
```

```js
async initialiseEnv() {
		let status = false;
		const data = await database.findAll({
			where: {
				name: "vars"
			}
		});
		const formattedList = data.map(entry => ({
			key: entry.dataValues.jid,
			value: entry.dataValues.message,
			status: entry.dataValues.status
		}));

		if (!fs.existsSync("./" + "config.env")) {
			await Promise.all(formattedList.filter(database => database.status).map(async (database) => {
				await changeVar(database.key, database.value);
				status = true;
			}));
			if (status) process.exit(1);
		}
	}
```

```js
const { DataTypes } = require("sequelize");
const config = require("../../config"); 

const database = config.DATABASE.define("database", {
  jid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.JSON,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  uniqueKeys: {
    unique_jid_message_status: {
      fields: ['jid', 'name']
    }
  }
});


module.exports = database;
```

```js
async function removeData(jid, name) {
  try {
    const results = await database.findAll({ where: { jid: jid, name: name } }); // Adjust this according to your database setup
    if (results && results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.name === name) {
          await result.destroy();
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error("Error occurred while removing data:", error);
    return false;
  }
}
```

```js

async function setData(jid, message, status, name) {
  try {
    let data = [];
    const results = await database.findAll({ where: { jid: jid, name: name } });
    if (results && results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        result.message = message;
        result.status = status;
        await result.save();
        data.push(result);
      }
    } else {
      const newRecord = await database.create({ jid, message, name, status }); 
      data.push(newRecord);
    }
    return data;
  } catch (error) {
    console.error("Error occurred while setting message and messageId:", error);
    return false;
  }
};

async function getData(jid) {
  try {
    const result = await database.findAll({
      where: {
        jid: jid
      }
    });
    if (!result) return null;
    const statusObject = {};
    result.forEach(greeting => {
      statusObject[greeting.name] = { message: greeting.message, jid: greeting.jid, status: greeting.status };
    });

    return statusObject;
  } catch (error) {
    console.error("Error occurred while getting greetings by jid:", error);
    return false;
  }
};

async function transformData(id, type) {
    try {
        if (type === "antidelete") {
            const { antidelete } = await getData(id);
            const parsedMessage = JSON.parse(antidelete.message);
            const { jid, status } = antidelete;
            const action = parsedMessage.action;
            const value = parsedMessage.value;
            return { action, value, status, jid };
        } else if (type === "antiword") {
            const { antiword } = await getData(id);
            const parsedMessage = JSON.parse(antiword.message);
            const { jid, status } = antiword;
            const action = parsedMessage.action;
            const value = parsedMessage.value;
            return { action, value, status, jid };
        } else if(type === "antilink") {
            const { antilink } = await getData(id);
            const parsedMessage = antilink.message ? JSON.parse(antilink.message) : {};
            const { jid } = antilink;
            let { status } = antilink;
            const action = parsedMessage.action || "null";
            const value = parsedMessage.value || "null";
            status = status === "true" ? true : false;
            return {
              action,
              enabled: status,
              allowedUrls: value,
              jid
            };
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

async function pluginList() {
  const data = await database.findAll({ where: { name: "plugin" }});
  const formattedList = data.map(entry => ({
    name: entry.dataValues.jid,
    url: entry.dataValues.message
  }));
  return formattedList;
};
```

### https://files.catbox.moe/ce6cra.mp4 type/audio newsletter/channel ptt(only ptt)
```js
{"ptt":false,"waveform":[99,0,99,0,99,99,0,99,0,99],"contextInfo":{"isForwarded":true,"forwardedNewsletterMessageInfo":{"newsletterJid":"120363177799183507@newsletter","newsletterName":"𝗭𝗼𝗲 - 𝗫𝗱  ⛮","serverMessageId":-1}},"quoted":{"key":{"remoteJid":"919747257996@s.whatsapp.net","fromMe":false,"id":"0"},"message":{"conversation":"𝘏𝘦𝘺 𝘉𝘶𝘥𝘥𝘺 🍫"}}}
```

### https://files.catbox.moe/ce6cra.mp4 type/audio larger preview audio
```js
{"ptt":true,"waveform":[99,0,99,0,99,99,0,99,0,99],"contextInfo":{"externalAdReply":{"title":"𝘉 𝘢 𝘥 𝘢 𝘯 ~ 𝘚 𝘦 𝘳","body":"𝘡𝘰𝘦 - 𝘟𝘥","mediaType":1,"thumbnailUrl":"https://files.catbox.moe/85pjxr.png","renderLargerThumbnail":true}},"quoted":{"key":{"remoteJid":"919747257996@s.whatsapp.net","fromMe":false,"id":"0"},"message":{"conversation":"𝘏𝘦𝘺 𝘉𝘶𝘥𝘥𝘺 🍫"}}}
```

### https://files.catbox.moe/ce6cra.mp4 type/audio small preview ptt
```js
{"ptt":true,"waveform":[99,0,99,0,99,99,0,99,0,99],"contextInfo":{"externalAdReply":{"title":"𝘉 𝘢 𝘥 𝘢 𝘯 ~ 𝘚 𝘦 𝘳","body":"𝘡𝘰𝘦 - 𝘟𝘥","mediaType":1,"thumbnailUrl":"https://files.catbox.moe/zhkwkn.png"}},"quoted":{"key":{"remoteJid":"919747257996@s.whatsapp.net","fromMe":false,"id":"0"},"message":{"conversation":"𝘏𝘦𝘺 𝘉𝘶𝘥𝘥𝘺 🍫"}}}
```

### https://files.catbox.moe/ce6cra.mp4 type/audio  small preview audio
```js
{"ptt":false,"waveform":[99,0,99,0,99,99,0,99,0,99],"contextInfo":{"externalAdReply":{"title":"𝘉 𝘢 𝘥 𝘢 𝘯 ~ 𝘚 𝘦 𝘳","body":"𝘡𝘰𝘦 - 𝘟𝘥","mediaType":1,"mediaUrl":"https://whatsapp.com/channel/0029Va8q83cBPzjV0sFn2F03","source Url":"https://whatsapp.com/channel/0029Va8q83cBPzjV0sFn2F03","thumbnailUrl":"https://files.catbox.moe/zhkwkn.png"}},"quoted":{"key":{"remoteJid":"919747257996@s.whatsapp.net","fromMe":false,"id":"0"},"message":{"conversation":"𝘏𝘦𝘺 𝘉𝘶𝘥𝘥𝘺 🍫"}}}
```
