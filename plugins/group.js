const {
  Zoe,
  mode,
  setWarn,
  removeWarn,
  isAdmin,
  handlePollMessage,
  getPollResults,
  parsedJid,
  sleep,
  extractUrlsFromText,
  PREFIX
} = require("../lib/Index");
const { dbController } = require("../lib/database");
const { WARN_COUNT } = require("../config");
let { getString } = require("./func/lang");
let lang = getString("group");
const format = (str, values) => str.replace(/\$\{(\w+)\}/g, (_, key) => values[key] ?? "");

Zoe(
  {
    pattern: "gpp",
    fromMe: true,
    desc: lang.GPP_DESC,
    type: "group",
  },
  async (m, match, client) => {
    if (!m.isGroup) return m.reply(lang.G_ALERT);
    if (!(await isAdmin(m, client.user.id))) {
      return m.reply(lang.INA_ALERT);
    }

    if (match === "remove") {
      await client.removeProfilePicture(client.user.id);
      return m.reply(lang.GPPR_ALERT);
    }

    if (m.reply_message?.type !== "imageMessage") {
      return m.reply(lang.I_ALERT);
    }

    const media = await m.reply_message.download();
    //await client.updateProfile(m.jid, media);
    await client.updateProfilePicture(m.jid, media);

    return m.reply(lang.GPP_ALERT);
  }
);

Zoe(
  {
    pattern: "warn", fromMe: true, desc: lang.WARN_DESC, type: "group"
  },
  async (m, match) => setWarn(m, match, WARN_COUNT)
);

Zoe(
  { pattern: "resetwarn", fromMe: true, desc: "Reset warnings", type: "group" },
  async (m) => removeWarn(m)
);

const settingHandler = (key, label) =>
  Zoe(
    {
      pattern: key,
      fromMe: true,
      desc: `${label} message`,
      type: "group",
    },
    async (m, match) => {
      const id = key === "mention" ? m.client.user.id : m.jid;
      const status = await dbController.status("personal", id, key);
      const stat = status ? "on" : "off";

      // Show current status
      if (!match) {
        return await m.sendPoll(m.jid, {
          name: `\n*${label} Manager 🎏*\n\n_Status: ${stat}_\n\n` + lang.CAA_ALERT,
          values: [
            { name: `${key} get`, id: `${PREFIX}${key} get` },
            { name: `${key} on`, id: `${PREFIX}${key} on` },
            { name: `${key} off`, id: `${PREFIX}${key} off` },
            { name: `${key} delete`, id: `${PREFIX}${key} delete` }
          ],
          withPrefix: true,
          onlyOnce: false,
          participates: [m.sender],
          selectableCount: true,
        });
      }

      const action = match.toLowerCase();

      if (action === "get") {
        const msg = await dbController.get("personal", id, key);
        return msg
          ? m.reply(msg.message)
          : m.reply(format(lang.TNS_ALERT, { key }));
      }

      if (["on", "off"].includes(action)) {
        if (stat === action) return m.reply(format(lang.A_ALERTS, { stat }));
        await dbController.status("personal", id, key, action === "on");
        return m.reply(`*${key} ${action}*`);
      }

      if (action === "delete") {
        await dbController.delete("personal", id, key);
        return m.reply(format(lang.DSSS_ALERT, { key, cmd: "deleted" }));
      }

      await dbController.set("personal", id, match, key);
      return m.reply(format(lang.DSSS_ALERT, { key, cmd: "set" }));
    }
  );

["mention", "welcome", "goodbye"].forEach((k) =>
  settingHandler(k, k.charAt(0).toUpperCase() + k.slice(1))
);

Zoe({
  pattern: "glist",
  fromMe: true,
  type: "group",
  desc: lang.GLIST_DESC
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);

  const result = await m.client.groupRequestParticipantsList(m.jid);
  if (!result.length) return await m.reply(lang.TP_ALERT);

  return await m.reply(`${lang.HPJR_ALERT}:\n\n` + result.map((id) => `+${id.jid.split('@')[0]}`).join('\n'));
});


Zoe({
  pattern: "gapprove",
  fromMe: true,
  type: "group",
  desc: lang.GAPPROVE_DESC,
}, async (m, match) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);

  if (!match) return await m.reply(lang.AE_ALERT);

  const result = await m.client.groupRequestParticipantsList(m.jid);
  if (!result.length) return await m.reply(lang.TP_ALERT);

  const jids = match === "all"
    ? result.map(id => id.jid)
    : match.split(',').map(num => num.trim().replace(/\+/g, '').replace(/\s/g, '') + '@s.whatsapp.net')
      .filter(jid => jid !== '@s.whatsapp.net');

  for (const jid of jids) {
    if (!result.map(id => id.jid).includes(jid)) return await m.reply(`+${jid.split('@')[0]} ${lang.NR_ALERT}`);
    await m.client.groupRequestParticipantsUpdate(m.jid, [jid], 'approve');
    await sleep(1000);
  }

  await m.reply(match === "all" ? `${lang.ARP_ALERT}` : `${lang.SRP_ALERT}`);
});


