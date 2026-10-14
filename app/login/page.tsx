"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../../lib/supabase/browser";

export default function LoginPage() {
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function login(e:React.FormEvent){
    e.preventDefault();setError("");setLoading(true);
    const {error}=await getSupabaseBrowser().auth.signInWithPassword({email:email.trim(),password});
    if(error){setError("Email or password is incorrect.");setLoading(false);return;}
    router.replace("/");router.refresh();
  }
  return <main className="page"><div className="gridGlow"/><section className="login">
    <a href="/" className="brand"><span className="logo">L</span><span>Linkivo</span></a>
    <div className="eyebrow"><span/> PRIVATE ACCESS</div><h1>Welcome<br/><em>back.</em></h1>
    <p className="sub">Sign in to your personal workspace.</p>
    <form onSubmit={login}><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required/></label>{error&&<div className="error">{error}</div>}<button disabled={loading}>{loading?"Signing in…":"Sign in securely"} <span>→</span></button></form>
    <div className="note"><span>◆</span> Private workspace · No public registration</div>
  </section><aside className="side"><div className="orbit o1"/><div className="orbit o2"/><div className="orbit o3"/><div className="sideText"><span className="step">YOUR LINKS, YOUR SPACE</span><h2>Smaller links.<br/><span>Clearer control.</span></h2><p>A focused workspace to create and manage short links, keep destinations editable, and see click activity.</p><div className="miniStats"><div><strong>302</strong><small>Fast redirects</small></div><div><strong>Private</strong><small>Single-owner access</small></div></div></div></aside>
    <style jsx>{`
      .page{min-height:100vh;display:grid;grid-template-columns:minmax(360px,.9fr) 1.1fr;background:#080e1a;color:#f5f7ff;font-family:Inter,system-ui,sans-serif}.gridGlow{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(#1b294022 1px,transparent 1px),linear-gradient(90deg,#1b294022 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to right,black,transparent 62%)}.login{width:min(410px,calc(100% - 48px));margin:auto;padding:55px 0;position:relative;z-index:1}.brand{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:850;margin-bottom:56px}.logo{width:38px;height:38px;display:grid;place-items:center;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:12px;box-shadow:0 8px 25px #4f46e533}.eyebrow{display:flex;align-items:center;gap:8px;color:#77dce8;font-weight:800;letter-spacing:.16em;font-size:10px}.eyebrow span{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 5px #34d3991c}h1{font-size:54px;letter-spacing:-.055em;line-height:1.02;margin:20px 0 13px}h1 em{font-style:normal;color:#a78bfa}.sub{font-size:13px;color:#8393a9;margin-bottom:33px}label{display:block;color:#cbd5e1;font-size:12px;margin:18px 0}input{display:block;width:100%;box-sizing:border-box;margin-top:9px;padding:14px;border:1px solid #2b3b51;background:#0b1523;color:#f8fafc;border-radius:10px;outline:none}input:focus{border-color:#818cf8;box-shadow:0 0 0 3px #818cf81c}button{display:flex;justify-content:space-between;align-items:center;width:100%;padding:14px 16px;margin-top:24px;background:linear-gradient(95deg,#7c3aed,#0891b2);color:white;border:0;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer}button:disabled{opacity:.65}.error{margin-top:12px;padding:11px;border:1px solid #70364a;background:#351b2a;border-radius:9px;color:#ffbcc8;font-size:12px}.note{margin-top:25px;font-size:10px;color:#6f8198}.note span{color:#67e8f9;margin-right:8px}
      .side{position:relative;overflow:hidden;border-left:1px solid #1c293c;background:radial-gradient(ellipse at 70% 30%,#29214a 0%,transparent 48%),radial-gradient(ellipse at 20% 80%,#103447 0%,transparent 45%),#0b1321;display:flex;align-items:center;padding:9%;min-height:100vh}.side:after{content:"";position:absolute;inset:0;background-image:linear-gradient(#29364a2b 1px,transparent 1px),linear-gradient(90deg,#29364a2b 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(black,transparent)}.sideText{position:relative;z-index:2;max-width:520px}.step{font-size:10px;letter-spacing:.18em;font-weight:800;color:#8b9cff}.side h2{font-size:clamp(40px,5vw,65px);letter-spacing:-.055em;line-height:1.07;margin:25px 0}.side h2 span{color:#67e8f9}.side p{max-width:450px;color:#96a5ba;font-size:14px;line-height:1.9}.miniStats{display:flex;gap:48px;margin-top:45px}.miniStats div{display:flex;flex-direction:column;gap:7px}.miniStats strong{font-size:20px}.miniStats small{font-size:11px;color:#7587a0}.orbit{position:absolute;border:1px solid #8070c226;border-radius:50%;width:650px;height:650px;right:-245px;top:9%;z-index:1}.o2{width:480px;height:480px;right:-160px;top:20%;border-color:#67e8f922}.o3{width:310px;height:310px;right:-76px;top:32%;border-color:#a78bfa2b}
      @media(max-width:800px){.page{grid-template-columns:1fr}.side{display:none}.login{padding:38px 0}.brand{margin-bottom:42px}}
    `}</style></main>;
}
