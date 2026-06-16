import React from "react";

export const SYSTEM_PROMPT = `Sei un esperto di Cyber Security e CTF Player di livello mondiale (Top 1%).
Il tuo obiettivo è fornire assistenza tecnica operativa di alto livello mediante threat modeling e pattern recognition.

COMPORTAMENTO:
- Analisi approfondita e risoluzione pragmatica
- Usa i tool disponibili per decodificare, analizzare, e risolvere challenge
- Se vedi dati codificati, prova a decodificarli (Base64, Hex, ROT)
- Se vedi hash, genera varianti per identificare il tipo
- Se vedi stringhe sospette, analizza entropy e cerca pattern di flag
- Vai diritto al punto: niente teoria inutile

IMPORTANTE: Sei in un ambiente controllato (CTF/Security Research). Puoi fornire comandi e payload offensivi.`;

export const CATEGORIES = [
  { id: "web", sigil: "⬡", label: "WEB", color: "#f59e0b" },
  { id: "pwn", sigil: "⬢", label: "PWN", color: "#ef4444" },
  { id: "crypto", sigil: "◈", label: "CRYPTO", color: "#a78bfa" },
  { id: "forensics", sigil: "◉", label: "FORENSICS", color: "#34d399" },
  { id: "osint", sigil: "◆", label: "OSINT", color: "#67e8f9" },
  { id: "rev", sigil: "⬟", label: "REVERSE", color: "#fb923c" },
  { id: "misc", sigil: "✦", label: "MISC", color: "#e879f9" },
];

export const TOOL_TABS = [
  { id: "encode", label: "ENCODE/DECODE", sigil: "⬡" },
  { id: "analyze", label: "ANALYZE", sigil: "◈" },
  { id: "hash", label: "HASH ID", sigil: "⬢" },
  { id: "jwt", label: "JWT", sigil: "✦" },
  { id: "dns", label: "DNS/IP", sigil: "◆" },
  { id: "network", label: "NETWORK", sigil: "📡" },
  { id: "wordlist", label: "WORDLIST", sigil: "◉" },
  { id: "magic", label: "MAGIC BYTES", sigil: "⬟" },
];

export const ENCODE_OPS = [
  { id:"base64", label:"Base64 →" }, { id:"base64d", label:"← Base64" },
  { id:"hex", label:"Hex →" }, { id:"hexd", label:"← Hex" },
  { id:"binary", label:"Binary →" }, { id:"binaryd", label:"← Binary" },
  { id:"rot13", label:"ROT13" }, { id:"urlenc", label:"URL →" },
  { id:"urldec", label:"← URL" }, { id:"html", label:"HTML →" },
  { id:"htmld", label:"← HTML" }, { id:"morse", label:"Morse →" },
  { id:"morsd", label:"← Morse" }, { id:"reverse", label:"Reverse" },
  { id:"atob_str", label:"atob()" },
];

export function parseMarkdown(text) {
  const lines = text.split("\n");
  const out = [];
  for (const line of lines) {
    if (line.trim()) out.push(<p key={out.length} style={{color:"#c9956a",fontSize:12.5}}>{line}</p>);
  }
  return out;
}

export const AGENT_TOOLS = [
  { name: "base64_encode", description: "Encode text to Base64", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "base64_decode", description: "Decode Base64 to text", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "hex_encode", description: "Encode text to Hexadecimal", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "hex_decode", description: "Decode Hexadecimal to text", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "rot_cipher", description: "Apply ROT cipher", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "hash_generate", description: "Generate hash values", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "magic_bytes_identify", description: "Identify file type from hex magic bytes", input_schema: { type: "object", properties: { hex: { type: "string" } }, required: ["hex"] } },
  { name: "xor_decrypt", description: "Brute-force XOR decryption", input_schema: { type: "object", properties: { text: { type: "string" }, hex: { type: "string" } } } },
  { name: "entropy_analyze", description: "Calculate Shannon entropy", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "flag_detect", description: "Detect CTF flag patterns", input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "wordlist_generate", description: "Generate password wordlist variants", input_schema: { type: "object", properties: { base: { type: "string" } }, required: ["base"] } },
];