Zoe({
  pattern: "greject",
  fromMe: true,
  type: "group",
  desc: lang.GREJECT_DESC,
}, async (m, match) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);

  if (!match) return await m.reply(lang.RE_ALERT);

  const result = await m.client.groupRequestParticipantsList(m.jid);
  if (!result.length) return await m.reply(lang.HPJR_ALERT);

  const jids = match === "all"
    ? result.map(id => id.jid)
    : match.split(',').map(num => num.trim().replace(/\+/g, '').replace(/\s/g, '') + '@s.whatsapp.net')
      .filter(jid => jid !== '@s.whatsapp.net');

  for (const jid of jids) {
    if (!result.map(id => id.jid).includes(jid)) return await m.reply(`+${jid.split('@')[0]} ${lang.NR_ALERT}`);
  }

  await m.reply(match === "all" ? `${lang.ARR_ALERT}` : `${lang.SRR_ALERT}`);
});

Zoe(
  {
    pattern: "poll",
    alias: ["vote"],
    fromMe: true,
    desc: lang.POLL_DESC,
    type: "group",
  },
  async (m, match, client) => {
    if (!m.isGroup) return m.reply(lang.G_ALERT);
    try {
      match = match || m.reply_message?.text;
      const parts = match?.split(/[,|;]/);

      if (!parts || parts.length < 2) {
        return m.reply(
          `_*Example:* ${PREFIX}poll title |option1|option2|option3..._`
        );
      }

      const [title, ...opts] = parts;
      const { participants } = await client.groupMetadata(m.jid);

      const values = opts.map((name) => ({ name, id: "" })).slice(0, 10);

      return m.sendPoll(m.jid, {
        name: title,
        values,
        withPrefix: false,
        onlyOnce: true,
        participates: participants.map((p) => p.id),
        selectableCount: true,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

Zoe(
  {
    pattern: "add",
    type: "group",
    fromMe: true,
    desc: lang.ADD_DESC
  },
  async (message, match, client) => {
    if (!message.isGroup) return message.reply(lang.G_ALERT);
    match = message.mention?.[0] || message.reply_message?.sender || match;
    const num = match?.replace(/\D/g, "");
    const jid = num + "@s.whatsapp.net";

    if (!(await isAdmin(message, client.user.id))) {
      return message.reply(lang.INA_ALERT);
    }

    if (!num) {
      return message.reply(lang.RUN_ALERT);
    }

    if (!(await client.onWhatsApp(jid)).some((j) => j.jid === jid)) {
      return message.reply(lang.UNF_ALERT_ALERT);
    }

    const [{ status }] = await client.groupParticipantsUpdate(
      message.jid,
      [jid],
      "add"
    );

    const replies = {
      200: (num) => format(lang.ADD_ALERTS["200"], { num }),
      403: () => lang.ADD_ALERTS["403"],
      408: async (num, jid, message, client) => {
        await message.reply(format(lang.ADD_ALERTS["408"], { num }), { mentions: [jid] });
        const code = await client.groupInviteCode(message.jid);
        return client.sendMessage(jid, {
          text: `https://chat.whatsapp.com/${code}`,
        });
      },
      401: (num) => format(lang.ADD_ALERTS["401"], { num }),
      409: (num) => format(lang.ADD_ALERTS["409"], { num }),
    };

    return typeof replies[status] === "function"
      ? replies[status]()
      : message.reply(replies[status] || "error code: " + status, {
        mentions: [jid],
      });
  }
);

Zoe(
  {
    pattern: "kick",
    type: "group",
    fromMe: true,
    desc: lang.KICK_DESC,
  },
  async (m, match) => {
    if (!m.isGroup) return m.reply(lang.G_ALERT);
    match = m.mention?.[0] || m.reply_message?.sender || match;

    if (!match) {
      return await m.reply(lang.RUN_ALERT);
    }

    if (!(await isAdmin(m, m.client.user.id))) {
      return await m.reply(lang.INA_ALERT);
    }

    const jid = parsedJid(match);
    await m.client.groupParticipantsUpdate(m.jid, jid, "remove");

    await m.reply(`*@${jid[0].split("@")[0]} ${lang.KS_ALERT}*`, {
      mentions: jid,
    });
  });

Zoe({
  pattern: "promote",
  fromMe: true,
  type: "group",
  desc: lang.PROMOTE_DESC,
}, async (m, match) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);
  match = m.mention?.[0] || m.reply_message?.sender || match;
  if (!match) return await m.reply(lang.U_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) {
    return await m.reply(lang.INA_ALERT);
  }

  let jid = parsedJid(match);
  await m.client.groupParticipantsUpdate(m.jid, jid, "promote");
  return await m.reply(`*@${jid[0].split("@")[0]} ${lang.PS_ALERT}*`, { mentions: jid });
});


Zoe({
  pattern: "demote",
  fromMe: true,
  type: "group",
  desc: lang.DEMOTE_DESC,
}, async (m, match) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);
  match = m.mention?.[0] || m.reply_message?.sender || match;
  if (!match) return await m.reply(lang.U_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) {
    return await m.reply(lang.INA_ALERT);
  }

  let jid = parsedJid(match);
  await m.client.groupParticipantsUpdate(m.jid, jid, "demote");
  return await m.reply(`*@${jid[0].split("@")[0]} ${lang.DS_ALERT}*`, { mentions: jid });
});


Zoe({
  pattern: "invite",
  fromMe: true,
  type: "group",
  desc: lang.INVITE_DESC
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) {
    return await m.reply(lang.INA_ALERT);
  }

  const data = await m.client.groupInviteCode(m.jid);
  return await m.reply(`https://chat.whatsapp.com/${data}`);
});

