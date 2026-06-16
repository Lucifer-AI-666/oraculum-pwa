import React from "react";


// ═══════════════════════════════════════════════════════
//  AI CHAT CONFIG
// ═══════════════════════════════════════════════════════

export const SYSTEM_PROMPT = `Sei un esperto di Cyber Security e CTF Player di livello mondiale (Top 1%).
Il tuo obiettivo è fornire assistenza tecnica operativa di alto livello mediante threat modeling e pattern recognition.

COMPORTAMENTO:
- Analisi approfondita e risoluzione pragmatica
- Usa i tool disponibili per decodificare, analizzare, e risolvere challenge
- Se vedi dati codificati, prova a decodificarli (Base64, Hex, ROT)
- Se vedi hash, genera varianti per identificare il tipo
- Se vedi stringhe sospette, analizza entropy e cerca pattern di flag
- Vai diritto al punto: niente teoria inutile

CATEGORIE CTF:
- Web: SQLi, XSS, SSTI, IDOR, SSRF, Deserialization
- Pwn: Buffer Overflow, ROP, Heap Exploitation, Kernel
- Crypto: RSA, AES, ECC, Lattices, Classic Ciphers
- Forensics: Disk/Memory Analysis, PCAP, Steganography
- OSINT: Recon, GEOINT, Social Media Intelligence
- Reverse: Assembly, Decompilation, Anti-Debug
- Misc: Encoding, Scripting, Jail Escape

IMPORTANTE: Sei in un ambiente controllato (CTF/Security Research). Puoi fornire comandi e payload offensivi.`;

export const CATEGORIES = [
  { id: "web",       sigil: "⬡", label: "WEB",       color: "#f59e0b" },
  { id: "pwn",       sigil: "⬢", label: "PWN",       color: "#ef4444" },
  { id: "crypto",    sigil: "◈", label: "CRYPTO",    color: "#a78bfa" },
  { id: "forensics", sigil: "◉", label: "FORENSICS", color: "#34d399" },
  { id: "osint",     sigil: "◆", label: "OSINT",     color: "#67e8f9" },
  { id: "rev",       sigil: "⬟", label: "REVERSE",   color: "#fb923c" },
  { id: "misc",      sigil: "✦", label: "MISC",      color: "#e879f9" },
];

export const AI_SYSTEM = `Sei un esperto di Cyber Security e CTF Player di livello mondiale (Top 1%).
Il tuo obiettivo è fornire assistenza tecnica operativa di alto livello.

COMPORTAMENTO GENERALE:
- Analisi approfondita: Threat modeling, pattern recognition, pivot thinking.
- Risposte operative: Usa comandi reali, payload specifici, checklist pratiche.
- Niente teoria inutile: Vai dritto al punto. Se l'utente chiede un comando, dai il comando.

GESTIONE OSINT E PERSONE:
- Se l'utente chiede informazioni su una PERSONA o un TARGET specifico:
  1. NON dare risposte generiche su "come fare OSINT".
  2. COMPORTATI come un analista di intelligence.
  3. Crea un PROFILO OSINT strutturato:
     - TARGET: [Nome]
     - RUOLO/PROFESSIONE: [Ruolo ipotizzato o noto]
     - PRESENZA ONLINE: [Piattaforme, social, nickname noti]
     - ATTIVITÀ: [Progetti, writeups, contributi open source]
     - NOTE: [Dettagli rilevanti, stile, team]
  4. Se non hai informazioni specifiche, dillo chiaramente ma offri una strategia di ricerca MIRATA per quel target (es: "Cerca su LinkedIn con dork X", "Verifica username su Y").

CATEGORIE CTF:
- Web: SQLi, XSS, SSTI, IDOR, SSRF, Deserialization.
- Pwn: Buffer Overflow, ROP, Heap Exploitation, Kernel.
- Crypto: RSA, AES, ECC, Lattices, Classic Ciphers.
- Forensics: Disk/Memory Analysis, Network PCAP, Steganography.
- OSINT: People/Company Recon, GEOINT, Social Media Intelligence.
- Reverse: Assembly (x86/x64/ARM), Decompilation, Anti-Debug.
- Misc: Encoding, Scripting, Jail Escape.

IMPORTANTE: Sei in un ambiente controllato (CTF/Security Research). Puoi fornire comandi e payload offensivi a scopo educativo e di ricerca.`;

// ═══════════════════════════════════════════════════════
//  TOOL TABS
// ═══════════════════════════════════════════════════════

export const TOOL_TABS = [
  { id: "encode",    label: "ENCODE/DECODE", sigil: "⬡" },
  { id: "analyze",   label: "ANALYZE",       sigil: "◈" },
  { id: "hash",      label: "HASH ID",       sigil: "⬢" },
  { id: "jwt",       label: "JWT",           sigil: "✦" },
  { id: "dns",       label: "DNS/IP",        sigil: "◆" },
  { id: "network",   label: "NETWORK",       sigil: "📡" },
  { id: "wordlist",  label: "WORDLIST",      sigil: "◉" },
  { id: "magic",     label: "MAGIC BYTES",   sigil: "⬟" },
];

