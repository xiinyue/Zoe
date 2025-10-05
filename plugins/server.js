const { Zoe, PREFIX, route: { update, restart, variable }, extractUrlsFromText, sleep, isUrl } = require("../lib/Index");
const { dbController } = require("../lib/database");
const axios = require("axios");
const fs = require("fs");
const util = require("util");
const git = require("simple-git")();
const { version } = require("../package");
const config = require("../config");
let { getString } = require("./func/lang");
let lang = getString("server");
const format = (str, values) => str.replace(/\$\{(\w+)\}/g, (_, key) => values[key] ?? "");

Zoe(
  {
    pattern: "update",
    fromMe: true,
    desc: lang.UPDATE_DESC,
    type: "server",
  },
  async (m, match, client) => {
    await git.fetch();
    const log = await git.log(["main..origin/main"]);
    if (log.total === 0) return m.reply(format(lang.LT_ALERT, { version }));
    if (match === "now") return await update(m);

    let cu = await m.reply(lang.CU_ALERT);
    const updates = log.all
      .map((c, i) => ` *${i + 1}.* _${c.message}_\n╎`)
      .join("");

    const msg = format(lang.UPM_ALERT, { updates, PREFIX });
    return await cu.edit(msg);
  }
);

Zoe(
  {
    pattern: "restart",
    alias: ["reboot"],
    fromMe: true,
    desc: lang.RESTART_DESC,
    type: "server",
  },
  async (m, _, client) => {
    await client.sendMessage(m.jid, { text: lang.R_ALERT });
    return await restart();
  }
);

Zoe(
  {
    pattern: "server",
    alias: ["platform"],
    fromMe: true,
    desc: lang.SERVER_DESC,
    type: "server",
  },
  async (m, _, client) => {
    return await m.reply(format(lang.ZR_ALERT, { client: client.server }));
  }
);

Zoe({
  pattern: "setvar",
  alias: ["addvar"],
  fromMe: true,
  desc: lang.SETVAR_DESC,
  type: "server",
}, async (m, text) => {
  if (!text) return await m.reply(lang.UFKV_ALERT);

  let [key, value] = text.split(":");
  if (!key || !value) return await m.reply(lang.NFKV_ALERT);

  key = key.trim();
  value = value.trim();

  if (!key) return await m.reply(lang.MK_ALERT);
  if (!value) return await m.reply(lang.MV_ALERT);

  let svr = await variable.set(key.toUpperCase(), value);
  if (!svr) return m.reply(format(lang.EVAR_ALERT, { cmd: "set/change in" }));
  await dbController.set("vars", key.toUpperCase(), value, !!value);
  await m.reply(`Set ${key.toUpperCase()} to ${value}, restarting...`);
  return await restart();
});

Zoe({
  pattern: "delvar",
  alias: ["rmvar"],
  fromMe: true,
  desc: lang.DELVAR_DESC,
  type: "server",
}, async (m, text) => {
  if (!text) return await m.reply(lang.DEX_ALERT);
  let key = text.trim();
  let svr = await variable.delete(key.toUpperCase());
  if (!svr) return m.reply(format(lang.EVAR_ALERT, { cmd: "deleting" }));
  await dbController.set("vars", key.toUpperCase(), null, false);
  await m.reply(`Deleted ${key.toUpperCase()}, restarting...`);
  return await restart();
});

Zoe({
  pattern: "getvar",
  fromMe: true,
  desc: lang.GETVAR_DESC,
  type: "server",
}, async (m, text) => {
  if (!text) {
    return await m.reply(lang.GVEX_ALERT);
  }

  const key = text.trim().toUpperCase();
  const value = config[key];

  if (value === undefined) {
    return await m.reply(lang.NFV_ALERT);
  }

  await m.reply(`*${key}* = ${value}`);
});

Zoe({
  pattern: "listvar",
  alias: ["allvar"],
  fromMe: true,
  desc: lang.LISTVAR_DESC,
  type: "server",
}, async (m) => {
  const entries = Object.entries(config);

  if (entries.length === 0) {
    return await m.reply(lang.NFC_ALERT);
  }

  let msg = "*Config Variables:*\n\n";
  for (const [key, value] of entries) {
    msg += `- *${key}* = ${value}\n`;
  }

  await m.reply(msg);
});

Zoe(
  {
    pattern: "plugin",
    fromMe: true,
    desc: lang.PLUGIN_DESC,
    type: "server",
  },
  async (m, match) => {
    let pluginName = "";
    match = match || (m.reply_message && m.reply_message.text);
    if (!match) return await message.reply(lang.PEX_ALERT);
    if (match === "list") {
      const data = await dbController.get("plugins");
      if (!data || data.length === 0) return m.reply(lang.NPF_ALERT);
      data.forEach(item => pluginName += `*${item.name}:* ${item.url}\n`);
      return m.reply(pluginName);
    }

    // If match is a URL, install it
    if (isUrl(match)) {
      const arr = await extractUrlsFromText(match);
      for (const element of arr) {
        let url;
        try { url = new URL(element); }
        catch (e) { return await m.reply(lang.IU_ALETT); }

        if (url.host === "gist.github.com") {
          url.host = "gist.githubusercontent.com";
          url = url.toString() + "/raw";
        } else url = url.toString();

        try {
          const { data, status } = await axios.get(url);
          if (status === 200) {
            pluginName = (data.match(/(?<=pattern:) ["'](.*?)["']/g) || [])
              .map(mt => mt.trim().split(" ")[0])
              .join(', ')
              .replace(/['"]/g, '') || "__" + Math.random().toString(36).substring(8);

            const fileName = pluginName.split(',')[0] + ".js";
            fs.writeFileSync(__dirname + "/" + fileName, data);

            try { require("./" + fileName); }
            catch (e) {
              fs.unlinkSync(__dirname + "/" + fileName);
              return await m.reply(lang.IP_ALERT + "\n\n```" + util.format(e) + "```");
            }

            await dbController.set("plugin", pluginName.split(',')[0], url);
            await m.reply(lang.NPI_ALERT + pluginName);
            await sleep(1500);
          }
        } catch (error) {
          console.log(error)
          return await m.reply(lang.ERRP_ALERT);
        }
      }

    } else {
      try {
        const { message } = await dbController.get("plugin", match);
        await m.reply(message.trim());
      } catch (err) {
        return m.reply(lang.PNF_ALERT);
      }
    }
  }
);

Zoe(
  {
    pattern: "remove",
    fromMe: true,
    desc: lang.REMOVE_DESC,
    type: "server",
  },
  async (message, match) => {
    if (!match) return await message.reply(lang.NPN_ALERT);

    const pluginPath = __dirname + "/" + match + ".js";
    const pluginName = await dbController.delete("plugin", match);

    if (!fs.existsSync(pluginPath) && !pluginName) {
      return await message.reply(lang.PNF_ALERT);
    } else {
      try {
        delete require.cache[require.resolve(pluginPath)];
      } catch { }
      fs.unlinkSync(pluginPath);
      await message.reply(format(lang.PRS_ALERT, { match }));
      return await restart();
    }
  }
);
