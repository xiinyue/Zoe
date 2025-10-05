const { Zoe, mode, getJson, PREFIX, isYouTubeUrl, ytdl } = require("../lib/Index");
let { getString } = require("./func/lang");
let lang = getString("downloader");

async function hIG(m, q, label = "Instagram Downloader") {
  if (q?.startsWith("dl-url:")) {
    return m.sendFromUrl(q.replace("dl-url:", ""));
  }

  q ||= m.reply_message?.text;

  if (!q) {
    return m.reply(label.includes("Story") ? lang.SL_ALERT : lang.IL_ALERT);
  }

  const { data } = await getJson(
    `https://badan-tools-web.onrender.com/api/insta?url=${q}`
  );

  if (!data?.length) return m.reply(lang.NF_ALERT);

  const options = data.map((u, i) => ({
    name: `${i + 1}/${data.length}`,
    id: `${PREFIX}insta dl-url:${u.url}`,
  }));

  if (options.length === 1) return m.sendFromUrl(data[0].url);

  if (m.jid.endsWith("@g.us")) {
    return m.sendPoll(m.jid, {
      name: `*${label.toUpperCase()}*`,
      values: options.slice(0, 10),
      withPrefix: true,
      onlyOnce: false,
      participates: [m.sender],
      selectableCount: true,
    });
  }

  const textBlock =
    `╭╺╺╺╺╺\n╎\n` +
    data
      .map((u, i) => `╎ *${i + 1}/${data.length}*  *~${u.type}~*`)
      .join`\n` +
    `\n╎\n╎ ${lang.SNR_ALERT}\n╰╺╺╺╺╺╺╺╺╺╺╡ `;

  return m.sendButton(m.jid, {
    jid: m.jid,
    button: [],
    header: {
      title: label,
      subtitle: `𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫\n\n\n★${q}`,
      hasMediaAttachment: false,
    },
    footer: { text: "𝐙𝐨𝐞 𝐗𝐃 🎽" },
    body: { text: textBlock },
  });
}

async function ytdlFn(m, q, type = "audio") {
  if (!q) return m.reply(lang.IVM_ALERT);
  if (!isYouTubeUrl(q)) return m.reply(lang.YL_ALERT);

  const d = type === "audio" ? await ytdl(q, "mp3") : await ytdl(q, "720p");
  const mime = type === "audio" ? "audio/mpeg" : "video/mp4";

  const payload = {
    [type]: { url: d.url },
    mimetype: mime,
    contextInfo: {
      externalAdReply: {
        title: d.title,
        body: "𝘡𝘰𝘦 - 𝘟𝘥",
        mediaType: 1,
        thumbnailUrl: d.thumbnail,
        renderLargerThumbnail: true,
      },
    },
  };

  return m.client.sendMessage(m.jid, payload, { quoted: m.data });
}

Zoe(
  {
    pattern: "insta",
    fromMe: mode,
    desc: lang.INSTA_DESC,
    type: "downloader",
  },
  async (m, q) => hIG(m, q, "Instagram Downloader")
);

Zoe(
  {
    pattern: "story",
    fromMe: mode,
    desc: lang.STORY_DESC,
    type: "downloader",
  },
  async (m, q) => hIG(m, q, "Instagram Story Downloader")
);

Zoe(
  {
    pattern: "ytv",
    fromMe: mode,
    desc: lang.YTV_DESC,
    type: "downloader",
  },
  async (m, q) => ytdlFn(m, q, "video")
);

Zoe(
  {
    pattern: "yta",
    fromMe: mode,
    desc: lang.YTV_DESC,
    type: "downloader",
  },
  async (m, q) => ytdlFn(m, q, "audio")
);