Zoe({
  pattern: "mute",
  fromMe: true,
  type: "group",
  desc: lang.MUTE_DESC,
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) {
    return await m.reply(lang.INA_ALERT);
  }

  const mutem = await m.reply(lang.MUTE.MUTING);
  await sleep(500);
  await m.client.groupSettingUpdate(m.jid, "announcement");
  return await mutem.edit(lang.MUTE.MUTED);
});


Zoe({
  pattern: "unmute",
  fromMe: true,
  type: "group",
  desc: lang.UNMUTE_DESC,
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) {
    return await m.reply(lang.INA_ALERT);
  }


  const unmutem = await m.reply(lang.MUTE.UNMUTING);
  await sleep(500);
  await m.client.groupSettingUpdate(m.jid, "not_announcement");
  return await unmutem.edit(lang.MUTE.UNMUTED);
});

Zoe({
  pattern: 'revoke',
  fromMe: true,
  type: 'group',
  desc: lang.REVOKE_DESC,
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);
  await m.client.groupRevokeInvite(m.jid);
  return await m.reply(lang.GLR_ALERT);
});


Zoe({
  pattern: 'join',
  fromMe: true,
  desc: lang.JOIN_DESC,
  type: 'group'
}, async (m, match) => {
  match = (await extractUrlsFromText(match || m.reply_message?.text))[0];
  if (!match) return await m.reply(lang.NGL_ALERT);
  const regex = /^(https?:\/\/)?(chat\.whatsapp\.com\/[A-Za-z0-9]{20,})/i;
  const matchClean = match.match(regex);
  if (!matchClean) {
    return await m.reply(lang.NWL_ALERT);
  }
  if (match.includes('chat.whatsapp.com')) {
    const groupCode = match.split('https://chat.whatsapp.com/')[1];
    const joinResult = await m.client.groupAcceptInvite(groupCode);
    if (joinResult) return await m.reply('*Joined Group!*');
    await m.reply(lang.IGL_ALERT);
  } else {
    await m.reply(lang.IGL_ALERT);
  }
});


Zoe({
  pattern: 'left',
  fromMe: true,
  type: 'group',
  desc: lang.LEFT_DESC
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);
  await m.client.groupLeave(m.jid);
});


Zoe({
  pattern: 'lock',
  fromMe: true,
  type: 'group',
  desc: lang.LOCK_DESC,
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);

  const meta = await m.client.groupMetadata(m.jid);
  if (meta.restrict) return await m.reply(lang.AAM_ALERT);

  await m.client.groupSettingUpdate(m.jid, 'locked');
  return await m.reply(lang.OAM_ALERT);
});


Zoe({
  pattern: 'unlock',
  fromMe: true,
  type: 'group',
  desc: lang.UNLOCK_DESC,
}, async (m) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);

  const meta = await m.client.groupMetadata(m.jid);
  if (!meta.restrict) return await m.reply(lang.AEM_ALERT);

  await m.client.groupSettingUpdate(m.jid, 'unlocked');
  return await m.reply(lang.OEM_ALERT);
});


