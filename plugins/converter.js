const { Zoe, mode, isViewOnce, toAudio, AudioMetaData, cutMedia, toVideo, extractUrlsFromText, sendUrl } = require("../lib/Index");
const fancy = require("./func/fancy");
let { getString } = require("./func/lang");
let lang = getString("converter");
const config = require("../config");
const { Image } = require("node-webpmux");
const { fromBuffer } = require("file-type");

Zoe(
  { pattern: "url", fromMe: mode, desc: lang.URL_DESC, type: "converter" },
  async m => {
    const validTypes = ["videoMessage", "imageMessage", "stickerMessage", "audioMessage"];
    if (!validTypes.includes(m.reply_message?.type)) {
      return m.reply(lang.AVIS_ALERT);
    }
    await sendUrl(m, m.reply_message);
  }
);

Zoe(
  {
    pattern: "fancy",
    fromMe: mode,
    desc: lang.FANCY_DESC,
    type: "converter",
  },
  async (m, match) => {
    if (!match && !m.reply_message?.text) {
      return m.reply(lang.FANCY_ALERT +
          fancy.list("Text Here", fancy)
      );
    }

    let id = match.match(/\d/g)?.join("");

    try {
      if (!id && !m.reply_message) return m.reply(fancy.list(match, fancy));
      return m.reply(
        fancy.apply(
          fancy[parseInt(id) - 1],
          m.reply_message?.text || match.replace(id, "")
        )
      );
    } catch {
      return m.reply(lang.NSF);
    }
  }
);

Zoe(
  {
    pattern: "vv",
    fromMe: mode,
    desc: lang.VV_DESC,
    type: "converter",
  },
  async (m) => {
    if (!m.reply_message) return m.reply(lang.VO_ALERT);
    if (!isViewOnce(m)) return m.reply(lang.NVO_ALERT);

    return m.forwardMessage(m.jid, m.reply_message.data, { readViewOnce: true });
  }
);

Zoe(
  {
    pattern: "ptv",
    fromMe: mode,
    desc: lang.PTV_DESC,
    type: "converter",
  },
  async (m, _, client) => {
    if (!m.reply_message) return m.reply(lang.V_ALERT);
    if (m.reply_message.type !== "videoMessage")
      return m.reply(lang.NV_ALERT);

    let media = await m.reply_message.download();
    return client.sendMessage(
      m.jid,
      { video: media, mimetype: "video/mp4", ptv: true },
      { quoted: m.data }
    );
  }
);

Zoe(
  {
    pattern: "gif",
    fromMe: mode,
    desc: lang.GIF_DESC,
    type: "converter",
  },
  async (m, match, client) => {
    if (!m.reply_message) return m.reply(lang.V_ALERT);
    if (m.reply_message.type !== "videoMessage")
      return m.reply(lang.NV_ALERT);

    let media = await m.reply_message.download();
    let msg = { video: media, mimetype: "video/mp4", gifPlayback: true };
    if (match) msg.caption = match;

    return client.sendMessage(m.jid, msg, { quoted: m.data });
  }
);

Zoe(
  {
    pattern: "sticker",
    fromMe: mode,
    desc: lang.STICKER_DESC,
    type: "converter",
  },
  async (m) => {
    if (!m.reply_message)
      return m.reply(lang.VI_ALERT);

    let t = m.reply_message;

    if (t.type !== "videoMessage" && t.type !== "imageMessage")
      return m.reply(lang.NVI_ALERT);

    if (t.type === "videoMessage" && t.msg.videoMessage.seconds > 5)
      return m.reply(lang.DBV_ALERT);

    let media = await t.download();
    return m.sendSticker(m.jid, media);
  }
);

/**
 * Convert Video/Audio to MP3
 */
Zoe(
  {
    pattern: "mp3",
    fromMe: mode,
    desc: lang.MP3_DESC,
    type: "converter",
  },
  async (m, _, client) => {
    if (!m.reply_message)
      return m.reply(lang.AV_ALERT);

    if (!["videoMessage", "audioMessage"].includes(m.reply_message.type))
      return m.reply(lang.NAV_ALERT);

    let buff = await m.reply_message.download();
    const co = config.AUDIO_DATA.split(";");
    let audio = await AudioMetaData(buff, {
      title: co[0],
      body: co[1],
      image: co[2]
    });
    
    return client.sendMessage(
      m.jid,
      { audio, mimetype: "audio/mpeg" },
      { quoted: m.data }
    );
  }
);

/**
 * Take (Change Metadata)
 */
Zoe(
  {
    pattern: "take",
    fromMe: mode,
    desc: lang.TAKE_DESC,
    type: "converter",
  },
  async (m, match, c) => {
    if (!m.reply_message)
      return m.reply(lang.VAS_ALERT);

    let buf = await m.reply_message.download();
    let type = m.reply_message.type;

    let d = (
      match ||
      (type == "stickerMessage"
        ? config.STICKER_PACKDATA
        : config.AUDIO_DATA)
    ).split(";");

    if (["videoMessage", "audioMessage"].includes(type)) {
      try {
        let audio = await AudioMetaData(buf, {
          title: d[0],
          body: d[1],
          image: d[2],
        });
        return c.sendMessage(
          m.jid,
          { audio, mimetype: "audio/mpeg" },
          { quoted: m.data }
        );
      } catch {
        return m.reply(lang.F_ALERT);
      }
    } else if (type == "stickerMessage") {
      return m.sendSticker(m.jid, buf, {
        packname: d[0],
        author: d[1],
      });
    }
  }
);

