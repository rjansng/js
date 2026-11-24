// ============================================================
// Loon 腳本：Shopee Aegis 加解密
// 支援：aegisEncrypt / aegisDecrypt / generateS / generateEncryptFID / generateShakeS
// ============================================================

var Aegis = (function () {
  'use strict';

  // ========== 常量 ==========
  var AES_KEY_HEX = '663d313d397733722f752f2f662b2f2f3559325a4245385a5a45517351507147';
  var ZERO_IV = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var B64CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  // ========== S-Box（硬編碼，避免生成算法誤差） ==========
  var SBOX = [
    99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240,
    173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49,
    21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82,
    59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239,
    170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182,
    218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79,
    220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98,
    145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37,
    46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185,
    134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137,
    13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22
  ];

  var INV_SBOX = new Array(256);
  for (var _i = 0; _i < 256; _i++) INV_SBOX[SBOX[_i]] = _i;

  // ========== GF(2^8) 運算 ==========
  function xtime(x) { return ((x << 1) ^ ((x & 0x80) ? 0x1b : 0)) & 0xff; }
  function gmul(a, b) {
    var r = 0;
    for (var i = 0; i < 8; i++) {
      if (b & 1) r ^= a;
      b >>= 1;
      a = xtime(a);
    }
    return r & 0xff;
  }

  // ========== 密鑰擴展（AES-256: Nk=8, Nr=14） ==========
  function expandKey(key) {
    var Nk = key.length / 4;      // 8 for AES-256
    var Nr = Nk + 6;              // 14
    var total = (Nr + 1) * 4;     // 60 words
    var w = new Array(total);
    var RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

    for (var i = 0; i < Nk; i++) {
      w[i] = ((key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3]) >>> 0;
    }
    for (i = Nk; i < total; i++) {
      var t = w[i - 1];
      if (i % Nk === 0) {
        // RotWord + SubWord + Rcon
        t = ((t << 8) | (t >>> 24)) >>> 0;
        t = (((SBOX[(t >>> 24) & 0xff]) << 24) |
          ((SBOX[(t >>> 16) & 0xff]) << 16) |
          ((SBOX[(t >>> 8) & 0xff]) << 8) |
          (SBOX[t & 0xff])) >>> 0;
        t = (t ^ (RCON[(i / Nk) - 1] << 24)) >>> 0;
      } else if (Nk > 6 && i % Nk === 4) {
        // 只做 SubWord
        t = (((SBOX[(t >>> 24) & 0xff]) << 24) |
          ((SBOX[(t >>> 16) & 0xff]) << 16) |
          ((SBOX[(t >>> 8) & 0xff]) << 8) |
          (SBOX[t & 0xff])) >>> 0;
      }
      w[i] = (w[i - Nk] ^ t) >>> 0;
    }
    return { w: w, Nr: Nr };
  }

  // 從 word 中取第 k 個 byte
  function wByte(word, k) { return (word >>> (24 - k * 8)) & 0xff; }

  // ========== ShiftRows / InvShiftRows ==========
  function shiftRows(s) {
    var t;
    t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
    t = s[2]; s[2] = s[10]; s[10] = t;
    t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
  }
  function invShiftRows(s) {
    var t;
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t;
    t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
  }

  // ========== 加密單個區塊 ==========
  function encryptBlock(input, keys) {
    var s = input.slice();
    // AddRoundKey (round 0)
    for (var i = 0; i < 16; i++) s[i] ^= wByte(keys.w[i >> 2], i & 3);

    for (var r = 1; r < keys.Nr; r++) {
      for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
      shiftRows(s);
      // MixColumns
      for (var c = 0; c < 4; c++) {
        var a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
        s[4 * c] = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
        s[4 * c + 1] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
        s[4 * c + 2] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
        s[4 * c + 3] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
      }
      // AddRoundKey
      for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[r * 4 + (i >> 2)], i & 3);
    }
    // 最後一輪
    for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
    shiftRows(s);
    for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[keys.Nr * 4 + (i >> 2)], i & 3);
    return s;
  }

  // ========== 解密單個區塊 ==========
  function decryptBlock(input, keys) {
    var s = input.slice();
    for (var i = 0; i < 16; i++) s[i] ^= wByte(keys.w[keys.Nr * 4 + (i >> 2)], i & 3);

    for (var r = keys.Nr - 1; r >= 1; r--) {
      invShiftRows(s);
      for (i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
      for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[r * 4 + (i >> 2)], i & 3);
      // InvMixColumns
      for (var c = 0; c < 4; c++) {
        var a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
        s[4 * c] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
        s[4 * c + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
        s[4 * c + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
        s[4 * c + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
      }
    }
    invShiftRows(s);
    for (i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
    for (i = 0; i < 16; i++) s[i] ^= wByte(keys.w[i >> 2], i & 3);
    return s;
  }

  // ========== CBC 模式 ==========
  function cbcEncrypt(plain, key, iv) {
    var keys = expandKey(key);
    var out = [];
    var prev = iv.slice();
    for (var off = 0; off < plain.length; off += 16) {
      var blk = new Array(16);
      for (var i = 0; i < 16; i++) blk[i] = plain[off + i] ^ prev[i];
      prev = encryptBlock(blk, keys);
      for (i = 0; i < 16; i++) out.push(prev[i]);
    }
    return out;
  }

  function cbcDecrypt(cipher, key, iv) {
    var keys = expandKey(key);
    var out = [];
    var prev = iv.slice();
    for (var off = 0; off < cipher.length; off += 16) {
      var blk = cipher.slice(off, off + 16);
      var dec = decryptBlock(blk, keys);
      for (var i = 0; i < 16; i++) out.push(dec[i] ^ prev[i]);
      prev = blk;
    }
    return out;
  }

  // ========== Base64 ==========
  function b64Encode(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i];
      var b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      var b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      out += B64CHARS[b0 >> 2];
      out += B64CHARS[((b0 & 3) << 4) | (b1 >> 4)];
      out += i + 1 < bytes.length ? B64CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
      out += i + 2 < bytes.length ? B64CHARS[b2 & 63] : '=';
    }
    return out;
  }

  function b64Decode(str) {
    var out = [];
    var clean = str.replace(/=+$/, '').replace(/[\r\n\s]/g, '');
    var buf = 0, bits = 0;
    for (var i = 0; i < clean.length; i++) {
      var v = B64CHARS.indexOf(clean[i]);
      if (v < 0) continue;
      buf = (buf << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push((buf >> bits) & 0xff);
      }
    }
    return out;
  }

  // ========== UTF-8 ==========
  function utf8Encode(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c < 0xd800 || c >= 0xe000) {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      } else {
        i++;
        var c2 = str.charCodeAt(i);
        var cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f),
          0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      }
    }
    return out;
  }

  function utf8Decode(bytes) {
    var out = '', i = 0;
    while (i < bytes.length) {
      var b = bytes[i++];
      if (b < 0x80) out += String.fromCharCode(b);
      else if (b < 0xe0) out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
      else if (b < 0xf0) out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
      else {
        var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
        cp -= 0x10000;
        out += String.fromCharCode(0xd800 | (cp >> 10), 0xdc00 | (cp & 0x3ff));
      }
    }
    return out;
  }

  function hexToBytes(hex) {
    var out = [];
    for (var i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
    return out;
  }

  // ========== PKCS7 Padding ==========
  function pkcs7Pad(bytes) {
    var pad = 16 - (bytes.length % 16);
    for (var i = 0; i < pad; i++) bytes.push(pad);
    return bytes;
  }
  function pkcs7Unpad(bytes) {
    if (bytes.length === 0) return bytes;
    var pad = bytes[bytes.length - 1];
    if (pad < 1 || pad > 16) return bytes;
    return bytes.slice(0, bytes.length - pad);
  }

  // ========== Aegis 核心 ==========
  var AES_KEY = hexToBytes(AES_KEY_HEX);

  function aegisEncrypt(plain) {
    var pt = utf8Encode(plain);
    pkcs7Pad(pt);
    var ct = cbcEncrypt(pt, AES_KEY, ZERO_IV);
    return b64Encode(ZERO_IV.concat(ct));
  }

  function aegisDecrypt(cipherBase64) {
    var buf = b64Decode(cipherBase64);
    if (buf.length < 32 || (buf.length - 16) % 16 !== 0) {
      throw new Error('密文長度不符：' + buf.length);
    }
    var iv = buf.slice(0, 16);
    var ct = buf.slice(16);
    var pt = cbcDecrypt(ct, AES_KEY, iv);
    pt = pkcs7Unpad(pt);
    return utf8Decode(pt);
  }

  // ========== 業務封裝 ==========
  function generateS(nowTimestampMs, uid, k) {
    if (k === undefined || k === null) k = 1;
    return aegisEncrypt(k + '-0-1-' + nowTimestampMs + '-' + uid + '-0');
  }

  function generateEncryptFID(friendId, nowTimestampMs) {
    return aegisEncrypt(friendId + '-' + nowTimestampMs);
  }

  function generateShakeS(shakeTimes, token, timestampSec, friendId) {
    var payload = '{"shakeTimes":' + shakeTimes +
      ',"token":"' + token +
      '","timestamp":' + timestampSec +
      ',"friendId":' + Number(friendId) + '}';
    return aegisEncrypt(payload) + '1' + token + '12';
  }

  // ========== 導出 ==========
  return {
    aegisEncrypt: aegisEncrypt,
    aegisDecrypt: aegisDecrypt,
    generateS: generateS,
    generateEncryptFID: generateEncryptFID,
    generateShakeS: generateShakeS
  };
})();


