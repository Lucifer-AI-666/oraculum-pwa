import { useState, useRef, useEffect } from "react";
import { agentLoop } from "./lib/agent.js";
import { SYSTEM_PROMPT, CATEGORIES, TOOL_TABS, parseMarkdown } from "./lib/config.jsx";
import {
  EncodePanel, AnalyzePanel, HashPanel, JWTPanel,
  DNSPanel, NetworkPanel, WordlistPanel, MagicPanel,
} from "./components/panels.jsx";

export default function CTFOraclev3() {
  const [mode, setMode] = useState("tools");   // "tools" | "ai"
  const [toolTab, setToolTab] = useState("encode");
  const [aiCat, setAiCat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const cat = CATEGORIES.find(c=>c.id===aiCat);
  const cc = cat?.color || "#f59e0b";

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const sendAI = async () => {
    const q = inp.trim(); if(!q||loading||!aiCat) return;
    setInp(""); setLoading(true);
    const newMsgs = [...msgs, {role:"user",content:q}];
    setMsgs(newMsgs);

    try {
      // Try Anthropic API with agent loop first (with tool calling)
      if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
        try {
          const reply = await agentLoop(
            newMsgs,
            (toolName, toolInput) => console.log(`🔧 Using tool: ${toolName}`),
            (toolName, result) => console.log(`✓ Tool result:`, result)
          );
          setMsgs(prev=>[...prev,{role:"assistant",content:reply}]);
          setLoading(false);
          setTimeout(()=>inputRef.current?.focus(),100);
          return;
        } catch (anthropicError) {
          console.warn("Anthropic API failed, falling back to Groq:", anthropicError.message);
        }
      }

      // Fallback: GROQ API (always available)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile",
          max_tokens:1000,
          messages:[{role:"system",content:SYSTEM_PROMPT},...newMsgs.map(m=>({role:m.role,content:m.content}))]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Errore API Groq: ${res.status}`);

      const reply = data.choices?.[0]?.message?.content || "Nessuna risposta dall'AI.";
      setMsgs(prev=>[...prev,{role:"assistant",content:reply}]);

    } catch(e) {
      setMsgs(prev=>[...prev,{role:"assistant",content:`❌ ERRORE: ${e.message}`}]);
    }

    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  return (
    <div style={{minHeight:"100vh",background:"#020100",color:"#d4a96a",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes flick{0%,91%,95%,100%{opacity:1}92%{opacity:.5}94%{opacity:.7}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#020100}::-webkit-scrollbar-thumb{background:#2a1a00}
        textarea,input,select{outline:none;border-radius:2px}
        .tab-btn:hover{opacity:1!important}
        .mode-btn:hover{background:#1a0f00!important}
      `}</style>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 50% 30%,transparent 40%,#000 100%)",pointerEvents:"none",zIndex:2}}/>

      <div style={{position:"relative",zIndex:10,maxWidth:920,margin:"0 auto",height:"100vh",display:"flex",flexDirection:"column",padding:"0 14px"}}>

        {/* HEADER */}
        <div style={{flexShrink:0,paddingTop:14,paddingBottom:8}}>
          <div style={{textAlign:"center",marginBottom:10}}>
            <div style={{fontSize:8,letterSpacing:6,color:"#4b2800",marginBottom:1}}>✦ CTF OFFENSIVE RESEARCH ✦</div>
            <h1 style={{margin:0,fontSize:26,fontWeight:900,color:"#f59e0b",letterSpacing:6,textShadow:"0 0 25px #f59e0b44",animation:"flick 8s infinite"}}>ORACULUM v3</h1>
            <div style={{fontSize:8,letterSpacing:3,color:"#3d2000"}}>REAL TOOLS + AI · CLAUDE OPUS</div>
          </div>

          {/* Mode switcher */}
          <div style={{display:"flex",justifyContent:"center",gap:0,marginBottom:10,border:"1px solid #1a0f00",borderRadius:2,overflow:"hidden",width:"fit-content",margin:"0 auto 10px"}}>
            {[["tools","⬡ TOOLS REALI"],["ai","◈ AI ORACLE"]].map(([m,l])=>(
              <button key={m} className="mode-btn" onClick={()=>setMode(m)}
                style={{background:mode===m?"#1a0f00":"none",border:"none",color:mode===m?"#f59e0b":"#4b2800",fontFamily:"monospace",fontSize:11,letterSpacing:2,padding:"7px 20px",cursor:"pointer",transition:"all .2s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── TOOLS MODE ────────────────────────────────── */}
        {mode === "tools" && (
          <div style={{flex:1,overflowY:"auto",paddingBottom:16}}>
            {/* Tool tabs */}
            <div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:10,borderBottom:"1px solid #1a0f00",paddingBottom:6}}>
              {TOOL_TABS.map(t=>(
                <button key={t.id} className="tab-btn" onClick={()=>setToolTab(t.id)}
                  style={{background:toolTab===t.id?"#0a0700":"none",border:`1px solid ${toolTab===t.id?"#f59e0b44":"transparent"}`,color:toolTab===t.id?"#f59e0b":"#4b2800",fontFamily:"monospace",fontSize:9,letterSpacing:2,padding:"4px 10px",cursor:"pointer",borderRadius:2,transition:"all .2s",opacity:toolTab!==t.id?0.6:1}}>
                  {t.sigil} {t.label}
                </button>
              ))}
            </div>

            <div style={{animation:"fadeUp .3s"}}>
              {toolTab==="encode"   && <EncodePanel   color="#f59e0b"/>}
              {toolTab==="analyze"  && <AnalyzePanel  color="#a78bfa"/>}
              {toolTab==="hash"     && <HashPanel     color="#ef4444"/>}
              {toolTab==="jwt"      && <JWTPanel      color="#34d399"/>}
              {toolTab==="dns"      && <DNSPanel      color="#67e8f9"/>}
              {toolTab==="network"  && <NetworkPanel  color="#10b981"/>}
              {toolTab==="wordlist" && <WordlistPanel  color="#fb923c"/>}
              {toolTab==="magic"    && <MagicPanel    color="#e879f9"/>}
            </div>
          </div>
        )}

        {/* ── AI MODE ───────────────────────────────────── */}
        {mode === "ai" && (
          <>
            {/* Category selector */}
            <div style={{flexShrink:0,marginBottom:8}}>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                {CATEGORIES.map(c=>(
                  <button key={c.id} onClick={()=>{setAiCat(c.id);setMsgs([]);}}
                    style={{background:aiCat===c.id?`${c.color}18`:"none",border:`1px solid ${aiCat===c.id?c.color:"#2a1500"}`,color:aiCat===c.id?c.color:"#4b2800",fontFamily:"monospace",fontSize:10,letterSpacing:2,padding:"3px 10px",cursor:"pointer",transition:"all .2s",borderRadius:2,opacity:aiCat&&aiCat!==c.id?0.4:1}}>
                    {c.sigil} {c.label}
                  </button>
                ))}
              </div>
              {cat && <div style={{borderTop:"1px solid #180e00",paddingTop:5,fontSize:9,color:"#3d2000",letterSpacing:2}}>✦ Threat Modeling · Pattern Recognition · Pivot Thinking attivi</div>}
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
              {!aiCat && (
                <div style={{textAlign:"center",padding:"40px 20px",color:"#4b2800",fontSize:10,letterSpacing:3}}>
                  SELEZIONA UNA CATEGORIA<br/><span style={{fontSize:9,color:"#2a1500"}}>per attivare l'oracle specializzato</span>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} style={{marginBottom:16,display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",animation:"fadeUp .2s"}}>
                  <div style={{fontSize:8,color:"#4b2800",letterSpacing:2,marginBottom:2}}>{m.role==="user"?"▶ TU":`${cat?.sigil} ORACULUM`}</div>
                  <div style={{maxWidth:"90%",background:m.role==="user"?"#0c0800":"#080600",border:`1px solid ${m.role==="user"?cc+"33":"#1a0e00"}`,borderLeft:m.role==="user"?"none":`3px solid ${cc}55`,padding:"10px 14px",borderRadius:2}}>
                    {m.role==="user"
                      ? <p style={{color:cc,fontSize:13,margin:0,lineHeight:1.7}}>{m.content}</p>
                      : parseMarkdown(m.content)
                    }
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:8,color:"#4b2800",letterSpacing:2,marginBottom:2}}>{cat?.sigil} ORACULUM</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"10px 14px",background:"#080600",border:"1px solid #1a0e00",borderLeft:`3px solid ${cc}55`,borderRadius:2}}>
                    {[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:cc,animation:`pulse 1.1s ${i*.18}s infinite`}}/>)}
                    <span style={{color:"#4b2800",fontSize:10,marginLeft:4}}>elaborazione...</span>
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* Input */}
            {aiCat && (
              <div style={{flexShrink:0,paddingBottom:14,borderTop:"1px solid #180e00",paddingTop:8}}>
                <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
                  <div style={{flex:1,border:`1px solid ${cc}33`,background:"#050300",borderRadius:2}}>
                    <textarea ref={inputRef} value={inp} rows={3}
                      onChange={e=>setInp(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAI();}}}
                      placeholder={`Challenge ${cat?.label}...`}
                      style={{width:"100%",background:"none",border:"none",color:cc,fontFamily:"monospace",fontSize:13,padding:"9px 12px",lineHeight:1.65,resize:"none"}}/>
                  </div>
                  <button onClick={sendAI} disabled={loading||!inp.trim()}
                    style={{height:66,width:66,background:"none",border:`1px solid ${cc}44`,color:cc,fontSize:18,cursor:loading?"not-allowed":"pointer",borderRadius:2,flexShrink:0}}>
                    {loading?"◈":"▶"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