Zoe({
  pattern: 'gname',
  fromMe: true,
  type: 'group',
  desc: lang.GNAME_DESC,
}, async (m, match) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  match = match || m.reply_message?.text;
  if (!match) return await m.reply(lang.NGN_ALERT);

  const meta = await m.client.groupMetadata(m.jid);
  if (!meta.restrict) {
    await m.client.groupUpdateSubject(m.jid, match);
    return await m.reply(lang.SU_ALERT + match);
  }

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);
  await m.client.groupUpdateSubject(m.jid, match);
  return await m.reply(lang.SU_ALERT + match);
});


Zoe({
  pattern: 'gdesc',
  fromMe: true,
  type: 'group',
  desc: lang.GDESC_DESC,
}, async (m, match) => {
  if (!m.isGroup) return m.reply(lang.G_ALERT);

  match = match || m.reply_message?.text;
  if (!match) return await m.reply(lang.NGD_ALERT);

  const meta = await m.client.groupMetadata(m.jid);
  if (!meta.restrict) {
    await m.client.groupUpdateDescription(m.jid, match);
    return await m.reply(lang.DU_ALERT);
  }

  if (!(await isAdmin(m, m.client.user.id))) return await m.reply(lang.INA_ALERT);
  await m.client.groupUpdateDescription(m.jid, match);
  return await m.reply(lang.DU_ALERT);
});


Zoe({
  pattern: 'gjid',
  fromMe: true,
  type: 'group',
  desc: lang.GJID_DESC,
}, async (m, match) => {
  if (match === "gjids" && m.isGroup) {
    const list = await m.client.groupFetchAllParticipating();
    let g = Object.values(list).map(group => `JID: ${group.id}\nGroup Name: ${group.subject}\n`).join("\n");
    return m.reply(`*All Group Jid*\n\n${g}`);
  }
  if (match === "ajid" && m.isGroup) {
    const { participants, subject } = await m.client.groupMetadata(m.jid);
    const admins = participants.filter(u => u.admin).map(u => u.id).join("\n\n");
    return m.reply(`*Group Admins Jid*\n\n*Group Name:* ${subject}\n*Admins:*\n\n${admins}`);
  }

  if (match === "pjid" && m.isGroup) {
    const { participants, subject } = await m.client.groupMetadata(m.jid);
    const participantJids = participants.map(u => u.id).join("\n\n");
    return m.reply(`*Group Participants Jid*\n\n*Group Name:* ${subject}\n*All Participants Jid:*\n\n${participantJids}`);
  }

  if (m.isGroup) {
    return await m.sendPoll(m.jid, {
      name: "\n*Group Jid Info 🎏*\n",
      values: [
        { name: "Group Admins Jid", id: `${PREFIX}gjid ajid` },
        { name: "Group Participants Jid", id: `${PREFIX}gjid pjid` },
        { name: "All Group Jids", id: `${PREFIX}gjid gjids` }
      ],
      withPrefix: true,
      onlyOnce: false,
      participates: [m.sender],
      selectableCount: true,
    });
  }
  const list = await m.client.groupFetchAllParticipating();
  let g = Object.values(list).map(group => `JID: ${group.id}\nGroup Name: ${group.subject}\n`).join("\n");
  return m.reply(`*All Group Jid*\n\n${g}`);
});

Zoe({
  pattern: 'ginfo',
  fromMe: true,
  type: 'group',
  desc: lang.GINFO_DESC,
}, async (m, match) => {
  match = (await extractUrlsFromText(match || m.reply_message?.text))[0];
  if (!match && m.isGroup) match = `https://chat.whatsapp.com/${await m.client.groupInviteCode(m.jid)}`;
  if (!match) return await m.reply(lang.NWL_ALERT);

  const [link, invite] = match.match(/chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i) || [];
  if (!invite) return await m.reply(lang.IGL_ALERT);

  const response = await m.client.groupGetInviteInfo(invite);
  if (!response.id) return await m.reply(lang.IGL_ALERT);

  const url = await m.client.profilePictureUrl(response.id, 'image').catch(() => "https://files.catbox.moe/2fguma.png");

  await m.client.sendMessage(m.jid, {
    image: { url: url },
    mimetype: "image/jpeg",
    caption:
      "*Group Info*\n\n" +
      "ID: " + response.id + "\n" +
      "Subject: " + response.subject + "\n" +
      "Owner: " + (response.owner ? response.owner.split('@')[0] : 'unknown') + "\n" +
      "Size: " + response.size + "\n" +
      "Restrict: " + response.restrict + "\n" +
      "Announce: " + response.announce + "\n" +
      "Creation: " + require('moment-timezone')(response.creation * 1000)
        .tz('Asia/Kolkata')
        .format('DD/MM/YYYY HH:mm:ss') + "\n\n" +
      "Description:\n" + (response.desc || "No description")
  });
});