let argd = '';
try {
  if ($argument) { argd = $argument; }
} catch (e) { console.log(e); }

let NotSet = false;
let ShopeeUserID2 = '';
let UserNickname = '';
try {
  if (argd != '') {
    if (argd == '0') {
      NotSet = true;
    }
    else if (argd.includes(';')) {
      let ds = argd.split(';');
      ShopeeUserID2 = ds[0].trim();
      UserNickname = ds[1].trim();
    }
    else {
      ShopeeUserID2 = argd;
    }
  }
} catch (e) { console.log(e); }


// ver 20230702
let UseUserId = $persistentStore.read('UseUserId') || '';
let ShopeeUserID = $persistentStore.read('ShopeeUserID') || '';
if (ShopeeUserID2 != '') { ShopeeUserID = ShopeeUserID2; UseUserId = '1'; }
let _ShopeeUserID = ''; if (ShopeeUserID != '') _ShopeeUserID = `_${ShopeeUserID}`;
if (ShopeeUserID != '') { console.log(ShopeeUserID); }
if (UseUserId != '1') { ShopeeUserID = ''; _ShopeeUserID = ''; console.log('使用本機資料。'); }

// let NotAutoClaim = $persistentStore.read('手動領蝦幣任務獎勵') || '';
// //$persistentStore.write(null, '手動領蝦幣任務獎勵');
// //let NotAutoClaim = $persistentStore.read('手動簽到') || '';
// if (NotAutoClaim == '是') { NotAutoClaim = true; } else { NotAutoClaim = false; }
// let UseUA = $persistentStore.read('領蝦幣任務獎勵UA') || '';
// if (UseUA == '是') { UseUA = true; } else { UseUA = false; }
let AutoClaim = true;
let UseUA = true;
try {
  let vv = $loon.split(' ');
  if (vv.length >= 3) {
    if (vv[2].match(/^(\d+)\.(\d+)\.(\d+)/)) {
      let vv2 = vv[2].match(/^(\d+)\.(\d+)\.(\d+)/);
      let v1 = parseInt(vv2[1]);
      let v2 = parseInt(vv2[2]);
      let v3 = parseInt(vv2[3]);
      if (!(v1 > 3 || v1 == 3 && (v2 > 1 || v2 == 1 && v3 > 0))) { UseUA = false; }
      //console.log(`${v1} ${v2} ${v3}`);
    }
  }
} catch (error) { console.log('NO $loon'); }

