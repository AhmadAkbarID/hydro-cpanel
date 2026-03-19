/*
• SCRIPT INI GRATIS 100%
• BEBAS RECODE 
• JANGAN DI JUAL
*/

require('./settings');

// ====== REQUIRE AREA & LIB START ======

const { 
    modul 
} = require('./lib/module');
const {
    runtime,
    formatp
} = require('./lib/function');

// ====== LIB END & MODULE START ======

const { 
    downloadContentFromMessage, 
    extractImageThumb 
} = require('socketon');
const axios = require('axios');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');

// ====== MODULE END & CONST START ======

const { 
    baileys, 
    os, 
    moment,
    crypto
} = modul;
const { 
    BufferJSON, 
    WA_DEFAULT_EPHEMERAL, 
    generateWAMessageFromContent, 
    proto, 
    generateWAMessageContent, 
    generateWAMessage, 
    prepareWAMessageMedia, 
    areJidsSameUser, 
    getContentType, 
    generateForwardMessageContent 
} = baileys;
// ====== MODULE END & SCRAPE START ======



// ====== SCRAPE END & REQUIRE AREA ======

// ==========================================================

module.exports = hydro = async (hydro, m, chatUpdate, store) => {
try {
    if (!m || !m.message) return;

    m.chat = m.key.remoteJid || '';
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = m.key.fromMe ? (hydro.user.id.split(':')[0]+'@s.whatsapp.net' || hydro.user.id) : (m.key.participant || m.key.remoteJid || '');
    m.pushName = m.pushName || "Misterius";
    
    m.mtype = getContentType(m.message);
    if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
        m.message = m.message[m.mtype].message;
        m.mtype = getContentType(m.message);
    }
    
    // ----------------------------------------------------
    
    m.mtype = getContentType(m.message);
    if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
        m.message = m.message[m.mtype].message;
        m.mtype = getContentType(m.message);
    }
    
    // ----------------------------------------------------
    
    const msgHelper = require('./lib/src/message')(hydro, m, chatUpdate, store);
    m = msgHelper.m;
    const reply = msgHelper.reply;
    const appenTextMessage = msgHelper.appenTextMessage;
    const rawContext = m.message?.[m.mtype]?.contextInfo;
    
    if (rawContext && rawContext.quotedMessage) {
        let qMsg = rawContext.quotedMessage;
        
        if (qMsg.viewOnceMessageV2) qMsg = qMsg.viewOnceMessageV2.message;
        else if (qMsg.viewOnceMessage) qMsg = qMsg.viewOnceMessage.message;
        else if (qMsg.viewOnceMessageV2Extension) qMsg = qMsg.viewOnceMessageV2Extension.message;

        let qType = getContentType(qMsg) || Object.keys(qMsg)[0];
        
        m.quoted = {
            key: {
                remoteJid: m.chat,
                fromMe: rawContext.participant === hydro.user.id.split(':')[0] + '@s.whatsapp.net',
                id: rawContext.stanzaId,
                participant: rawContext.participant
            },
            message: qMsg,
            mtype: qType,
            msg: qMsg[qType],
            sender: rawContext.participant,
            text: qMsg.conversation || qMsg[qType]?.text || qMsg[qType]?.caption || '',
            fakeObj: {
                key: {
                    remoteJid: m.chat,
                    fromMe: rawContext.participant === hydro.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: rawContext.stanzaId,
                    participant: rawContext.participant
                },
                message: qMsg
            },
            download: async () => {
                let mediaType = qType.replace('Message', '');
                let stream = await downloadContentFromMessage(qMsg[qType], mediaType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            }
        };
    }

    m.download = async () => {
        let mediaType = m.mtype.replace('Message', '');
        let stream = await downloadContentFromMessage(m.message[m.mtype], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
    
    // ----------------------------------------------------

    const type = m.mtype;
    
    let body = '';
    if (m.mtype === 'interactiveResponseMessage' || m.message?.interactiveResponseMessage) {
        try {
            let interMsg = m.message.interactiveResponseMessage || m.message[m.mtype];
            body = JSON.parse(interMsg.nativeFlowResponseMessage.paramsJson).id;
        } catch (e) {
            body = '';
        }
    } else {
        body = (m.mtype === 'conversation') ? m.message.conversation : 
             (m.mtype === 'imageMessage') ? m.message.imageMessage?.caption : 
             (m.mtype === 'videoMessage') ? m.message.videoMessage?.caption : 
             (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage?.text : 
             (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage?.selectedButtonId : 
             (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId : 
             (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage?.selectedId : 
             m.text || '';
    }

    body = (typeof body === 'string') ? body : '';

    let budy = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || '';
    const prefix = global.prefix ? (Array.isArray(global.prefix) ? (global.prefix.slice().sort((a, b) => b.length - a.length).find(p => body.startsWith(p)) || global.prefix[0]) : global.prefix) : "";
    
    const isCmd = body.startsWith(prefix)
    const from = m.chat
    const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : ""
    const args = body.trim().split(/ +/).slice(1)
    
    const pushname = m.pushName
    const botNumber = await hydro.decodeJid(hydro.user.id)
    const Ahmad = [...(global.owner || []), global.ownernomer, global.botnumber]
        .map(v => v ? v.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '')
        .includes(m.sender);
    
    const rawId = String(m.key.id || '');
    const baseId = rawId.split('-')[0];

    let isOtherBot = false;

    if (baseId.startsWith('BAE5')) isOtherBot = true;
    if (baseId.match(/[^0-9A-F]/gi)) isOtherBot = true;
    if (baseId.length !== 32 && !baseId.startsWith('3EB0') && !baseId.startsWith('3A')) isOtherBot = true;

    if (isOtherBot && !Ahmad && !m.key.fromMe) return;
    
    const text = args.join(" ")
    const q = text
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    
    // Media Checks
    const isMedia = /image|video|sticker|audio/.test(mime)
    const isImage = (type == 'imageMessage')
    const isVideo = (type == 'videoMessage')
    const isAudio = (type == 'audioMessage')
    const isSticker = (type == 'stickerMessage')

    store.groupMetadata = store.groupMetadata || {};
    const groupMetadata = m.isGroup ? store.groupMetadata[m.chat] || (store.groupMetadata[m.chat] = await hydro.groupMetadata(m.chat).catch(e => {})) : '';
    const groupName = m.isGroup ? groupMetadata.subject : ''
    const participants = m.isGroup ? await groupMetadata.participants : ''

    if (m.isGroup && m.sender.endsWith("@lid")) {
        m.sender = participants.find(p => p.lid === m.sender)?.jid || m.sender;
    }

    const groupAdmins = m.isGroup ? participants.filter((v) => v.admin !== null).map((i) => i.jid || i.id) : [];
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
    const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    
    const sender = m.sender
    const senderNumber = sender ? sender.split('@')[0] : ''

    const mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    const mentionByTag = type == 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.mentionedJid : []
    const mentionByReply = type == 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.participant || '' : ''
    
    const isChannel = m.chat.endsWith('@newsletter');
    
    if (m.message && !m.key.fromMe) { 
        const timeLog = chalk.green(new Date().toISOString().slice(0, 19).replace('T', ' '));
        const msgLog = chalk.blue(budy || m.mtype);
        

        if (isChannel) {
            console.log(`
┌───────── [ CHANNEL CHAT LOG ] ─────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 📢 Channel   : ${chalk.magenta(pushname || 'Saluran')} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
            `);
        } else if (m.isGroup) {
            console.log(`
┌────────── [ GROUP CHAT LOG ] ──────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
│ 🏠 Group     : ${chalk.yellow(groupName)} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
            `);
        } else {
            console.log(`
┌───────── [ PRIVATE CHAT LOG ] ─────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
└────────────────────────────────────────┘
            `);
        }
    }
    // ==============================================
    
switch (command) {
    case 'menu': 
    case 'help': { 

        m.react('🌊');
        
        let teks = (`
✨━━━〔 🏞️ *𝐌𝐞𝐧𝐮 𝐔𝐭𝐚𝐦𝐚* 〕━━━✨

➤ 👤 Usᴇʀ : *${pushname}*
➤ 👑 Rᴀɴᴋ : *${Ahmad ? 'Pemilik 👨‍💻' : 'Free User'}*

✨━━━〔 📱 *𝐒𝐨𝐬𝐢𝐚𝐥 𝐌𝐞𝐝𝐢𝐚* 〕━━━✨

➤ 🪀 Wʜᴀᴛsᴀᴘᴘ : *wa.me/${global.ownernomer}*
➤ 📨 Tᴇʟᴇɢʀᴀᴍ : *t.me/${global.tele}*
➤ 📸 ɪɴsᴛᴀɢʀᴀᴍ : *www.instagram.com/${global.ig}*

✨━━━〔 🤖 *𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭* 〕━━━✨

➤ 🤖 Nᴀᴍᴀ Bᴏᴛ : *${global.botname}*
➤ ⏱️ Aᴋᴛɪғ Sᴇʟᴀᴍᴀ : *${runtime(process.uptime())}*
➤ 👾 Vᴇʀsɪ : *1.0.0*

✨━━━〔 🎉 *𝐓𝐞𝐧𝐭𝐚𝐧𝐠 𝐊𝐚𝐦𝐢* 〕━━━✨

ʀᴇsᴘᴏɴ ᴄᴇᴘᴀᴛ <1 ᴅᴇᴛɪᴋ!
ʀᴜᴛɪɴ ᴘᴇɴɢᴇᴄᴇᴋᴀɴ
sᴜᴘᴘᴏʀᴛ ᴠᴘs/ᴘᴀɴᴇʟ

╭─〔 💡 *𝐊𝐚𝐭𝐚 𝐏𝐞𝐧𝐠𝐞𝐦𝐛𝐚𝐧𝐠* 〕─╮
│ _"Kami terus berinovasi_  
│ _untuk memberikan pengalaman_  
│ _terbaik dalam setiap interaksi."_
╰────────────────────╯

✨━━━〔 📝 *𝐃𝐚𝐟𝐭𝐚𝐫 𝐅𝐢𝐭𝐮𝐫* 〕━━━✨
- .ᴀᴅᴅᴏᴡɴᴇʀ ɴᴏᴍᴏʀ
- .ᴀᴅᴅʀᴇꜱᴇʟʟᴇʀɢʙ
- .ᴀᴅᴅʀᴇꜱᴇʟʟᴇʀ ɴᴏᴍᴏʀ
- .ᴄᴀᴅᴍɪɴ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .ᴄꜱᴇʀᴠᴇʀ ʀᴀᴍ,ᴇᴍᴀɪʟ,ɴᴀᴍᴀ
- .ᴄᴜꜱᴇʀ ɴᴀᴍᴀ,ᴇᴍᴀɪʟ,ᴩᴡ (ᴏᴩꜱɪᴏɴᴀʟ)
- .1ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .2ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .3ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .4ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .5ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .6ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .7ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .8ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .9ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .10ɢʙ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ
- .ᴜɴʟɪ ɴᴀᴍᴀ,ɴᴏᴍᴏʀ

🚀 *Pᴏᴡᴇʀᴇᴅ Bʏ ${global.botname}*
`).trim();

        try {
            await hydro.sendMessage(m.chat, { 
                image: fs.readFileSync('./media/menu.jpg'), 
                caption: teks 
            }, { quoted: m });
            
            await hydro.sendMessage(m.chat, { 
                audio: fs.readFileSync('./media/menu.mp3'), 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: m });
            
        } catch (err) {
            console.log(err);
        }
    }
    break;
case 'addowner': {
    if (!Ahmad) return reply(global.mess.only.owner);
    if (!text) return reply(global.mess.query.text + '\n*Contoh:* .addowner 628123456789');
    
    let nomernya = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let dataOwner = JSON.parse(fs.readFileSync('./database/owner.json'));
    
    if (dataOwner.includes(nomernya)) return reply('Nomor tersebut sudah menjadi Owner!');
    dataOwner.push(nomernya);
    fs.writeFileSync('./database/owner.json', JSON.stringify(dataOwner, null, 2));
    reply(`Berhasil menambahkan ${nomernya.split('@')[0]} sebagai Owner!`);
}
break;

case 'addreseller': {
    if (!Ahmad) return reply(global.mess.only.owner);
    if (!text) return reply(global.mess.query.text + '\n*Contoh:* .addreseller 628123456789');
    
    let nomernya = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let dataReseller = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    if (dataReseller.reseller.includes(nomernya)) return reply('Nomor tersebut sudah menjadi Reseller VIP!');
    dataReseller.reseller.push(nomernya);
    fs.writeFileSync('./database/reseller.json', JSON.stringify(dataReseller, null, 2));
    reply(`Berhasil menambahkan ${nomernya.split('@')[0]} sebagai Reseller (Bisa buat dimana saja)!`);
}
break;

case 'addresellergb': {
    if (!Ahmad) return reply(global.mess.only.owner);
    if (!m.isGroup) return reply(global.mess.only.group);
    
    let dataReseller = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    if (dataReseller.resellergb.includes(m.chat)) return reply('Grup ini sudah terdaftar sebagai Reseller Group!');
    dataReseller.resellergb.push(m.chat);
    fs.writeFileSync('./database/reseller.json', JSON.stringify(dataReseller, null, 2));
    reply(`Berhasil menambahkan grup ini sebagai Reseller Group!`);
}
break;

case 'delreseller': {
    if (!Ahmad) return reply(global.mess.only.owner);
    if (!text) return reply(global.mess.query.text + '\n*Contoh:* .delreseller 628123456789');
    
    let nomernya = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let dataReseller = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    if (!dataReseller.reseller.includes(nomernya)) return reply('Nomor tersebut bukan Reseller.');
    dataReseller.reseller = dataReseller.reseller.filter(v => v !== nomernya);
    fs.writeFileSync('./database/reseller.json', JSON.stringify(dataReseller, null, 2));
    reply(`Berhasil menghapus status Reseller dari ${nomernya.split('@')[0]}!`);
}
break;

case 'delresellergb': {
    if (!Ahmad) return reply(global.mess.only.owner);
    if (!m.isGroup) return reply(global.mess.only.group);
    
    let dataReseller = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    if (!dataReseller.resellergb.includes(m.chat)) return reply('Grup ini belum terdaftar sebagai Reseller Group.');
    dataReseller.resellergb = dataReseller.resellergb.filter(v => v !== m.chat);
    fs.writeFileSync('./database/reseller.json', JSON.stringify(dataReseller, null, 2));
    reply(`Berhasil mencabut status Reseller Group dari grup ini!`);
}
break;

case 'cadmin': {
    let ownerData = JSON.parse(fs.readFileSync('./database/owner.json'));
    let isOwnerBot = Ahmad || ownerData.includes(m.sender);
    
    if (!isOwnerBot) return reply(global.mess.only.owner);
    if (!text.includes(',')) return reply(global.mess.query.text + '\n*Format salah!*\nContoh: .cadmin ahmad,62812345678');
    
    reply(global.mess.wait);
    let [nama, nomor] = text.split(',');
    let target = nomor.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let username = nama.toLowerCase().replace(/[^a-z0-9]/g, '');
    let email = username + global.email;
    let password = username + crypto.randomBytes(4).toString('hex');

    let f = await fetch(global.domain + "/api/application/users", {
        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + global.apikey },
        body: JSON.stringify({ email: email, username: username, first_name: nama.trim(), last_name: "Admin", language: "en", root_admin: true, password: password })
    });
    let data = await f.json();
    if (data.errors) return reply(`*Gagal Membuat Admin:*\n${data.errors[0].detail}\n\n${global.mess.error.fitur}`);

    let msgAdmin = `*AKUN ADMIN PANEL BERHASIL DIBUAT!*\n\n*Username:* ${username}\n*Email:* ${email}\n*Password:* ${password}\n*Login:* ${global.domain}\n\n_Mohon simpan data ini baik-baik._`;
    await hydro.sendMessage(target, { text: msgAdmin });
    reply(`Berhasil membuat Admin! Data login telah dikirimkan ke nomor ${nomor}`);
}
break;
case 'cuser': {

    global.panelCd = global.panelCd || { grup: {}, personal: {} };
    const waktuCd = 5 * 60 * 1000
    
    let ownerData = JSON.parse(fs.readFileSync('./database/owner.json'));
    let resellerData = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    let isOwnerBot = Ahmad || ownerData.includes(m.sender);
    let isReseller = resellerData.reseller.includes(m.sender);
    let isResellerGb = m.isGroup && resellerData.resellergb.includes(m.chat);

    let hasAccess = false, tipeCd = '', keyCd = '';
    
    if (isOwnerBot) {
        hasAccess = true; 
    } else if (isReseller) { 
        hasAccess = true; 
        tipeCd = 'personal'; 
        keyCd = m.sender; 
    } else if (isResellerGb) { 
        hasAccess = true; 
        tipeCd = 'grup'; 
        keyCd = m.chat; 
    }

    if (!hasAccess) return reply(global.mess.only.premium);

    let now = Date.now();
    if (tipeCd === 'grup' && global.panelCd.grup[keyCd] && now - global.panelCd.grup[keyCd] < waktuCd) {
        let sisa = Math.ceil((waktuCd - (now - global.panelCd.grup[keyCd])) / 1000 / 60);
        return reply(`⏳ *Sabar Bang!* Grup ini sedang cooldown.\nTunggu *${sisa} menit* lagi sebelum bisa buat panel.`);
    } else if (tipeCd === 'personal' && global.panelCd.personal[keyCd] && now - global.panelCd.personal[keyCd] < waktuCd) {
        let sisa = Math.ceil((waktuCd - (now - global.panelCd.personal[keyCd])) / 1000 / 60);
        return reply(`⏳ *Sabar Bang!* Kamu sedang cooldown personal.\nTunggu *${sisa} menit* lagi sebelum bisa buat panel.`);
    }

    if (!text.includes(',')) return reply(global.mess.query.text + '\n*Format salah!*\nContoh: .cuser ahmad,ahmad@email.com,password123\natau\n.cuser ahmad,ahmad@email.com');
    
    let [nama, email, pw] = text.split(',');
    let password = pw ? pw.trim() : nama.toLowerCase() + crypto.randomBytes(3).toString('hex');
    let username = nama.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    let f = await fetch(global.domain + "/api/application/users", {
        method: "POST", 
        headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + global.apikey },
        body: JSON.stringify({ 
            email: email.trim(), 
            username: username, 
            first_name: nama.trim(), 
            last_name: "User", 
            language: "en", 
            password: password 
        })
    });
    
    let data = await f.json();
    if (data.errors) return reply(`*Gagal Membuat User:*\n${data.errors[0].detail}\n\n${global.mess.error.fitur}`);
    
    if (tipeCd === 'grup') global.panelCd.grup[keyCd] = now;
    if (tipeCd === 'personal') global.panelCd.personal[keyCd] = now;

    reply(`*Berhasil membuat User Pterodactyl! ${global.mess.success}*\n\n*ID:* ${data.attributes.id}\n*Username:* ${username}\n*Email:* ${email.trim()}\n*Password:* ${password}\n*Login:* ${global.domain}`);
}
break;
case 'cserver': {

    global.panelCd = global.panelCd || { grup: {}, personal: {} };
    const waktuCd = 5 * 60 * 1000
    
    let ownerData = JSON.parse(fs.readFileSync('./database/owner.json'));
    let resellerData = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    let isOwnerBot = Ahmad || ownerData.includes(m.sender);
    let isReseller = resellerData.reseller.includes(m.sender);
    let isResellerGb = m.isGroup && resellerData.resellergb.includes(m.chat);

    let hasAccess = false, tipeCd = '', keyCd = '';
    if (isOwnerBot) hasAccess = true;
    else if (isReseller) { hasAccess = true; tipeCd = 'personal'; keyCd = m.sender; }
    else if (isResellerGb) { hasAccess = true; tipeCd = 'grup'; keyCd = m.chat; }

    if (!hasAccess) return reply(global.mess.only.premium);

    let now = Date.now();
    if (tipeCd === 'grup' && global.panelCd.grup[keyCd] && now - global.panelCd.grup[keyCd] < waktuCd) {
        let sisa = Math.ceil((waktuCd - (now - global.panelCd.grup[keyCd])) / 1000 / 60);
        return reply(`⏳ *Sabar Bang!* Grup ini sedang cooldown.\nTunggu *${sisa} menit* lagi sebelum bisa buat panel.`);
    } else if (tipeCd === 'personal' && global.panelCd.personal[keyCd] && now - global.panelCd.personal[keyCd] < waktuCd) {
        let sisa = Math.ceil((waktuCd - (now - global.panelCd.personal[keyCd])) / 1000 / 60);
        return reply(`⏳ *Sabar Bang!* Kamu sedang cooldown personal.\nTunggu *${sisa} menit* lagi sebelum bisa buat panel.`);
    }

    if (!text.includes(',')) return reply(global.mess.query.text + '\n*Format salah!*\nContoh: .cserver 3gb,email@target.com,ServerKu');
    
    reply(global.mess.wait);
    
    let [planInput, email, namaServer] = text.split(',');
    if (!planInput || !email || !namaServer) return reply('*Format salah!*\nContoh: .cserver 3gb,email@target.com,ServerKu');

    let plan = planInput.toLowerCase().trim();
    var ram, disknya, cpu;
    switch(plan){
        case "1gb": ram = "1024"; disknya = "5123"; cpu = "40"; break;
        case "2gb": ram = "2048"; disknya = "5123"; cpu = "80"; break;
        case "3gb": ram = "3064"; disknya = "5123"; cpu = "120"; break;
        case "4gb": ram = "4123"; disknya = "5123"; cpu = "160"; break;
        case "5gb": ram = "5123"; disknya = "5123"; cpu = "200"; break;
        case "6gb": ram = "6123"; disknya = "5123"; cpu = "220"; break;
        case "7gb": ram = "7123"; disknya = "5123"; cpu = "250"; break;
        case "8gb": ram = "8123"; disknya = "5123"; cpu = "280"; break;
        case "9gb": ram = "9123"; disknya = "5123"; cpu = "300"; break;
        case "10gb": ram = "10240"; disknya = "5123"; cpu = "400"; break;
        case "unlimited": case "unli": ram = "0"; disknya = "0"; cpu = "0"; break;
        default: return reply('*Plan tidak valid!*\nPilih: 1gb, 2gb, 3gb, 4gb, 5gb, 6gb, 7gb, 8gb, 9gb, 10gb, unli');
    }
    
    let searchUser = await fetch(global.domain + `/api/application/users?filter[email]=${email.trim()}`, {
        method: "GET", headers: { "Accept": "application/json", "Authorization": "Bearer " + global.apikey }
    });
    let resUser = await searchUser.json();
    if (resUser.data.length === 0) return reply('*Gagal:* User tidak ditemukan! Pastikan email sudah terdaftar.');
    let userId = resUser.data[0].attributes.id;

    let getEgg = await fetch(global.domain + `/api/application/nests/${global.nestid}/eggs/${global.egg}`, {
        method: "GET", headers: { "Accept": "application/json", "Authorization": "Bearer " + global.apikey }
    });
    let eggData = await getEgg.json();

    let createSrv = await fetch(global.domain + "/api/application/servers", {
        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + global.apikey },
        body: JSON.stringify({
            name: namaServer.trim(), user: userId, egg: parseInt(global.egg), nodes: global.nodeid1, docker_image: "ghcr.io/parkervcp/yolks:nodejs_21", startup: eggData.attributes.startup,
            environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
            limits: { memory: ram, swap: 0, disk: disknya, io: 500, cpu: cpu },
            feature_limits: { databases: 5, backups: 5, allocations: 5 }, deploy: { locations: [parseInt(global.loc)], dedicated_ip: false, port_range: [] },
        })
    });

    let srvRes = await createSrv.json();
    if (srvRes.errors) return reply(`*Gagal Membuat Server:*\n${srvRes.errors[0].detail}\n\n${global.mess.error.fitur}`);
   
    if (tipeCd === 'grup') global.panelCd.grup[keyCd] = now;
    if (tipeCd === 'personal') global.panelCd.personal[keyCd] = now;

    reply(`*Berhasil Membuat Server!*\n\n*Server ID:* ${srvRes.attributes.id}\n*Nama Server:* ${namaServer.trim()}\n*Plan:* ${plan.toUpperCase()}\n*RAM:* ${ram === "0" ? "Unlimited" : ram + " MB"}\n*CPU:* ${cpu === "0" ? "Unlimited" : cpu + "%"}\n*Disk:* ${disknya === "0" ? "Unlimited" : disknya + " MB"}`);
}
break;
case "1gb": case "2gb": case "3gb": case "4gb": case "5gb":
case "6gb": case "7gb": case "8gb": case "9gb": case "10gb":
case "unlimited": case "unli": {

    global.panelCd = global.panelCd || { grup: {}, personal: {} };
    const waktuCd = 5 * 60 * 1000
    
    let ownerData = JSON.parse(fs.readFileSync('./database/owner.json'));
    let resellerData = JSON.parse(fs.readFileSync('./database/reseller.json'));
    
    let isOwnerBot = Ahmad || ownerData.includes(m.sender);
    let isReseller = resellerData.reseller.includes(m.sender);
    let isResellerGb = m.isGroup && resellerData.resellergb.includes(m.chat);

    let hasAccess = false, tipeCd = '', keyCd = '';
    if (isOwnerBot) hasAccess = true;
    else if (isReseller) { hasAccess = true; tipeCd = 'personal'; keyCd = m.sender; }
    else if (isResellerGb) { hasAccess = true; tipeCd = 'grup'; keyCd = m.chat; }

    if (!hasAccess) return reply(global.mess.only.premium);

    let now = Date.now();
    if (tipeCd === 'grup' && global.panelCd.grup[keyCd] && now - global.panelCd.grup[keyCd] < waktuCd) {
        let sisa = Math.ceil((waktuCd - (now - global.panelCd.grup[keyCd])) / 1000 / 60);
        return reply(`⏳ *Sabar Bang!* Grup cooldown.\nTunggu *${sisa} menit* lagi.`);
    } else if (tipeCd === 'personal' && global.panelCd.personal[keyCd] && now - global.panelCd.personal[keyCd] < waktuCd) {
        let sisa = Math.ceil((waktuCd - (now - global.panelCd.personal[keyCd])) / 1000 / 60);
        return reply(`⏳ *Sabar Bang!* Kamu sedang cooldown.\nTunggu *${sisa} menit* lagi.`);
    }

    if (!text) return reply(`${global.mess.query.text}\n\n*Contoh Command :*\n*.${command}* username,6283XX`);
  
    let nomor, usernem;
    let tek = text.split(",");
    
    if (tek.length > 1) {
        let [users, nom] = text.split(",");
        if (!users || !nom) return reply(`*Contoh Command :*\n\n*.${command}* username,6283XX`);
        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase().replace(/[^a-z0-9]/g, '');
    } else {
        usernem = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        nomor = m.chat; 
    }

    var onWa = await hydro.onWhatsApp(nomor.split("@")[0]);
    if (onWa.length < 1) return reply("Nomor target tidak terdaftar di WhatsApp!");

    var ram, disknya, cpu;
    switch(command){
        case "1gb": ram = "1024"; disknya = "5123"; cpu = "40"; break;
        case "2gb": ram = "2048"; disknya = "5123"; cpu = "80"; break;
        case "3gb": ram = "3064"; disknya = "5123"; cpu = "120"; break;
        case "4gb": ram = "4123"; disknya = "5123"; cpu = "160"; break;
        case "5gb": ram = "5123"; disknya = "5123"; cpu = "200"; break;
        case "6gb": ram = "6123"; disknya = "5123"; cpu = "220"; break;
        case "7gb": ram = "7123"; disknya = "5123"; cpu = "250"; break;
        case "8gb": ram = "8123"; disknya = "5123"; cpu = "280"; break;
        case "9gb": ram = "9123"; disknya = "5123"; cpu = "300"; break;
        case "10gb": ram = "10240"; disknya = "5123"; cpu = "400"; break;
        case "unlimited": case "unli": ram = "0"; disknya = "0"; cpu = "0"; break;
    }

    let username = usernem;
    let email = username + global.email; 
    let password = username + crypto.randomBytes(3).toString('hex');

    let f = await fetch(global.domain + "/api/application/users", {
        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + global.apikey },
        body: JSON.stringify({ email: email, username: username, first_name: username, last_name: "Server", language: "en", password: password.toString() })
    });
    
    let data = await f.json();
    if (data.errors) return reply(`*Error dari Pterodactyl:*\n${data.errors[0].detail}\n\n${global.mess.error.fitur}`);
    
    let getEgg = await fetch(global.domain + `/api/application/nests/${global.nestid}/eggs/${global.egg}`, {
        method: "GET", headers: { "Accept": "application/json", "Authorization": "Bearer " + global.apikey }
    });
    let eggData = await getEgg.json();

    let f2 = await fetch(global.domain + "/api/application/servers", {
        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + global.apikey },
        body: JSON.stringify({
            name: username + " Server", user: data.attributes.id, egg: parseInt(global.egg), nodes: global.nodeid1, docker_image: "ghcr.io/parkervcp/yolks:nodejs_21", startup: eggData.attributes.startup,
            environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
            limits: { memory: ram, swap: 0, disk: disknya, io: 500, cpu: cpu },
            feature_limits: { databases: 5, backups: 5, allocations: 5 }, deploy: { locations: [parseInt(global.loc)], dedicated_ip: false, port_range: [] },
        })
    });

    let result = await f2.json();
    if (result.errors) return reply(`*Error Create Server:*\n${result.errors[0].detail}\n\n${global.mess.error.fitur}`);
    
    if (tipeCd === 'grup') global.panelCd.grup[keyCd] = now;
    if (tipeCd === 'personal') global.panelCd.personal[keyCd] = now;

    let server = result.attributes;
    let orang = m.chat !== nomor ? nomor : m.chat;

    if (m.chat !== nomor) reply(`Akun panel *${username}* berhasil dibuat!\nData login telah dikirimkan ke WhatsApp target.`);

    let teks = `
*Berikut Detail Akun Panel Kamu 📦*

*📡 ID Server:* ${server.id}
*👤 Username:* ${data.attributes.username}
*🔐 Password:* ${password}
*🗓️ Dibuat:* ${new Date().toLocaleDateString('id-ID')}

*🌐 Spesifikasi Server*
* Ram: *${ram === "0" ? "Unlimited" : (parseInt(ram)/1024).toFixed(0) + " GB"}*
* Disk: *${disknya === "0" ? "Unlimited" : disknya + " MB"}*
* CPU: *${cpu === "0" ? "Unlimited" : cpu + "%"}*
* Login: *${global.domain}*

*Syarat & Ketentuan :*
* Expired panel 1 bulan
* Simpan data ini sebaik mungkin
* Jangan lupa ganti password di pengaturan panel
    `.trim();
    
    await hydro.sendMessage(orang, { text: teks });
}
break;
} // End Switch

} catch (err) {
    console.log(util.format(err))
}
}

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
})