Zoe({
  pattern: "create",
  fromMe: true,
  desc: lang.CREATE_DESC,
  type: "group",
}, async (m, match) => {
  let gName = match || m.pushName;
  if (!m.reply_message?.sender) return m.reply(lang.CG_ALERT);

  const group = await m.client.groupCreate(gName, [m.reply_message.sender, m.sender]);
  await m.reply(lang.SC_ALERT);
});
/**
* Tag Command
*/
Zoe(
  {
    pattern: "tag",
    fromMe: true,
    desc: lang.TAG_DESC,
    type: "group",
  },
  async (m, x, c) => {
    m.client = c;

    if (!m.isGroup) {
      return c.sendMessage(m.jid, {
        text: `@${m.sender.split("@")[0]}`,
        mentions: [m.sender],
      });
    }

    let g = await c.groupMetadata(m.jid).catch(() => { });
    if (!g) return m.reply("Failed to fetch group metadata.");

    let p = g.participants;
    let admins = p.filter((v) => v.admin).map((v) => v.id);

    let text = "";
    let ids = [];

    if (["all", "everyone"].includes(x)) {
      ids = p.map((v) => v.id);
    } else if (["admin", "admins"].includes(x)) {
      ids = admins;
    } else if (["me", "mee"].includes(x)) {
      return c.sendMessage(m.jid, {
        text: `@${m.sender.split("@")[0]}`,
        mentions: [m.sender],
      });
    } else if (x || (m.reply_message && m.reply_message.text)) {
      text = x || m.reply_message.text;
      ids = p.map((v) => v.id);
    } else if (m.reply_message) {
      return c.forwardMessage(m.jid, m.reply_message.data, {
        mentions: p.map((v) => v.id),
      });
    } else {
      return m.reply(
        "*Example :* \n" +
        "_*tag all*_\n" +
        "_*tag admin*_\n" +
        "_*tag me*_\n" +
        "_*tag text*_\n" + lang.TM_ALERT
      );
    }

    if (!text) {
      text = ids
        .map((id, i) => `${i + 1}. @${id.split("@")[0]}`)
        .join("\n");
    }

    return c.sendMessage(m.jid, { text, mentions: ids });
  }
);

/**
* Reaction Poll
*/
Zoe(
  {
    pattern: "rvote",
    fromMe: mode,
    desc: lang.RVOTE_DESC,
    type: "group",
    alias: ["reactvote"],
  },
  async (m, x, c) => {
    if (!m.isGroup) return m.reply(lang.G_ALERT);

    let input = x?.trim().toLowerCase();
    if (!input) {
      return m.reply(
        "Invalid input.\n" +
        "eg- rvote whats your favorite fruit|🍉-watermelon|🍌-banana|🍍-pineapple"
      );
    }

    if (input === "get") {
      if (
        !m.reply_message?.text?.includes("╭╺╺╺╺╺╡𝗥𝗲𝗮𝗰𝘁𝗶𝗼𝗻 𝗣𝗼𝗹𝗹")
      ) {
        return m.reply(lang.RPM_ALERT);
      }
      return m.reply(await getPollResults(m.reply_message.id, true));
    }

    let [q, ...opts] = input.split("|").map((e) => e.trim());
    if (!q || !opts.length) {
      return m.reply("❌ Use: Question | emoji - label | ...");
    }

    let pollText =
      `╭╺╺╺╺╺╡𝗥𝗲𝗮𝗰𝘁𝗶𝗼𝗻 𝗣𝗼𝗹𝗹\n` +
      `╎\n` +
      `╎ 𝗤: _${q[0].toUpperCase() + q.slice(1)}_\n` +
      `╎\n`;

    let valid = 0;
    for (let opt of opts) {
      let [emoji, label] = opt.split("-").map((s) => s.trim());
      if (emoji && label) {
        pollText += `╎ ${emoji} - ${label}\n`;
        valid = 1;
      }
    }

    if (!valid) return m.reply('❌ Use "emoji - label" format.');

    let msg = await m.reply(pollText + "╰╺╺╺╺╺╺╺╺╺╺╡");

    return handlePollMessage({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
    });
  }
);
