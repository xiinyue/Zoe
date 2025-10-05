const { Zoe, mode, Message, parsedJid } = require('../lib/Index');
const { dbController } = require('../lib/database');
let { getString } = require("./func/lang");
let lang = getString("utility");
const format = (str, values) => str.replace(/\$\{(\w+)\}/g, (_, key) => values[key] ?? "");

Zoe(
  { pattern: 'pp', fromMe: true, desc: lang.PP_DESC, type: 'utility' },
  async (m, match, client) => {
    if (match === 'remove') {
      await client.removeProfilePicture(client.user.id);
      return m.reply(lang.PR_ALERT);
    }

    if (m.reply_message?.type !== "imageMessage") {
      return m.reply(lang.I_ALERT);
    }

    const media = await m.reply_message.download();
    //await client.updateProfile(client.user.id, media);
    await client.updateProfilePicture(client.user.id, media);
    await m.reply(lang.PU_ALERT);
  }
);

Zoe(
  { pattern: 'quoted', fromMe: mode, desc: lang.QUOTED_DESC, type: 'utility' },
  async (m, _, client) => {
    if (!m.quoted) return m.reply(lang.M_ALERT);

    const ms = await client.store.loadMessage(m.reply_message.id);
    if (!ms) return m.reply(lang.MNS_ALERT);

    const q = new Message(client, JSON.parse(JSON.stringify(ms.message)));

    if (!q.quoted) {
      return client.forwardMessage(m.jid, q.data, { contextInfo: { isForwarded: false }, quoted: m.msg });
    }

    await client.forwardMessage(m.jid, q.reply_message.data, { contextInfo: { isForwarded: false }, quoted: m.data });
  }
);

Zoe(
  { pattern: 'setcmd', fromMe: true, desc: lang.SETCMD_DESC, type: 'utility' },
  async (m, match) => {
    const s = m.reply_message?.msg?.stickerMessage;
    if (!s) return m.reply(lang.S_ALERT);
    if (!match) return m.reply(lang.STC_ALERT);

    const hash = s.fileSha256.join("");

    try {
      const data = await dbController.get("sticker", "123");
      const existing = Object.entries(data?.sticker_cmd || {}).find(([_, v]) => v === hash);

      if (existing) {
        return m.reply(format(lang.ALREADY_BOUND, { cmd: existing[0] }));
      }

      await dbController.set("sticker", "123", { sticker_cmd: { [match]: hash } });
      return await m.reply(format(lang.CSS_ALERT, { match }));
    } catch {
      await m.reply(lang.UERR_ALERT);
    }
  }
);

Zoe(
  { pattern: 'delcmd', fromMe: true, desc: lang.DELCMD_DESC, type: 'utility' },
  async (m, match) => {
    if (!match) return m.reply(lang.DC_ALERT);

    try {
      const deleted = await dbController.delete("sticker", "123", match);
      await m.reply(deleted ? format(lang.DSS_ALERT, { match }) : lang.NVC_ALERT);
    } catch {
      await m.reply(lang.UERR_ALERT);
    }
  }
);

Zoe(
  {
    pattern: "whois",
    fromMe: mode,
    desc: lang.WHOIS_DESC,
    type: "utility"
  },
  async (m, text) => {
    const { client: sock, reply_message, isGroup, jid } = m;

    let num = text?.trim()?.replace(/\D/g, "");
    let target = num ? num + "@s.whatsapp.net" : reply_message?.sender;

    if (!target) {
      return sock.sendMessage(
        jid,
        { text: isGroup ? lang.RPN_ALERT : lang.NUF_ALERT }
      );
    }

    try {
      const [name, statusData, [exist]] = await Promise.all([
        sock.store.getName(target),
        sock.fetchStatus(target),
        sock.onWhatsApp(target)
      ]);

      const { status, setAt } = statusData[0] || {};
      const setDate = setAt ? new Date(setAt).toLocaleString() : "Unknown";
      const wpno = target.match(/\d+/)?.[0];
      const url = await sock.profilePictureUrl(target, 'image').catch(() => "https://files.catbox.moe/2fguma.png");

      const caption = `╭╺╺╺╺╺╡𝗨𝘀𝗲𝗿 𝗗𝗲𝘁𝗮𝗶𝗹𝘀
╎
╎ 𝗡𝗮𝗺𝗲: _${name || "Not found"}_
╎ 𝗕𝗶𝗼: _${status || "Not set"}_
╎ 𝗕𝗶𝗼 𝗦𝗲𝘁𝗔𝘁: _${setDate}_
╎ 𝗨𝘀𝗲𝗿 𝗟𝗶𝗱: _${exist?.lid || "Unknown"}_
╎ 𝗨𝘀𝗲𝗿 𝗝𝗶𝗱: _${target}_
╎ 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽: _https://wa.me/${wpno}_
╰╺╺╺╺╺╺╺╺╺╺╡`;

      return sock.sendMessage(jid, { image: { url }, mimetype: "image/jpeg", caption });
    } catch {
      return m.reply(format(lang.FT_ALERT, { cmd: "fetch user info" }));
    }
  }
);

Zoe(
  {
    pattern: "getprivacy",
    fromMe: true,
    desc: lang.GETPRIVACY_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    try {
      const { readreceipts, profile, status, online, last, groupadd, calladd } =
        await sock.fetchPrivacySettings(true);

      const text = `_*Current Privacy Settings*_\n
📍 *Read Receipts:* ${readreceipts}
📍 *Profile Photo:* ${profile}
📍 *Status:* ${status}
📍 *Online:* ${online}
📍 *Last Seen:* ${last}
📍 *Group Add:* ${groupadd}
📍 *Calls:* ${calladd}`;

      return message.reply(text);
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "fetch privacy settings" }));
    }
  }
);

