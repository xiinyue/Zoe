const { Zoe, mode, identifyMusic, yts, getBuffer } = require("../lib/Index");
let { getString } = require("./func/lang");
let lang = getString("search");

Zoe(
  {
    pattern: "find",
    alias: ["track"],
    fromMe: mode,
    desc: lang.FIND_DESC,
    type: "search",
  },
  async (m, match, client) => {
    if (!m.reply_message) return m.reply(lang.AV_ALERT);
    if (!["videoMessage", "audioMessage"].includes(m.reply_message.type)) {
      return m.reply(lang.NAV_ALERT);
    }

    let result = await identifyMusic(m);
    if (result.data === "No result") return m.reply(lang.NRF_ALERT);

    let d = result.data;
 let caption = `╭╺╺╺╺╺╡ 𝗙𝗶𝗻𝗱 𝗠𝘂𝘀𝗶𝗰
╎
╎ 𝗧𝗶𝘁𝗹𝗲: _${d.title}_
╎ 𝗔𝗿𝘁𝗶𝘀𝘁𝘀: _${d.artists}_
╎ 𝗔𝗹𝗯𝘂𝗺: _${d.album}_
╎ 𝗚𝗲𝗻𝗿𝗲𝘀: _${d.genres}_
╎ 𝗥𝗲𝗹𝗲𝗮𝘀𝗲: _${d.release_date}_
╎
╎ 𝟭: 𝗔𝘂𝗱𝗶𝗼
╎ 𝟮: 𝗩𝗶𝗱𝗲𝗼
╎ 𝟯: 𝗦𝗽𝗼𝘁𝗶𝗳𝘆 𝗟𝗶𝗻𝗸
╎
╎ ` + lang.SNR_ALERT + "\n╰╺╺╺╺╺╺╺╺╺╺╡";

    return m.sendButton(m.jid, {
      jid: m.jid,
      button: [],
      header: {
        title: "",
        subtitle: `𝗙𝗶𝗻𝗱 𝗠𝘂𝘀𝗶𝗰\n\n\n★ ${d.spotify}`,
        hasMediaAttachment: false,
      },
      footer: { text: " 𝐙𝐨𝐞 𝐗𝐃 " },
      body: { text: caption },
    },
    {
      quoted: m.data
    });
  }
);

Zoe(
  {
    pattern: "yts",
    alias: ["play", "ytsearch"],
    fromMe: mode,
    desc: lang.YTS_DESC,
    type: "search",
  },
  async (m, match, client) => {
    match = match || m.reply_message?.text;
    if (!match) return m.reply(lang.NQS_ALERT);

    let results = await yts(match);
    if (!results) return m.reply(lang.NRF_ALERT);

    let d = results[0];
    let caption = `╭╺╺╺╺╺╡ 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗲𝗮𝗿𝗰𝗵
╎
╎ 𝗧𝗶𝘁𝗹𝗲: _${d.title}_
╎ 𝗔𝘂𝘁𝗵𝗼𝗿: _${d.author}_
╎ 𝗩𝗶𝗲𝘄𝘀: _${d.views}_
╎ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: _${d.duration}_
╎ 𝗥𝗲𝗹𝗲𝗮𝘀𝗲: _${d.publishedTime}_
╎ 𝗟𝗶𝗻𝗸: _${d.url}_
╎
╎ 𝟭: 𝗔𝘂𝗱𝗶𝗼
╎ 𝟮: 𝗩𝗶𝗱𝗲𝗼
╎
╎ ` + lang.SNR_ALERT + "\n╰╺╺╺╺╺╺╺╺╺╺╡";

    let imgBuffer = await getBuffer(d.image);
    let imgBase64 = imgBuffer.toString("base64");

    return m.sendButton(
      m.jid,
      {
        client,
        jid: m.jid,
        button: [],
        header: {
          title: "",
          subtitle: `𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗲𝗮𝗿𝗰𝗵\n\n\n★ ${d.url}`,
          hasMediaAttachment: true,
        },
        footer: { text: " © 𝘛𝘦𝘢𝘮 𝘟𝘥 " },
        body: { text: caption },
        opt: {
          media: { image: { url: d.image } },
          type: "imageMessage",
        },
      },
      {
        quoted: {
          key: {
            remoteJid: "919747257996@s.whatsapp.net",
            fromMe: false,
            id: "0",
          },
          message: {
            productMessage: {
              product: {
                productImage: {
                  url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMJm7uprlhmqJXG7j31UdV6pL78Ce5bfe_QLV54gybPNajqqX2Vje8cv5x24BNWUGXWA2sSblrSJg5IxVg2RvLqOtBkJqW_XzdK99AG3Q?ccb=9-4&oh=01_Q5Aa1gFa2IyiZmrzWJ6fDNZpjZRzY0r9bjCq3BwUmtAOpRzOFA&oe=68663DF5&_nc_sid=e6ed6c&mms3=true",
                  mimetype: "image/jpeg",
                  mediaKeyTimestamp: "1748947095",
                  jpegThumbnail: imgBase64,
                },
                productId: "28239419759037767",
                title: "𝚭͓ᴏ̹͍͛ᴇ͛-𝚾͓̻֠ᴅ˞ 🎽",
                description: "Nothing",
                currencyCode: "INR",
                priceAmount1000: "99000",
                salePriceAmount1000: "89000",
                productImageCount: 2,
              },
              businessOwnerJid: "919747257996@s.whatsapp.net",
            },
          },
        },
      }
    );
  }
);
