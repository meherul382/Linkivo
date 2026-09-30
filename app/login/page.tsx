"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../../lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function login(e:React.FormEvent){
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase=getSupabaseBrowser();
    const email=username.trim().toLowerCase()==="admin" ? "admin@canvalives.com" : "";
    if(!email){
      setError("Use the admin username.");
      setLoading(false);
      return;
    }
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){
      setError("Username or password is incorrect.");
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return <main className="page">
    <div className="login-card">
      <div className="logo">C</div>
      <p className="eyebrow">PRIVATE ACCESS</p>
      <h1>Welcome back</h1>
      <p className="sub">Sign in to your canvalives dashboard.</p>
      <form onSubmit={login}>
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" autoComplete="username" required /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required /></label>
        {error&&<div className="error">{error}</div>}
        <button disabled={loading}>{loading?"Signing in...":"Sign in →"}</button>
      </form>
    </div>
    <style jsx>{`
      .page{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 10%,rgba(80,112,255,.2),transparent 35%),#07111f;color:#f7fbff;font-family:Inter,system-ui,sans-serif}
      .login-card{width:min(430px,100%);padding:34px;border:1px solid rgba(255,255,255,.1);border-radius:26px;background:rgba(10,24,43,.86);box-shadow:0 30px 90px rgba(0,0,0,.3)}
      .logo{width:50px;height:50px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(135deg,#7c5cff,#1fd6ff);font-size:22px;font-weight:900;margin-bottom:22px}
      .eyebrow{letter-spacing:.18em;color:#75cfff;font-size:11px;font-weight:800}.login-card h1{font-size:34px;margin:10px 0 8px}.sub{color:#8194ab;font-size:14px;margin-bottom:28px}
      label{display:block;color:#dbe6f2;font-size:13px;margin:16px 0}input{box-sizing:border-box;width:100%;margin-top:8px;padding:14px 15px;border:1px solid #233957;background:#091728;color:#fff;border-radius:12px;outline:none}input:focus{border-color:#39d9ff}
      button{width:100%;margin-top:12px;padding:14px;border:0;border-radius:12px;background:linear-gradient(90deg,#7658ff,#18cfff);color:#fff;font-weight:800;cursor:pointer}button:disabled{opacity:.65}.error{padding:11px 13px;border-radius:10px;background:#3a1821;border:1px solid #703043;color:#ffb5c2;font-size:13px}
    `}</style>
  </main>;
}