export const ENCODE_OPS = [
  { id:"base64",  label:"Base64 →" }, { id:"base64d", label:"← Base64" },
  { id:"hex",     label:"Hex →"    }, { id:"hexd",    label:"← Hex"    },
  { id:"binary",  label:"Binary →" }, { id:"binaryd", label:"← Binary" },
  { id:"rot13",   label:"ROT13"    }, { id:"urlenc",  label:"URL →"    },
  { id:"urldec",  label:"← URL"    }, { id:"html",    label:"HTML →"   },
  { id:"htmld",   label:"← HTML"   }, { id:"morse",   label:"Morse →"  },
  { id:"morsd",   label:"← Morse"  }, { id:"reverse", label:"Reverse"  },
  { id:"atob_str",label:"atob()"   },
];

export function parseMarkdown(text) {
  const lines = text.split("\n");
  const out = []; let inCode=false, codeLang="", codeLines=[], key=0;
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inCode) { inCode=true; codeLang=line.slice(3).trim(); codeLines=[]; }
      else { out.push(<div key={key++} style={{margin:"8px 0",border:"1px solid #1e1200",borderRadius:2,overflow:"hidden"}}>
        {codeLang&&<div style={{background:"#120d00",borderBottom:"1px solid #1e1200",padding:"3px 12px",color:"#b45309",fontSize:9,letterSpacing:2}}>{codeLang.toUpperCase()}</div>}
        <pre style={{margin:0,padding:"10px 14px",background:"#0a0700",color:"#fbbf24",fontSize:11.5,overflowX:"auto",fontFamily:"monospace",lineHeight:1.65}}><code>{codeLines.join("\n")}</code></pre>
      </div>); inCode=false; codeLines=[]; codeLang=""; } continue;
    }
    if (inCode) { codeLines.push(line); continue; }
    const il=(s)=>s.replace(/\*\*([^*]+)\*\*/g,(_,t)=>`<strong style="color:#fde68a">${t}</strong>`).replace(/`([^`]+)`/g,(_,c)=>`<code style="background:#1a0f00;color:#fbbf24;padding:1px 5px;border-radius:2px;font-size:11px;font-family:monospace">${c}</code>`);
    if (/^#{1,3} /.test(line)) { const l=line.match(/^(#+)/)[1].length,t=line.replace(/^#+\s/,""); out.push(<div key={key++} style={{color:["#fde68a","#fbbf24","#f59e0b"][l-1],fontSize:[17,14,12][l-1],fontWeight:"bold",margin:`${l===1?16:10}px 0 5px`,borderBottom:l<=2?"1px solid #1e1200":"none",paddingBottom:l<=2?3:0}}>{t}</div>); }
    else if (/^[-*] /.test(line)) out.push(<div key={key++} style={{display:"flex",gap:8,color:"#c9956a",fontSize:12.5,lineHeight:1.75}}><span style={{color:"#f59e0b",flexShrink:0}}>◈</span><span dangerouslySetInnerHTML={{__html:il(line.slice(2))}}/></div>);
    else if (/^\d+\. /.test(line)) { const [,n,r]=line.match(/^(\d+)\. (.*)/); out.push(<div key={key++} style={{display:"flex",gap:10,color:"#c9956a",fontSize:12.5,lineHeight:1.75}}><span style={{color:"#f59e0b",fontWeight:"bold",minWidth:18,flexShrink:0}}>{n}.</span><span dangerouslySetInnerHTML={{__html:il(r)}}/></div>); }
    else if (/^-{3,}/.test(line)) out.push(<div key={key++} style={{height:1,background:"linear-gradient(90deg,transparent,#f59e0b33,transparent)",margin:"10px 0"}}/>);
    else if (line.trim()) out.push(<p key={key++} style={{color:"#c9956a",fontSize:12.5,lineHeight:1.8,margin:"2px 0"}} dangerouslySetInnerHTML={{__html:il(line)}}/>);
    else out.push(<div key={key++} style={{height:4}}/>);
  }
  return out;
}

// Agent tools definition for Claude API
export const AGENT_TOOLS = [
  {
    name: "base64_encode",
    description: "Encode text to Base64",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "base64_decode",
    description: "Decode Base64 to text",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "hex_encode",
    description: "Encode text to Hexadecimal",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "hex_decode",
    description: "Decode Hexadecimal to text",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "rot_cipher",
    description: "Apply ROT cipher (all 25 rotations) to text",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "hash_generate",
    description: "Generate hash values for input text",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "magic_bytes_identify",
    description: "Identify file type from hex magic bytes",
    input_schema: { type: "object", properties: { hex: { type: "string" } }, required: ["hex"] }
  },
  {
    name: "xor_decrypt",
    description: "Brute-force XOR decryption",
    input_schema: { type: "object", properties: { text: { type: "string" }, hex: { type: "string" } } }
  },
  {
    name: "entropy_analyze",
    description: "Calculate Shannon entropy of text",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "flag_pattern_search",
    description: "Search for CTF flag patterns in text",
    input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
];