function autoClearSession() {
    const sessionDir = './furina';
    const tempDir = './temp'; 
    const clearInterval = 4 * 60 * 60 * 1000; // 4 Jam
    
    setInterval(async () => {
        try {
            if (fs.existsSync(sessionDir)) {
                const files = fs.readdirSync(sessionDir);
                const filteredFiles = files.filter(file => 
                    file.startsWith('pre-key') ||
                    file.startsWith('sender-key') ||
                    file.startsWith('session-') ||
                    file.startsWith('app-state')
                );

                if (filteredFiles.length > 0) {
                    console.log(chalk.yellow.bold(`📂 [AUTO CLEAN] Starting session cleanup...`));
                    filteredFiles.forEach(file => {
                        fs.unlinkSync(path.join(sessionDir, file));
                    });
                    console.log(chalk.green.bold(`🗃️ [AUTO CLEAN] Successfully removed ${filteredFiles.length} session files!`));
                }
            }

            if (fs.existsSync(tempDir)) {
                const tempFiles = fs.readdirSync(tempDir);
                if (tempFiles.length > 0) {
                    tempFiles.forEach(file => {
                        fs.unlinkSync(path.join(tempDir, file));
                    });
                    console.log(chalk.cyan.bold(`🗑️ [TEMP CLEAN] Successfully deleted ${tempFiles.length} files from temp!`));
                }
            }
        } catch (error) {
            console.error(chalk.red.bold(`📑 [AUTO CLEAN ERROR]`), error);
        }
    }, clearInterval);
}

autoClearSession();

// ======================== Auto Reload File ===================== \\
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`[ UPDATE ] '${__filename}'`))
    delete require.cache[file]
    require(file)
})