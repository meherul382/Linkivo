"use client";

import { useEffect, useState } from "react";

type SavedLink={slug:string;shortUrl:string;destinationUrl:string;createdAt:string};
type Analytics={slug:string;shortUrl:string;destinationUrl:string;clicks:number;today:number};

export default function AnalyticsOverview(){
  const [links,setLinks]=useState<Analytics[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      try{
        const saved=JSON.parse(localStorage.getItem("canvalives_my_links")||"[]") as SavedLink[];
        const results=await Promise.all(saved.map(async l=>{
          try{
            const r=await fetch("/api/analytics/"+l.slug,{cache:"no-store"});
            const d=await r.json();
            return {slug:l.slug,shortUrl:l.shortUrl,destinationUrl:l.destinationUrl,clicks:Number(d?.link?.clicks||0),today:Number(d?.todayClicks||0)};
          }catch{return {slug:l.slug,shortUrl:l.shortUrl,destinationUrl:l.destinationUrl,clicks:0,today:0};}
        }));
        setLinks(results);
      }finally{setLoading(false);}
    }
    load();
  },[]);

  const total=links.reduce((s,x)=>s+x.clicks,0), today=links.reduce((s,x)=>s+x.today,0);

  return <main className="page"><div className="container">
    <header className="header"><a className="brand" href="/"><span className="logo">C</span><span>canvalives</span></a><nav><a href="/">⌂ Home</a><a href="/links">↗ My Links</a><a className="active" href="/analytics">◉ Analytics</a></nav></header>
    <section className="title"><p>PERFORMANCE</p><h1>Analytics</h1><span>Click activity across all your saved short links.</span></section>
    <div className="stats"><div><small>Total Links</small><strong>{links.length}</strong></div><div><small>Total Clicks</small><strong>{total}</strong></div><div><small>Today</small><strong>{today}</strong></div></div>
    {loading?<div className="empty">Loading analytics...</div>:!links.length?<div className="empty">No links yet. <a href="/">Create your first short link →</a></div>:
    <section className="table"><div className="thead"><span>Short Link</span><span>Destination</span><span>Clicks</span><span>Today</span><span></span></div>{links.map(l=><div className="tr" key={l.slug}><a href={l.shortUrl}>{l.shortUrl}</a><span>{l.destinationUrl}</span><strong>{l.clicks}</strong><strong>{l.today}</strong><a href={"/analytics/"+l.slug}>Details →</a></div>)}</section>}
    <style jsx>{`
      .page{min-height:100vh;background:#07111f;color:#f7fbff;font-family:Inter,system-ui,sans-serif}.container{max-width:1120px;margin:auto;padding:0 20px}.header{height:86px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-size:20px;font-weight:800}.logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#7c5cff,#1fd6ff)}nav{display:flex;gap:8px}nav a{padding:10px 14px;border-radius:12px;color:#93a6bd;text-decoration:none;font-size:13px}nav a:hover,nav .active{background:rgba(57,217,255,.08);color:#fff}
      .title{padding:55px 0 25px}.title p{color:#75cfff;letter-spacing:.18em;font-size:11px;font-weight:700}.title h1{font-size:48px;margin:10px 0}.title span{color:#8194ab}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:15px 0 24px}.stats div{padding:22px;border:1px solid #203650;border-radius:18px;background:#0c1d31}.stats small{color:#7f95ad}.stats strong{display:block;font-size:32px;margin-top:8px}.table{border:1px solid #203650;border-radius:18px;overflow:hidden;margin-bottom:70px}.thead,.tr{display:grid;grid-template-columns:1.1fr 2fr .5fr .5fr .7fr;gap:15px;padding:16px 18px;align-items:center}.thead{background:#0c1d31;color:#7f95ad;font-size:12px}.tr{border-top:1px solid #172b43;font-size:13px}.tr a:first-child{color:#6ee2ff;text-decoration:none;font-weight:700;word-break:break-all}.tr span{color:#a1b1c5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tr a:last-child{color:#8edfff;text-decoration:none}.empty{padding:50px;text-align:center;border:1px solid #203650;border-radius:18px;color:#8093aa}.empty a{color:#6ee2ff;text-decoration:none}
      @media(max-width:700px){.header{height:auto;padding:18px 0;gap:15px;flex-direction:column;align-items:stretch}nav{width:100%}nav a{flex:1;text-align:center}.stats{grid-template-columns:1fr}.table{overflow:auto}.thead,.tr{min-width:720px}.title h1{font-size:38px}}
    `}</style>
  </div></main>;
}
