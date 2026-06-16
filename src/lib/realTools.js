
export const realTools = {

  // ── ENCODER / DECODER ────────────────────────────────
  encode: {
    base64:    (s) => btoa(unescape(encodeURIComponent(s))),
    base64d:   (s) => { try { return decodeURIComponent(escape(atob(s))); } catch { return "❌ Base64 invalido"; } },
    hex:       (s) => Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2,"0")).join(" "),
    hexd:      (s) => { try { return s.replace(/\s/g,"").match(/.{2}/g).map(h=>String.fromCharCode(parseInt(h,16))).join(""); } catch { return "❌ Hex invalido"; } },
    binary:    (s) => Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8,"0")).join(" "),
    binaryd:   (s) => { try { return s.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join(""); } catch { return "❌ Binary invalido"; } },
    rot13:     (s) => s.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)),
    urlenc:    (s) => encodeURIComponent(s),
    urldec:    (s) => { try { return decodeURIComponent(s); } catch { return "❌ URL encoding invalido"; } },
    xor:       (s, key="A") => Array.from(s).map((c,i)=>String.fromCharCode(c.charCodeAt(0)^key.charCodeAt(i%key.length))).join(""),
    html:      (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),
    htmld:     (s) => s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'"),
    atob_str:  (s) => { try { return atob(s); } catch { return "❌"; } },
    morse:     (s) => {
      const m = {A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."," ":"/"};
      return s.toUpperCase().split("").map(c=>m[c]||"?").join(" ");
    },
    morsd:     (s) => {
      const m = {".-":"A","-...":"B","-.-.":"C","-..":"D",".":"E","..-.":"F","--.":"G","....":"H","..":"I",".---":"J","-.-":"K",".-..":"L","--":"M","-.":"N","---":"O",".--.":"P","--.-":"Q",".-.":"R","...":"S","-":"T","..-":"U","...-":"V",".--":"W","-..-":"X","-.--":"Y","--..":"Z","-----":"0",".----":"1","..---":"2","...--":"3","....-":"4",".....":"5","-....":"6","--...":"7","---..":"8","----.":"9","/": " "};
      return s.split(" ").map(c=>m[c]||"?").join("");
    },
    // New: Reverse String
    reverse: (s) => s.split("").reverse().join(""),
    // New: Caesar Cipher (default shift 13 = ROT13)
    caesar: (s, shift=1) => {
      return s.replace(/[a-zA-Z]/g, c => {
        const base = c <= "Z" ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
      });
    }
  },

  // ── NETWORK TOOLS (NEW) ──────────────────────────────
  network: {
    getSubnets: (ip, mask) => {
      // Basic subnet calculator logic
      try {
        const ip2long = (ip) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
        const long2ip = (long) => [24, 16, 8, 0].map(shift => (long >>> shift) & 255).join('.');
        
        const ipLong = ip2long(ip);
        const maskLong = -1 << (32 - parseInt(mask, 10));
        const networkLong = ipLong & maskLong;
        const broadcastLong = networkLong | (~maskLong >>> 0);
        
        return {
          network: long2ip(networkLong),
          broadcast: long2ip(broadcastLong),
          firstHost: long2ip(networkLong + 1),
          lastHost: long2ip(broadcastLong - 1),
          hosts: (broadcastLong - networkLong - 1)
        };
      } catch { return null; }
    },
    extractMAC: (s) => s.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g) || [],
  },

  // ── HASH IDENTIFIER ──────────────────────────────────
  identifyHash: (h) => {
    h = h.trim();
    const len = h.length;
    const hex = /^[0-9a-f]+$/i.test(h);
    const b64 = /^[A-Za-z0-9+/]+=*$/.test(h);
    const results = [];
    if (hex) {
      if (len === 32)  results.push({type:"MD5",confidence:"HIGH",tool:"hashcat -m 0 / john --format=raw-md5"});
      if (len === 40)  results.push({type:"SHA-1",confidence:"HIGH",tool:"hashcat -m 100 / john --format=raw-sha1"});
      if (len === 56)  results.push({type:"SHA-224",confidence:"HIGH",tool:"hashcat -m 1300"});
      if (len === 64)  results.push({type:"SHA-256",confidence:"HIGH",tool:"hashcat -m 1400 / john --format=raw-sha256"});
      if (len === 96)  results.push({type:"SHA-384",confidence:"HIGH",tool:"hashcat -m 10800"});
      if (len === 128) results.push({type:"SHA-512",confidence:"HIGH",tool:"hashcat -m 1700 / john --format=raw-sha512"});
      if (len === 32)  results.push({type:"NTLM",confidence:"MEDIUM",tool:"hashcat -m 1000 / john --format=NT"});
      if (len === 16)  results.push({type:"MySQL323 / Half MD5",confidence:"MEDIUM",tool:"hashcat -m 200"});
    }
    if (h.startsWith("$2"))  results.push({type:"bcrypt",confidence:"HIGH",tool:"hashcat -m 3200 / john --format=bcrypt"});
    if (h.startsWith("$1$")) results.push({type:"MD5-crypt",confidence:"HIGH",tool:"hashcat -m 500 / john --format=md5crypt"});
    if (h.startsWith("$5$")) results.push({type:"SHA-256-crypt",confidence:"HIGH",tool:"hashcat -m 7400"});
    if (h.startsWith("$6$")) results.push({type:"SHA-512-crypt",confidence:"HIGH",tool:"hashcat -m 1800 / john --format=sha512crypt"});
    if (h.startsWith("sha1$")) results.push({type:"Django SHA1",confidence:"HIGH",tool:"hashcat -m 124"});
    if (/^[A-Z0-9]{26}$/i.test(h)) results.push({type:"CRC32 / Adler32",confidence:"LOW"});
    if (b64 && len >= 24) results.push({type:"Base64 encoded hash",confidence:"LOW",note:"decodifica prima"});
    if (/\.(eyJ)/.test(h) || h.startsWith("eyJ")) results.push({type:"JWT Token",confidence:"HIGH",tool:"jwt.io / python-jwt"});
    return results.length ? results : [{type:"Unknown",confidence:"LOW",note:"Prova hashid, hash-identifier"}];
  },

  // ── ENTROPY CALCULATOR ───────────────────────────────
  entropy: (s) => {
    if (!s) return 0;
    const freq = {};
    for (const c of s) freq[c] = (freq[c]||0)+1;
    const len = s.length;
    return -Object.values(freq).reduce((acc,f)=>{const p=f/len;return acc+p*Math.log2(p);},0);
  },

  // ── STRING ANALYSIS ──────────────────────────────────
  analyzeString: (s) => {
    if (!s.trim()) return null;
    const ent = realTools.entropy(s).toFixed(3);
    const isPrintable = /^[\x20-\x7E\n\r\t]*$/.test(s);
    const hexMatch = s.match(/[0-9a-fA-F]+/g) || [];
    const b64Match = /^[A-Za-z0-9+/]+=*$/.test(s.trim()) && s.length % 4 === 0;
    const hasFlag = /flag\{|CTF\{|picoCTF\{|HTB\{|1337UP\{/i.test(s);
    const isJWT = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(s);
    const urlMatch = s.match(/https?:\/\/[^\s]+/g) || [];
    const ipMatch = s.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [];
    const emailMatch = s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const charFreq = {};
    for (const c of s) charFreq[c] = (charFreq[c]||0)+1;
    const topChars = Object.entries(charFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return { length: s.length, entropy: ent, isPrintable, b64Match, hasFlag, isJWT, urlMatch, ipMatch, emailMatch, topChars,
      hexLike: hexMatch.length > 0, suggestions: [
        hasFlag && "🏁 FLAG FORMAT TROVATO",
        isJWT && "🔑 JWT Token — usa jwt.io",
        b64Match && "📦 Possibile Base64 — prova decode",
        parseFloat(ent) < 3.5 && "🔤 Bassa entropia — possibile cifrario classico (Caesar, Vigenère)",
        parseFloat(ent) > 7 && "🔐 Alta entropia — possibile cifratura o binario compresso",
        ipMatch.length && `🌐 IP trovati: ${ipMatch.join(", ")}`,
        urlMatch.length && `🔗 URL trovati: ${urlMatch.join(", ")}`,
        emailMatch.length && `📧 Email trovate: ${emailMatch.join(", ")}`,
      ].filter(Boolean)
    };
  },

  // ── JWT DECODER ──────────────────────────────────────
  decodeJWT: (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return { error: "Non è un JWT valido (deve avere 3 parti)" };
      const decode = (b64) => {
        const padded = b64.replace(/-/g,"+").replace(/_/g,"/").padEnd(b64.length + (4-b64.length%4)%4, "=");
        return JSON.parse(atob(padded));
      };
      const header = decode(parts[0]);
      const payload = decode(parts[1]);
      const sig = parts[2];
      const vulns = [];
      if (header.alg === "none" || header.alg === "None" || header.alg === "NONE") vulns.push("🚨 ALG=NONE — token accettato senza firma!");
      if (header.alg === "HS256") vulns.push("⚠️ HS256 — prova brute force su secret debole (hashcat -m 16500)");
      if (header.kid) vulns.push(`⚠️ KID presente: '${header.kid}' — possibile SQL injection nel kid parameter`);
      if (header.jwk || header.jku) vulns.push("⚠️ JWK/JKU presente — possibile SSRF o key confusion");
      const exp = payload.exp ? new Date(payload.exp * 1000) : null;
      const expired = exp && exp < new Date();
      return { header, payload, signature: sig, exp, expired, vulns };
    } catch(e) { return { error: `Parsing fallito: ${e.message}` }; }
  },

  // ── DNS LOOKUP (real via Google DNS-over-HTTPS) ──────
  dnsLookup: async (domain, type = "A") => {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
      const data = await res.json();
      return data;
    } catch(e) { return { error: e.message }; }
  },

  // ── IP INFO (real via ip-api.com) ────────────────────
  ipInfo: async (ip) => {
    try {
      const res = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,org,as,query,mobile,proxy,hosting`);
      return await res.json();
    } catch(e) { return { error: e.message }; }
  },

  // ── CERTIFICATE TRANSPARENCY (real via crt.sh) ───────
  crtSh: async (domain) => {
    try {
      const res = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const unique = [...new Map(data.map(d=>[d.common_name||d.name_value, d])).values()];
      return unique.slice(0,30).map(d=>({ cn: d.common_name||d.name_value, issuer: d.issuer_ca_id, date: d.entry_timestamp }));
    } catch(e) { return { error: e.message }; }
  },

  // ── WORDLIST GENERATOR ───────────────────────────────
  generateWordlist: (base) => {
    const words = new Set();
    const b = base.trim();
    if (!b) return [];
    words.add(b);
    words.add(b.toLowerCase());
    words.add(b.toUpperCase());
    words.add(b.charAt(0).toUpperCase()+b.slice(1));
    const years = ["85","1985","86","1986","87","1988","90","2023","2024","2025","01","123","!","@","#","_","."];
    const seps = ["","_",".","!","@","#"];
    for (const y of years) for (const s of seps) {
      words.add(b+s+y); words.add(y+s+b);
    }
    // leet speak
    const leet = b.toLowerCase().replace(/a/g,"@").replace(/e/g,"3").replace(/i/g,"1").replace(/o/g,"0").replace(/s/g,"$");
    words.add(leet); words.add(leet+"!");
    // reversed
    words.add(b.split("").reverse().join(""));
    return [...words];
  },

  // ── MAGIC BYTES ──────────────────────────────────────
  magicBytes: {
    "ffd8ff": "JPEG image",
    "89504e47": "PNG image",
    "47494638": "GIF image",
    "49492a00": "TIFF (little endian)",
    "4d4d002a": "TIFF (big endian)",
    "25504446": "PDF document",
    "504b0304": "ZIP archive / DOCX / XLSX / PPTX / APK / JAR",
    "504b0506": "ZIP archive (empty)",
    "7f454c46": "ELF executable (Linux)",
    "4d5a": "PE executable (Windows .exe/.dll)",
    "cafebabe": "Java class / Mach-O fat binary",
    "feedfacf": "Mach-O 64-bit",
    "1f8b08": "GZIP archive",
    "377abcaf": "7-ZIP archive",
    "526172211a07": "RAR archive (v1.5+)",
    "4f676753": "OGG audio",
    "494433": "MP3 audio (ID3 tag)",
    "fffb": "MP3 audio",
    "664c6143": "FLAC audio",
    "52494646": "WAV audio / AVI video (RIFF)",
    "000000": "Possible nulled header or MP4",
    "52494646....41564920": "AVI video",
    "3c3f786d6c": "XML document",
    "7b": "JSON (starts with {)",
    "4c00000001140200": "Windows LNK shortcut",
    "d0cf11e0": "Microsoft Office (old .doc/.xls/.ppt)",
    "0001000": "SQLite database",
    "53514c69": "SQLite database v3",
    "4d5446": "MIDI audio",
  },

  identifyMagic: (hexStr) => {
    const h = hexStr.replace(/\s/g,"").toLowerCase();
    for (const [magic, desc] of Object.entries(realTools.magicBytes)) {
      if (h.startsWith(magic)) return { magic, desc };
    }
    return null;
  },
};