let caption = '每日任務 瀏覽商品領任務蝦幣';
let title = '💰我的蝦幣 ' + caption;
const version = 'v20261103';
let showNotification = true;
let showLog = true;
let config = null;
let dataList = [];
const NotShowNotification = $persistentStore.read('NotShowNotification'); if (NotShowNotification) { showNotification = false; }
const NotShowLog = $persistentStore.read('ShowLog'); if (NotShowLog) { showLog = false; }
function getRnd(len = 16) { return (Math.random() * 10 ** 20).toFixed(0).substring(0, len); }
function getToken() { return (new Date()).getTime().toString(); }
function loonNotifyArray(m) { if (Array.isArray(m)) { loonNotify(m[0], m[1]); } else { loonNotify(m); } };
function loonNotify(subtitle = '', message = '', url = 'shopeetw://') { if (showNotification) { $notification.post(title, subtitle, message, { 'openUrl': url }); } if (showLog) { console.log(`${title}\t${subtitle}\t${message}`); } };
function handleError(error) {
  let sl = showLog; showLog = false; let msg = '❌';
  if (Array.isArray(error)) {
    for (let i = 0; i < error.length; i++) {
      const e = error[i]; msg += (i > 1 ? '\n' : ' ') + `${e}`;
    }
  }
  else { msg += ` ${error}`; }
  console.log(msg); loonNotifyArray(error); showLog = sl;
}
function getSaveObject(key) { const string = $persistentStore.read(key); return !string || string.length === 0 ? {} : JSON.parse(string); }
function isEmptyObject(obj) { return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false; }
function cookieToString(cookieObject) { let string = ''; for (const [key, value] of Object.entries(cookieObject)) { string += `${key}=${value};` } return string; }
async function delay(seconds) { console.log(`\t\t\t\t\t\t\t⏰ 等待 ${seconds} 秒`); return new Promise((resolve) => { setTimeout(() => { resolve(); }, seconds * 1000); }); }
function GetDataConfig(item = -1, method = 'POST', url = '', title = '', content = '') {
  if (item === -1) {
    return {
      'item': item, 'method': method, 'url': url, 'title': title, 'content': content, 'memo': ''
      , 'dataRequest': { url: '', headers: config.shopeeHeaders, body: null }, 'func': ud[6],
    };
  }
  let ud = UrlData[item];
  let dc = {
    'item': item, 'method': ud[0], 'title': ud[1], 'content': ud[2], 'url': ud[3], 'memo': '',
    'dataRequest': { url: '', headers: null, body: null }, 'func': ud[6],
  };
  let params = null;
  params = ud[5];
  if (dc.method === 'POST') { dc.dataRequest.body = DataPostBodyList[dc.item]; }
  dc.dataRequest.headers = config.shopeeHeaders;
  if (params && params.length > 0) {
    for (let i = 0; i < params.length; i++) {
      const p = params[i];
      dc.url = dc.url.replace(`\{${p}\}`, config[p]);
    }
  }
  dc.dataRequest.url = dc.url;
  return dc;
}
Date.prototype.format = function (format = '1') {
  if (format === '0') { format = 'yyyy/MM/dd HH:mm:ss.S'; }
  else if (format === '1') { format = 'yyyy/MM/dd HH:mm:ss'; }
  else if (format === '2') { format = 'yyyy/MM/dd'; }
  else if (format === '3') { format = 'HH:mm:ss'; }
  else if (format === '4') { format = 'MM/dd'; }
  else if (format === '5') { format = 'HH:mm'; }
  let o = {
    "M+": this.getMonth() + 1, //month 月
    "d+": this.getDate(),    //day 日
    "h+": this.getHours(),   //hour 時
    "H+": this.getHours(),   //hour 時
    "m+": this.getMinutes(), //minute 分 
    "s+": this.getSeconds(), //second 秒
    "q+": parseInt((this.getMonth() + 3) / 3),  //quarter 季
    "S": this.getMilliseconds().toString().padEnd(3, '0') //millisecond  
  }
  let re = new RegExp(/(y+)/);
  if (re.test(format)) { format = format.replace(re, (this.getFullYear() + "").substr(4 - format.match(re)[1].length)); }
  for (let k in o) {
    let r = RegExp("(" + k + ")");
    if (r.test(format)) {
      let fr = format.match(r)[1];
      format = format.replace(fr, fr.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};

async function dataGet(dc, item = -1) {
  return new Promise((resolve, reject) => {
    try {
      let msg = `\t🌐 ${dc.title} ...`;
      if (item >= 0) { msg += ` (${item})`; }
      console.log(msg);
      $httpClient.get(dc.dataRequest, function (error, response, data) {
        if (error) {
          return reject([`執行失敗 ‼️`, '連線錯誤']);
        } else {
          if (response.status === 200) {
            return resolve(data);
          } else {
            return reject([`執行失敗 ‼️`, response.status, data]);
          }
        }
      });
    } catch (error) {
      return reject([`執行失敗 ‼️`, error]);
    }
  });
}
async function dataPost(dc, item = -1) {
  return new Promise((resolve, reject) => {
    try {
      let msg = `\t🌐 ${dc.title} ...`;
      if (item >= 0) { msg += ` (${item})`; }
      console.log(msg);
      $httpClient.post(dc.dataRequest, function (error, response, data) {
        if (error) {
          return reject([`${content}失敗 ‼️`, '連線錯誤']);
        } else {
          if (response.status === 200) {
            return resolve(data);
          } else {
            return reject([`執行失敗 ‼️`, response.status, data]);
          }
        }
      });

    } catch (error) {
      return reject([`執行失敗 ‼️`, error]);
    }
  });
}
async function preCheck() {
  return new Promise((resolve, reject) => {
    const shopeeInfo = getSaveObject('ShopeeInfo' + _ShopeeUserID);
    if (isEmptyObject(shopeeInfo)) {
      return reject(['檢查失敗 ‼️', '沒有 蝦皮 Token']);
    }
    const shopeeHeaders = {
      //'Cookie': `${cookieToString(shopeeInfo.tokenAll)};csrftoken=${shopeeInfo.csrfToken}`,
      'Cookie': `${shopeeInfo.cookieAll}`,  // 
      'Content-Type': 'application/json',
      'User-Agent': shopeeInfo.userAgent,
      'x-csrftoken': shopeeInfo.csrfToken,
      'referer': 'https://games-dailycheckin.shopee.tw/mkt/coins/api/',
      'dci-version': '4009002',
    }
    // UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15.7.2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.7.2 Mobile/15E148 Safari/604.1';
    // UA = 'iOS app iPhone Shopee appver=33953 language=zh-Hant app_type=1 platform=native_ios os_ver=16.7.2 Cronet/102.0.5005.61';
    // shopeeHeaders['User-Agent'] = shopeeInfo.userAgent;
    // shopeeHeaders['referer'] = 'https://shopee.tw/api/v4/market_coin/';

    // if (UseUA) {
    // 	let UA = 'iOS app iPhone Shopee appver=31208 language=zh-Hant app_type=1 Cronet/102.0.5005.61';
    // 	try {
    // 		let ua1 = JSON.parse($persistentStore.read('ShopeeUserAgent') || '{"DataDate":"","UA":""}');
    // 		if (ua1.UA != '') { UA = ua1.UA; }
    // 	} catch (error) { }
    // 	shopeeHeaders['User-Agent'] = UA;
    // 	shopeeHeaders['x-csrftoken'] = shopeeInfo.csrfToken;
    // 	shopeeHeaders['referer'] = 'https://games-dailycheckin.shopee.tw/mkt/coins/api/';
    // }

    // console.log(shopeeHeaders);
    config = {
      shopeeInfo: shopeeInfo,
      shopeeHeaders: shopeeHeaders,
    }
    console.log('✅ 檢查成功\n');
    return resolve();
  });
}
// some true ,  every false

async function ProcData1(data, dc) {
  return new Promise((resolve, reject) => {
    let found = false;
    let obj = JSON.parse(data);
    // console.log(obj);

    if ('error' in obj && obj.error === null && 'data' in obj) {
      if (obj.data != null) {
        // console.log(obj.data.task_code);
        // console.log(Aegis.aegisEncrypt(obj.data.task_code));
        config.task_code = obj.data.task_code;
        if (obj.data.task_status != 3) {
          config.browse_time = obj.data.browse_time;
          found = true;
        }
        else { console.log('已領！'); }
        //   if ('task_data' in obj && obj.task_data && 'order_task' in obj.task_data) {
        //   if (obj.task_data.order_task && obj.task_data.order_task.is_valid == false) {
        //     found = true;
        //   }
        //   else { console.log('已領！'); }
        // }
      }
      else { console.log('目前沒有任務！'); }
    }
    else {
      return reject([`執行失敗 ‼️`, obj.msg, data]);
    }
    return resolve(found);
  });
}


async function ProcData2(data, dc) {
  return new Promise((resolve, reject) => {
    let found = false;
    let obj = JSON.parse(data);
    // console.log(obj);

    if ('error' in obj && obj.error === null && 'data' in obj && obj.data != null) {
      console.log(`成功領取 ${obj.data.claimed_coin_amount} 蝦幣。`);
      // console.log(Aegis.aegisEncrypt(obj.data.task_code));
      found = true;
    }
    else {
      return reject([`執行失敗 ‼️`, obj.msg, data]);
    }
    return resolve(found);
  });
}

async function ProcData0(data, dc) {
  return new Promise((resolve, reject) => {
    let found = false;
    let obj = JSON.parse(data);
    console.log(obj);

    // if (obj.code === 0) {
    //   found = true;
    //   //console.log()

    // }
    // else {
    //   return reject([`執行失敗 ‼️`, obj.msg, data]);
    // }
    return resolve(found);
  });
}


let UrlData = [[],
['GET', '取得任務清單', '1', 'https://shopee.tw/api/v4/market_coin/get_product_feeds_task', '', , ProcData1],
['POST', '領取任務蝦幣', '2', 'https://shopee.tw/api/v4/market_coin/finish_product_feeds_task_and_claim', '', , ProcData2],
];
let DataPostBodyList = [, , {
  "task_token": "AAAAAAA="
}, , , ,
];

function preInit() {
  config.task_code = '';
  config.browse_time = 0;
}
const forMaxCount = 10;
(async () => {
  console.log(`ℹ️ ${title} ${version}`);
  console.log(`${new Date().format('0')}`);
  try {
    await preCheck();
    preInit();
    let flag = true;
    let runCount = 0;
    let item = -1;
    for (let i = 1; i < UrlData.length; i++) {
      if (!flag) { break; }
      item = -1;

      if (i == 2) {
        await delay(config.browse_time * 1.0 + 0.5);
        let tc = Aegis.aegisEncrypt(config.task_code);
        console.log(tc);
        DataPostBodyList[i].task_token = tc;
      }
      let dc = GetDataConfig(i);
      // console.log(`\n🌐 ${dc.method} URL: ${dc.url} \n`);
      // console.log(dc);
      // if (i == 2) flag = false;
      if (flag && dc.method === 'GET') {
        await dataGet(dc).then(data => dc.func(data, dc)).then(r => { flag = r });
      } else if (flag && dc.method === 'POST') {
        await dataPost(dc, item).then(data => dc.func(data, dc)).then(r => { flag = r });
      }

      // if(i)
      if (i === 2 && flag) {
        i = 0;
        await delay(5.0);
        // if (flag) {

        // } else {
        //   flag = true;
        // }
        // i--;
      }
      if (runCount >= forMaxCount) { console.log(`超過執行限制次數 ${forMaxCount}，中止執行。`); break; }
      if (runCount > 50) { console.log(`!! Need Debug!! ★★★ 迴圈 ${runCount} /${forMaxCount} ★★★`) };

    }

    console.log('');
    // console.log(JSON.stringify(config.fss).replace(/,"last/ig, ',\n"last').replace(/},/ig, '},\n'));
    console.log('');
    let msg = '✅ 處理已完成';
    console.log(msg);
    // loonNotify(msg);
  } catch (error) {
    handleError(error);
  }
  $done({});
})();


