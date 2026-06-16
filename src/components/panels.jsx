import { useState } from "react";
import { realTools } from "../lib/realTools.js";
import { ENCODE_OPS } from "../lib/config.jsx";


// ─── TOOL PANELS ────────────────────────────────────────

export function EncodePanel({ color }) {
  const [inp, setInp] = useState("");
  const [xorKey, setXorKey] = useState("A");
  const [results, setResults] = useState([]);

  const run = () => {
    if (!inp) return;
    const r = [];
    for (const op of ENCODE_OPS) {
      let out;
      try {
        if (op.id === "xor") out = realTools.encode.xor(inp, xorKey);
        else out = realTools.encode[op.id]?.(inp) ?? "—";
      } catch { out = "❌ errore"; }
      r.push({ label: op.label, out });
    }
    // also xor
    r.push({ label: `XOR key="${xorKey}"`, out: realTools.encode.xor(inp, xorKey) });
    setResults(r);
  };

  const brute = () => {
    if (!inp) return;
    const r = [];
    for (let k = 0; k < 128; k++) {
      const out = Array.from(inp).map((c,i)=>String.fromCharCode(c.charCodeAt(0)^k)).join("");
      if (/flag\{|CTF\{|picoCTF\{|HTB\{/i.test(out)) r.push({ label: `XOR key=${k} (0x${k.toString(16)})`, out });
    }
    setResults(r.length ? r : [{ label:"XOR brute", out:"Nessun flag trovato con XOR 0-127" }]);
  };

  const rotBrute = () => {
    if (!inp) return;
    const r = [];
    for (let n = 1; n <= 25; n++) {
      const out = inp.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + n) ? c : c - 26));
      r.push({ label: `ROT${n}`, out });
    }
    setResults(r);
  };

  return (
    <div>
      <textarea value={inp} onChange={e=>setInp(e.target.value)} rows={3}
        placeholder="Inserisci testo da codificare/decodificare..."
        style={{width:"100%",background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px 12px",resize:"vertical",outline:"none",boxSizing:"border-box",borderRadius:2}}/>
      <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
        <input value={xorKey} onChange={e=>setXorKey(e.target.value)} placeholder="XOR key"
          style={{width:80,background:"#050300",border:`1px solid ${color}22`,color:"#fbbf24",fontFamily:"monospace",fontSize:11,padding:"5px 8px",outline:"none"}}/>
        {[["▶ ALL OPS",run,color],["XOR BRUTE 0-127",brute,"#f87171"],["ROT BRUTE 1-25",rotBrute,"#a78bfa"]].map(([l,fn,c],i)=>(
          <button key={i} onClick={fn} style={{background:"none",border:`1px solid ${c}44`,color:c,fontFamily:"monospace",fontSize:10,padding:"5px 12px",cursor:"pointer",letterSpacing:1,borderRadius:2}}>{l}</button>
        ))}
      </div>
      {results.length > 0 && (
        <div style={{marginTop:10,display:"grid",gap:4}}>
          {results.map((r,i) => (
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",background:"#050300",border:"1px solid #1a0f00",padding:"6px 10px",borderRadius:2}}>
              <span style={{color:"#6b3a00",fontSize:10,minWidth:130,flexShrink:0,paddingTop:1}}>{r.label}</span>
              <code style={{color:"#fbbf24",fontSize:11,fontFamily:"monospace",flex:1,wordBreak:"break-all"}}>{r.out}</code>
              <button onClick={()=>navigator.clipboard?.writeText(r.out)}
                style={{background:"none",border:"1px solid #1a0f00",color:"#4b2800",fontSize:9,padding:"1px 6px",cursor:"pointer",flexShrink:0,fontFamily:"monospace"}}>COPY</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalyzePanel({ color }) {
  const [inp, setInp] = useState("");
  const [res, setRes] = useState(null);
  const run = () => { const r = realTools.analyzeString(inp); setRes(r); };

  return (
    <div>
      <textarea value={inp} onChange={e=>setInp(e.target.value)} rows={4}
        placeholder="Incolla qualsiasi stringa sospetta..."
        style={{width:"100%",background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px 12px",resize:"vertical",outline:"none",boxSizing:"border-box",borderRadius:2}}/>
      <button onClick={run} style={{marginTop:6,background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"6px 16px",cursor:"pointer",letterSpacing:2,borderRadius:2}}>▶ ANALIZZA</button>
      {res && (
        <div style={{marginTop:10}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
            {[["LENGTH",res.length],["ENTROPY",res.entropy],["PRINTABLE",res.isPrintable?"YES":"NO"],["BASE64-LIKE",res.b64Match?"YES":"NO"],["JWT",res.isJWT?"YES":"NO"]].map(([k,v],i)=>(
              <div key={i} style={{background:"#0a0600",border:"1px solid #1a0f00",padding:"3px 10px",borderRadius:2}}>
                <span style={{color:"#6b3a00",fontSize:9,letterSpacing:1}}>{k}: </span>
                <span style={{color:"#fbbf24",fontSize:11,fontFamily:"monospace"}}>{v}</span>
              </div>
            ))}
          </div>
          {res.suggestions.length > 0 && (
            <div style={{background:"#080500",border:"1px solid #1a0f00",padding:10,borderRadius:2,marginBottom:8}}>
              {res.suggestions.map((s,i)=><div key={i} style={{color:"#fde68a",fontSize:12,marginBottom:3}}>{s}</div>)}
            </div>
          )}
          <div>
            <div style={{color:"#6b3a00",fontSize:9,letterSpacing:2,marginBottom:4}}>TOP CARATTERI</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {res.topChars.map(([c,n],i)=>(
                <div key={i} style={{background:"#050300",border:"1px solid #1a0f00",padding:"3px 8px",fontFamily:"monospace",fontSize:11}}>
                  <span style={{color:"#f59e0b"}}>'{c==" "?"SPACE":c="\n"?"\\n":c}'</span>
                  <span style={{color:"#4b2800",marginLeft:4}}>{n}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HashPanel({ color }) {
  const [inp, setInp] = useState("");
  const [res, setRes] = useState(null);
  const run = () => { setRes(realTools.identifyHash(inp)); };
  const conf = { HIGH:"#4ade80", MEDIUM:"#fbbf24", LOW:"#ef4444" };

  return (
    <div>
      <input value={inp} onChange={e=>setInp(e.target.value)} placeholder="Incolla hash..."
        style={{width:"100%",background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px 12px",outline:"none",boxSizing:"border-box",borderRadius:2}}/>
      <button onClick={run} style={{marginTop:6,background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"6px 16px",cursor:"pointer",letterSpacing:2,borderRadius:2}}>▶ IDENTIFICA</button>
      {res && (
        <div style={{marginTop:10,display:"grid",gap:6}}>
          {res.map((r,i)=>(
            <div key={i} style={{background:"#050300",border:`1px solid ${(conf[r.confidence]||"#444")}33`,borderLeft:`3px solid ${conf[r.confidence]||"#444"}`,padding:"10px 14px",borderRadius:2}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span style={{color:"#fde68a",fontWeight:"bold",fontSize:14,fontFamily:"monospace"}}>{r.type}</span>
                <span style={{background:`${conf[r.confidence]}22`,border:`1px solid ${conf[r.confidence]}44`,color:conf[r.confidence],fontSize:9,padding:"1px 6px",letterSpacing:2}}>{r.confidence}</span>
              </div>
              {r.tool && <code style={{color:"#fbbf24",fontSize:11,display:"block",marginBottom:2}}>{r.tool}</code>}
              {r.note && <div style={{color:"#6b3a00",fontSize:11}}>{r.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JWTPanel({ color }) {
  const [inp, setInp] = useState("");
  const [res, setRes] = useState(null);
  const run = () => { setRes(realTools.decodeJWT(inp.trim())); };

  return (
    <div>
      <textarea value={inp} onChange={e=>setInp(e.target.value)} rows={3}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        style={{width:"100%",background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:11,padding:"8px 12px",resize:"none",outline:"none",boxSizing:"border-box",borderRadius:2,wordBreak:"break-all"}}/>
      <button onClick={run} style={{marginTop:6,background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"6px 16px",cursor:"pointer",letterSpacing:2,borderRadius:2}}>▶ DECODE</button>
      {res && !res.error && (
        <div style={{marginTop:10,display:"grid",gap:8}}>
          {res.vulns.length > 0 && (
            <div style={{background:"#1a0000",border:"1px solid #7f1d1d",padding:10,borderRadius:2}}>
              <div style={{color:"#f87171",fontSize:10,letterSpacing:2,marginBottom:4}}>🚨 VULNERABILITÀ RILEVATE</div>
              {res.vulns.map((v,i)=><div key={i} style={{color:"#fca5a5",fontSize:12,marginBottom:2}}>{v}</div>)}
            </div>
          )}
          {[["HEADER",res.header],["PAYLOAD",res.payload]].map(([l,d],i)=>(
            <div key={i} style={{background:"#050300",border:"1px solid #1a0f00",borderRadius:2}}>
              <div style={{padding:"4px 12px",borderBottom:"1px solid #1a0f00",color:"#f59e0b",fontSize:9,letterSpacing:2}}>{l}</div>
              <pre style={{margin:0,padding:10,color:"#fbbf24",fontSize:11,fontFamily:"monospace",overflowX:"auto"}}>{JSON.stringify(d,null,2)}</pre>
            </div>
          ))}
          {res.exp && <div style={{color:res.expired?"#f87171":"#4ade80",fontSize:11,fontFamily:"monospace"}}>EXP: {res.exp.toISOString()} {res.expired?"(⚠️ SCADUTO)":"(✓ valido)"}</div>}
          <div style={{background:"#0a0700",border:"1px solid #1a0f00",padding:8,borderRadius:2}}>
            <div style={{color:"#6b3a00",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNATURE</div>
            <code style={{color:"#4b2800",fontSize:10,wordBreak:"break-all"}}>{res.signature}</code>
          </div>
        </div>
      )}
      {res?.error && <div style={{marginTop:8,color:"#f87171",fontSize:12,fontFamily:"monospace"}}>{res.error}</div>}
    </div>
  );
}

export function DNSPanel({ color }) {
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("A");
  const [ip, setIp] = useState("");
  const [dnsRes, setDnsRes] = useState(null);
  const [ipRes, setIpRes] = useState(null);
  const [crtRes, setCrtRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const dnsLookup = async () => {
    if (!domain) return;
    setLoading(true); setDnsRes(null);
    const r = await realTools.dnsLookup(domain, type);
    setDnsRes(r); setLoading(false);
  };

  const ipLookup = async () => {
    if (!ip) return;
    setLoading(true); setIpRes(null);
    const r = await realTools.ipInfo(ip);
    setIpRes(r); setLoading(false);
  };

  const certLookup = async () => {
    if (!domain) return;
    setLoading(true); setCrtRes(null);
    const r = await realTools.crtSh(domain);
    setCrtRes(r); setLoading(false);
  };

  const typeOpts = ["A","AAAA","MX","TXT","NS","CNAME","SOA","PTR","SRV","CAA"];

  return (
    <div style={{display:"grid",gap:12}}>
      {/* DNS */}
      <div style={{background:"#050300",border:"1px solid #1a0f00",padding:10,borderRadius:2}}>
        <div style={{color:"#6b3a00",fontSize:9,letterSpacing:2,marginBottom:6}}>DNS LOOKUP (Google DoH)</div>
        <div style={{display:"flex",gap:6}}>
          <input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="domain.com"
            style={{flex:1,background:"#000",border:`1px solid ${color}22`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"6px 10px",outline:"none"}}/>
          <select value={type} onChange={e=>setType(e.target.value)}
            style={{background:"#000",border:`1px solid ${color}22`,color:"#fbbf24",fontFamily:"monospace",fontSize:11,padding:"6px",outline:"none"}}>
            {typeOpts.map(t=><option key={t}>{t}</option>)}
          </select>
          <button onClick={dnsLookup} disabled={loading||!domain}
            style={{background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"6px 12px",cursor:"pointer",borderRadius:2}}>
            {loading?"...":"▶"}
          </button>
        </div>
        <button onClick={certLookup} disabled={loading||!domain}
          style={{marginTop:6,background:"none",border:"1px solid #1a0f00",color:"#6b3a00",fontFamily:"monospace",fontSize:9,padding:"4px 10px",cursor:"pointer",letterSpacing:1}}>
          CRT.SH — Certificate Transparency
        </button>
        {dnsRes && !dnsRes.error && (
          <div style={{marginTop:8}}>
            <div style={{color:"#f59e0b",fontSize:10,letterSpacing:1,marginBottom:4}}>STATUS: {dnsRes.Status===0?"OK":dnsRes.Status} · AUTH: {dnsRes.AA?"YES":"NO"} · RECURSIVE: {dnsRes.RD?"YES":"NO"}</div>
            {(dnsRes.Answer||[]).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,fontFamily:"monospace",fontSize:11,padding:"3px 0",borderBottom:"1px solid #0a0500"}}>
                <span style={{color:"#6b3a00",minWidth:50}}>{a.type===1?"A":a.type===28?"AAAA":a.type===15?"MX":a.type===16?"TXT":a.type===5?"CNAME":a.type===2?"NS":"TYPE"+a.type}</span>
                <span style={{color:"#fbbf24",flex:1,wordBreak:"break-all"}}>{a.data}</span>
                <span style={{color:"#3d2000",fontSize:10}}>TTL:{a.TTL}</span>
              </div>
            ))}
            {!dnsRes.Answer && <div style={{color:"#6b3a00",fontSize:11}}>Nessun record trovato</div>}
          </div>
        )}
        {dnsRes?.error && <div style={{color:"#f87171",fontSize:11,marginTop:6}}>{dnsRes.error}</div>}
        {crtRes && !crtRes.error && (
          <div style={{marginTop:8,maxHeight:180,overflowY:"auto"}}>
            <div style={{color:"#6b3a00",fontSize:9,letterSpacing:2,marginBottom:4}}>CERTIFICATI TROVATI ({crtRes.length})</div>
            {crtRes.map((c,i)=>(
              <div key={i} style={{fontFamily:"monospace",fontSize:10,color:"#c9956a",padding:"2px 0",borderBottom:"1px solid #0a0500"}}>{c.cn}</div>
            ))}
          </div>
        )}
      </div>
      {/* IP */}
      <div style={{background:"#050300",border:"1px solid #1a0f00",padding:10,borderRadius:2}}>
        <div style={{color:"#6b3a00",fontSize:9,letterSpacing:2,marginBottom:6}}>IP GEOLOCATION (ip-api.com)</div>
        <div style={{display:"flex",gap:6}}>
          <input value={ip} onChange={e=>setIp(e.target.value)} placeholder="8.8.8.8"
            style={{flex:1,background:"#000",border:`1px solid ${color}22`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"6px 10px",outline:"none"}}/>
          <button onClick={ipLookup} disabled={loading||!ip}
            style={{background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"6px 12px",cursor:"pointer",borderRadius:2}}>
            {loading?"...":"▶"}
          </button>
        </div>
        {ipRes && !ipRes.error && ipRes.status!=="fail" && (
          <div style={{marginTop:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {[["IP",ipRes.query],["Country",ipRes.country],["Region",ipRes.regionName],["City",ipRes.city],["ISP",ipRes.isp],["ORG",ipRes.org],["AS",ipRes.as],["Proxy",ipRes.proxy?"YES ⚠️":"NO"],["Hosting",ipRes.hosting?"YES":"NO"],["Mobile",ipRes.mobile?"YES":"NO"]].map(([k,v],i)=>(
              <div key={i} style={{display:"flex",gap:6,fontFamily:"monospace",fontSize:11}}>
                <span style={{color:"#6b3a00",minWidth:60,flexShrink:0}}>{k}:</span>
                <span style={{color:"#fbbf24"}}>{v||"—"}</span>
              </div>
            ))}
          </div>
        )}
        {(ipRes?.error||ipRes?.status==="fail") && <div style={{color:"#f87171",fontSize:11,marginTop:6}}>{ipRes.message||ipRes.error}</div>}
      </div>
    </div>
  );
}

export function NetworkPanel({ color }) {
  const [ip, setIp] = useState("");
  const [mask, setMask] = useState("24");
  const [res, setRes] = useState(null);
  
  const calc = () => {
    setRes(realTools.network.getSubnets(ip, mask));
  };

  const macExtract = () => {
    const m = realTools.network.extractMAC(ip);
    setRes({ macs: m.length ? m : ["Nessun MAC address trovato"] });
  };

  return (
    <div>
       <div style={{display:"flex",gap:6,marginBottom:10}}>
        <input value={ip} onChange={e=>setIp(e.target.value)} placeholder="IP (192.168.1.1) o testo con MAC..."
          style={{flex:1,background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px 12px",outline:"none"}}/>
        <input value={mask} onChange={e=>setMask(e.target.value)} placeholder="/24" type="number"
          style={{width:50,background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px",outline:"none",textAlign:"center"}}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        <button onClick={calc} style={{flex:1,background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"8px",cursor:"pointer"}}>CALCOLA SUBNET</button>
        <button onClick={macExtract} style={{flex:1,background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"8px",cursor:"pointer"}}>ESTRAI MAC</button>
      </div>
      
      {res && (
        <div style={{marginTop:10,background:"#050300",border:`1px solid ${color}33`,padding:"10px",borderRadius:2}}>
           {res.network ? (
             <div style={{display:"grid",gap:4,fontSize:11,fontFamily:"monospace",color:"#fbbf24"}}>
               <div>Network: <span style={{color:"#fff"}}>{res.network}/{mask}</span></div>
               <div>Broadcast: <span style={{color:"#fff"}}>{res.broadcast}</span></div>
               <div>First Host: <span style={{color:"#fff"}}>{res.firstHost}</span></div>
               <div>Last Host: <span style={{color:"#fff"}}>{res.lastHost}</span></div>
               <div>Hosts Usabili: <span style={{color:"#fff"}}>{res.hosts}</span></div>
             </div>
           ) : (
             <div style={{fontSize:11,fontFamily:"monospace",color:"#fbbf24"}}>
               {res.macs ? res.macs.join("\n") : "Errore nel calcolo"}
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export function WordlistPanel({ color }) {
  const [base, setBase] = useState("");
  const [words, setWords] = useState([]);
  const gen = () => setWords(realTools.generateWordlist(base));
  const dl = () => {
    const blob = new Blob([words.join("\n")], {type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wordlist_${base}.txt`;
    a.click();
  };

  return (
    <div>
      <div style={{display:"flex",gap:6}}>
        <input value={base} onChange={e=>setBase(e.target.value)} placeholder="parola base (es: password, mario, admin)"
          style={{flex:1,background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px 12px",outline:"none"}}/>
        <button onClick={gen} style={{background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"8px 16px",cursor:"pointer",letterSpacing:1,borderRadius:2}}>▶ GENERA</button>
      </div>
      {words.length > 0 && (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"8px 0 4px"}}>
            <span style={{color:"#6b3a00",fontSize:10,letterSpacing:1}}>{words.length} parole generate</span>
            <button onClick={dl} style={{background:"none",border:"1px solid #1a0f00",color:"#f59e0b",fontFamily:"monospace",fontSize:9,padding:"3px 10px",cursor:"pointer",letterSpacing:1}}>↓ DOWNLOAD .TXT</button>
          </div>
          <div style={{maxHeight:220,overflowY:"auto",background:"#050300",border:"1px solid #1a0f00",padding:8,borderRadius:2}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:2}}>
              {words.map((w,i)=><div key={i} style={{color:"#fbbf24",fontFamily:"monospace",fontSize:11,padding:"1px 4px"}}>{w}</div>)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function MagicPanel({ color }) {
  const [hex, setHex] = useState("");
  const [res, setRes] = useState(null);

  const run = () => {
    const r = realTools.identifyMagic(hex);
    setRes(r || { desc:"Non riconosciuto", magic:"—" });
  };

  return (
    <div>
      <div style={{color:"#6b3a00",fontSize:10,marginBottom:6,letterSpacing:1}}>Incolla i primi byte in hex (da xxd/hexdump):</div>
      <div style={{display:"flex",gap:6}}>
        <input value={hex} onChange={e=>setHex(e.target.value)} placeholder="ff d8 ff e0 / 89504e47..."
          style={{flex:1,background:"#050300",border:`1px solid ${color}33`,color:"#fbbf24",fontFamily:"monospace",fontSize:12,padding:"8px 12px",outline:"none"}}/>
        <button onClick={run} style={{background:"none",border:`1px solid ${color}55`,color,fontFamily:"monospace",fontSize:10,padding:"8px 16px",cursor:"pointer",borderRadius:2}}>▶ ID</button>
      </div>
      {res && (
        <div style={{marginTop:10,background:"#050300",border:`1px solid ${color}33`,borderLeft:`3px solid ${color}`,padding:"10px 14px",borderRadius:2}}>
          <div style={{color:"#fde68a",fontSize:16,fontWeight:"bold",marginBottom:4}}>{res.desc}</div>
          <div style={{color:"#6b3a00",fontFamily:"monospace",fontSize:11}}>Magic: {res.magic}</div>
        </div>
      )}
      <div style={{marginTop:12}}>
        <div style={{color:"#6b3a00",fontSize:9,letterSpacing:2,marginBottom:6}}>RIFERIMENTO RAPIDO</div>
        <div style={{display:"grid",gap:3,maxHeight:200,overflowY:"auto"}}>
          {Object.entries(realTools.magicBytes).map(([m,d],i)=>(
            <div key={i} style={{display:"flex",gap:10,fontFamily:"monospace",fontSize:10,padding:"2px 4px"}}>
              <code style={{color:"#f59e0b",minWidth:140,flexShrink:0}}>{m}</code>
              <span style={{color:"#6b3a00"}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
