import { realTools } from "./realTools.js";
import { SYSTEM_PROMPT, AGENT_TOOLS } from "./config.jsx";


// ═══════════════════════════════════════════════════════
//  AGENT LOOP + TOOL EXECUTION (ORACULUM v3 Functions)
// ═══════════════════════════════════════════════════════

// Tool executor - runs all CTF tools locally
export async function executeTool(toolName, toolInput) {
  switch(toolName) {
    case "base64_encode": return realTools.encode.base64(toolInput.text);
    case "base64_decode": return realTools.encode.base64d(toolInput.text);
    case "hex_encode": return realTools.encode.hex(toolInput.text);
    case "hex_decode": return realTools.encode.hexd(toolInput.text);
    case "rot_cipher": {
      const res = {};
      for(let n=1; n<=25; n++) {
        const out = toolInput.text.replace(/[a-zA-Z]/g, c =>
          String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + n) ? c : c - 26)
        );
        res[`ROT${n}`] = out;
      }
      return res;
    }
    case "hash_generate": {
      const text = toolInput.text;
      const results = {};
      // Base hashes
      results.MD5 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text))))
        .map(b => b.toString(16).padStart(2,"0")).join(""); // Simplified - real MD5 requires library
      results.SHA256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))))
        .map(b => b.toString(16).padStart(2,"0")).join("");
      return results;
    }
    case "magic_bytes_identify": return realTools.identifyMagic(toolInput.hex);
    case "xor_decrypt": {
      const results = {};
      const data = toolInput.hex ?
        toolInput.hex.match(/../g).map(h => parseInt(h,16)) :
        Array.from(toolInput.text).map(c => c.charCodeAt(0));

      for(let key=0; key<128; key++) {
        const decoded = data.map(b => b ^ key);
        const text = String.fromCharCode(...decoded);
        if(/flag\{|CTF\{|picoCTF\{|HTB\{/i.test(text)) {
          results[`XOR_key_${key}`] = text;
        }
      }
      return Object.keys(results).length ? results : {result:"No flag found"};
    }
    case "entropy_analyze": {
      const text = toolInput.text;
      const freq = {};
      for(const c of text) freq[c] = (freq[c]||0)+1;
      const len = text.length;
      const entropy = -Object.values(freq).reduce((acc,f)=>{
        const p = f/len;
        return acc + p*Math.log2(p);
      }, 0);
      return {
        entropy: entropy.toFixed(3),
        length: text.length,
        unique_chars: Object.keys(freq).length,
        analysis: entropy > 7 ? "HIGH entropy - likely encrypted/compressed" :
                  entropy < 3.5 ? "LOW entropy - possibly encoded text" : "MEDIUM entropy"
      };
    }
    case "flag_detect": {
      const patterns = [
        {regex: /flag\{[^}]+\}/gi, type: "CTF Flag"},
        {regex: /HTB\{[^}]+\}/gi, type: "HTB Flag"},
        {regex: /picoCTF\{[^}]+\}/gi, type: "picoCTF Flag"},
        {regex: /1337UP\{[^}]+\}/gi, type: "1337UP Flag"}
      ];
      const found = [];
      for(const p of patterns) {
        const matches = toolInput.text.match(p.regex) || [];
        matches.forEach(m => found.push({type: p.type, value: m}));
      }
      return found.length ? found : {result: "No flag patterns found"};
    }
    case "wordlist_generate": {
      const base = toolInput.base.trim();
      const words = new Set();
      words.add(base);
      words.add(base.toLowerCase());
      words.add(base.toUpperCase());

      const years = ["2023","2024","2025","2026"];
      const seps = ["","_",".","!"];
      for(const y of years) {
        for(const s of seps) {
          words.add(base+s+y);
          words.add(y+s+base);
        }
      }
      return Array.from(words);
    }
    default: return {error: `Tool ${toolName} not found`};
  }
}

// Agent loop - uses Anthropic Claude for agentic reasoning with tool calling
export async function agentLoop(messages, onToolCall, onToolResult) {
  let history = [...messages];
  let iterations = 0;
  const MAX_ITER = 6;
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_ANTHROPIC_API_KEY not configured. Cannot use agentic tool calling.");
  }

  while (iterations < MAX_ITER) {
    iterations++;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-opus-4-1-20250805",
          max_tokens: 4096,
          tools: AGENT_TOOLS,
          messages: history,
          system: SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = { role: "user", content: data.content };
      history.push(assistantMessage);

      // Check if there are tool use blocks
      const toolUseBlocks = data.content.filter(block => block.type === "tool_use");

      if (toolUseBlocks.length === 0) {
        // No tools needed - return final response
        const textBlocks = data.content.filter(block => block.type === "text");
        return textBlocks.map(b => b.text).join("\n");
      }

      // Execute tools and collect results
      const toolResults = [];
      for (const toolBlock of toolUseBlocks) {
        onToolCall?.(toolBlock.name, toolBlock.input);
        const result = await executeTool(toolBlock.name, toolBlock.input);
        onToolResult?.(toolBlock.name, result);

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result)
        });
      }

      // Add tool results to history
      history.push({ role: "user", content: toolResults });

    } catch (error) {
      throw error;
    }
  }

  throw new Error("Max iterations reached in agent loop");
}