// ✅ MESSAGE PIN
Zoe(
  {
    pattern: "mpin",
    fromMe: true,
    desc: lang.MPIN_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    if (!message.reply_message) return message.reply(lang.M_ALERT);

    const array = { "24": 86400, "7": 604800, "30": 2592000 };
    const time = array[match];

    if (!time) return message.reply(lang.MPIN_ALERT);

    try {
      await sock.chatModify(
        { pin: { type: "pin", duration: time, messages: [message.reply_message.data.key] } },
        message.jid
      );
      return message.reply(lang.MP_ALERT);
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "pin message" }));
    }
  }
);

Zoe(
  {
    pattern: "munpin",
    fromMe: true,
    desc: lang.UNPIN_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    if (!message.reply_message) return message.reply(lang.M_ALERT);

    try {
      await sock.chatModify(
        { pin: { type: "unpin", messages: [message.reply_message.data.key] } },
        message.jid
      );
      return message.reply(lang.UNP_ALERT);
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "unpin message" }));
    }
  }
);

Zoe(
  {
    pattern: "deletechat",
    fromMe: true,
    desc: lang.DELETECHAT_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    try {
      await sock.chatModify({ clear: { messages: [{ id: message.id, fromMe: true }] } }, message.jid);
      return message.reply(format(lang.CS_ALERT, { cmd: "deleted" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "delete chat" }));
    }
  }
);

Zoe(
  {
    pattern: "archive",
    fromMe: true,
    desc: lang.ARCHIVE_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    try {
      await sock.chatModify({ archive: true }, message.jid);
      return message.reply(format(lang.CS_ALERT, { cmd: "archived" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "archive chat" }));
    }
  }
);

Zoe(
  {
    pattern: "unarchive",
    fromMe: true,
    desc: lang.UNARCHIVE_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    try {
      await sock.chatModify({ archive: false }, message.jid);
      return message.reply(format(lang.CS_ALERT, { cmd: "unarchived" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "unarchive chat" }));
    }
  }
);

Zoe(
  {
    pattern: "block",
    fromMe: true,
    desc: lang.BLOCK_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    match = message.mention?.[0] || message.reply_message?.sender || match;
    try {
      if (match === "list") {
        const numbers = await sock.fetchBlocklist();
        if (!numbers?.length) return message.reply(lang.NBF_ALERT);
        const blockList = `_*Block List*_\n\n${numbers
          .map(n => `- +${n.replace("@s.whatsapp.net", "")}`)
          .join("\n")}`;
        return message.reply(blockList);
      }

      if (!match) return message.reply(lang.U_ALERT)
      const jid = parsedJid(match);
      await sock.updateBlockStatus(jid[0], "block");
      return message.reply(`*Blocked:* +${jid[0].replace("@s.whatsapp.net", "")}`);
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "block" }));
    }
  }
);

Zoe(
  {
    pattern: "unblock",
    fromMe: true,
    desc: lang.UNBLOCK_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    match = message.mention?.[0] || message.reply_message?.sender || match;
    try {
      if (match === "all") {
        const numbers = await sock.fetchBlocklist();
        if (!numbers?.length) return message.reply("_*No block list found*_");

        await Promise.all(
          numbers.map(async jid => {
            await sock.updateBlockStatus(jid, "unblock");
            await new Promise(res => setTimeout(res, 1500));
          })
        );

        const unblockList = `_*Unblocked All*_\n\n${numbers
          .map(n => `- +${n.replace("@s.whatsapp.net", "")}`)
          .join("\n")}`;
        return message.reply(unblockList);
      }

      if (!match) return message.reply(lang.U_ALERT);
      const jid = parsedJid(match);
      await sock.updateBlockStatus(jid[0], "unblock");
      return message.reply(`*Unblocked:* +${jid[0].replace("@s.whatsapp.net", "")}`);
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "unblock" }));
    }
  }
);

Zoe(
  {
    pattern: "setbio",
    fromMe: true,
    desc: lang.SETBIO_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    if (!match) return message.reply(lang.GT_ALERT);
    try {
      await sock.updateProfileStatus(match);
      message.reply(format(lang.UP_ALERT, { cmd: "Bio" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "update bio" }));
    }
  }
);

Zoe(
  {
    pattern: "setname",
    fromMe: true,
    desc: lang.SETNAME_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    if (!match) return message.reply(lang.GT_ALERT);
    try {
      await sock.updateProfileName(match);
      message.reply(format(lang.UP_ALERT, { cmd: "Name" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "update name" }));
    }
  }
);

Zoe(
  {
    pattern: "chatpin",
    fromMe: true,
    desc: lang.CHATPIN_DESC,
    type: "utility",
  },
  async (message, match, sock) => {
    try {
      await sock.chatModify({ pin: true }, message.jid);
      message.reply(format(lang.CS_ALERT, { cmd: "pinned" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "pin chat" }));
    }
  }
);

Zoe(
  {
    pattern: "chatunpin",
    fromMe: true,
    desc: "Unpin a chat",
    type: "utility",
  },
  async (message, match, sock) => {
    try {
      await sock.chatModify({ pin: false }, message.jid);
      return message.reply(format(lang.CS_ALERT, { cmd: "unpinned" }));
    } catch (err) {
      return message.reply(format(lang.FT_ALERT, { cmd: "unpin chat" }));
    }
  }
);