Zoe(
  {
    pattern: "doc",
    fromMe: mode,
    desc: lang.DOC_DESC,
    type: "converter",
  },
  async (m, x, c) => {
    m.client = c;
    x = (x || "converted media").replace(/[^A-Za-z0-9]/g, "-");

    if (
      !["videoMessage", "audioMessage", "imageMessage"].includes(
        m.reply_message?.type
      )
    )
      return m.reply(lang.NAVI_ALERT);

    let b = await m.reply_message.download();
    let { ext: e, mime: f } = await fromBuffer(b);

    return await c.sendMessage(m.jid, {
      document: b,
      mimetype: f,
      fileName: x + "." + e,
    });
  }
);

Zoe(
  {
    pattern: 'trim',
    fromMe: mode,
    desc: lang.TRIM_DESC,
    type: 'converter',
  },
  async (m, match, client) => {
    if (
      !(
        m.reply_message?.type === 'audioMessage' ||
        m.reply_message?.type === 'videoMessage'
      )
    ) {
      return m.reply(lang.NAV_ALERT);
    }
    if (!match) {
      return m.reply(lang.TM_ALERT);
    }

    try {
      const [startRaw, endRaw] = match.split(',');
      const parseTime = (t) => {
        if (!t) return '0';
        if (t.includes(':')) {
          const [min, sec] = t.split(':').map(Number);
          return String(min * 60 + sec);
        }
        return t.trim();
      };
      const start = parseTime(startRaw);
      const end = parseTime(endRaw);
      const buff = await m.reply_message.download();
      const isAudio = m.reply_message.type === 'audioMessage';
      const trimmed = await cutMedia(buff, start, end, isAudio);
      if (isAudio) {
        return client.sendMessage(m.jid, {
          audio: trimmed,
          mimetype: 'audio/mpeg',
        });
      } else {
        return client.sendMessage(m.jid, {
          video: trimmed,
          mimetype: 'video/mp4',
        });
      }
    } catch (err) {
      return m.reply(lang.F_ALERT);
    }
  }
);

Zoe(
  {
    pattern: 'black',
    fromMe: mode,
    desc: lang.BLACK_DESC,
    type: 'converter',
  },
  async (m, match, client) => {
    if (
      !(
        m.reply_message?.type === 'audioMessage' ||
        m.reply_message?.type === 'videoMessage'
      )
    ) {
      return m.reply(lang.NAV_ALERT);
    }
    try {
      const buff = await m.reply_message.download();
      const blackVid = await toVideo(buff, "mp3");
      return client.sendMessage(m.jid, {
        video: blackVid,
        mimetype: 'video/mp4',
      });
    } catch (err) {
      return m.reply(lang.F_ALERT);
    }
  }
);

Zoe(
  {
    pattern: "tovv",
    fromMe: mode,
    desc: lang.TOVV_DESC,
    type: "converter",
  },
  async (message) => {
    if (!message.reply_message) return message.reply(lang.AVI_ALERT);
    let media = await message.reply_message.download();
    if (!media) return message.reply(lang.F_ALERT);

    let types = {
      imageMessage: ["image", "image/jpeg"],
      videoMessage: ["video", "video/mp4"],
      audioMessage: ["audio", "audio/mpeg"],
    };

    let t = types[message.reply_message.type];
    if (!t) return message.reply(lang.NAVI_ALERT);

    return message.client.sendMessage(
      message.jid,
      { [t[0]]: media, mimetype: t[1], viewOnce: true },
      { quoted: message.data }
    );
  }
);

Zoe(
  {
    pattern: "toimg",
    fromMe: mode,
    desc: lang.TOIMG_DESC,
    type: "converter",
  },
  async (message) => {
    if (!message.reply_message) return message.reply(lang.S_ALERT);
    let media = await message.reply_message.download();
    if (!media) return message.reply(lang.F_ALERT);

    if (
      message.reply_message?.type !== "stickerMessage" || 
      message.reply_message.msg?.stickerMessage?.isAnimated
    ) {
      return message.reply(lang.WNAS_ALERT);
    }

    return message.client.sendMessage(
      message.jid,
      { image: media, mimetype: "image/jpeg" },
      { quoted: message.data }
    );
  }
);

Zoe(
  {
    pattern: "tomp4",
    fromMe: mode,
    desc: lang.TOMP4_DESC,
    type: "converter",
  },
  async (message) => {
    if (!message.reply_message) return message.reply(lang.S_ALERT);
    let media = await message.reply_message.download();
    if (!media) return message.reply(lang.F_ALERT);

    if (message.reply_message?.type !== "stickerMessage") {
      return message.reply("need a sticker");
    }
    
    if (!message.reply_message.msg?.stickerMessage?.isAnimated) {
      return message.reply(lang.WAS_ALERT);
    }

    return message.client.sendMessage(
      message.jid,
      { video: media, mimetype: "video/mp4" },
      { quoted: message.data }
    );
  }
);

Zoe(
  {
    pattern: "upload",
    fromMe: mode,
    desc: lang.UPLOAD_DESC,
    type: "converter",
  },
  async (message, match) => {
    match = (await extractUrlsFromText(match || message.reply_message?.text))[0];
    if (!match) return message.reply(lang.L_ALERT);
    const allowedExtensions = ["png", "jpg", "jpeg", "mp4", "mp3", "zip", "gif", "webp"];
    try {
      const url = new URL(match);
      const pathname = url.pathname.toLowerCase();
      const isValid = allowedExtensions.some(ext => pathname.endsWith("." + ext));

      if (!isValid) {
        return message.reply(lang.TFS_ALERT + allowedExtensions.join(", "));
      }

      return await message.sendFromUrl(match);
    } catch (err) {
      return message.reply(lang.F_ALERT);
    }
  }
);

