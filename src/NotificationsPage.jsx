import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Check, Clock3 } from "lucide-react";
import { supabase } from "./lib/supabase";
import UniversalSidebar from "./UniversalSidebar";

export default function NotificationsPage({ user, onBack, onNavigate, onLogout }) {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  async function load(){
    if(!user?.id){setLoading(false);return;}
    const {data}=await supabase.from("community_notifications").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50);
    setItems(data||[]);setLoading(false);
  }
  useEffect(()=>{
    load();
    if(!user?.id)return;
    const channel=supabase.channel("global-notifications-"+user.id)
      .on("postgres_changes",{event:"*",schema:"public",table:"community_notifications",filter:"user_id=eq."+user.id},load)
      .subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[user?.id]);
  async function markAll(){
    const ids=items.filter(x=>!x.read_at).map(x=>x.id);if(!ids.length)return;
    const now=new Date().toISOString();
    await supabase.from("community_notifications").update({read_at:now}).in("id",ids);
    setItems(v=>v.map(x=>({...x,read_at:x.read_at||now})));
  }
  return <main className="notifications-page-shell">
    <UniversalSidebar activeNav="Notifications" onNavigate={onNavigate} onLogout={onLogout}/>
    <section className="notifications-page-content">
      <button className="profile-back" onClick={onBack}><ArrowLeft size={16}/> Back</button>
      <div className="notifications-heading"><div><span>CONNECTHUB</span><h1>Notifications</h1><p>Community activity and account updates in one place.</p></div><button onClick={markAll}><Check size={14}/> Mark all read</button></div>
      <section className="notifications-card">{loading?<div className="notifications-empty">Loading notifications...</div>:!items.length?<div className="notifications-empty"><Bell size={28}/><b>You're all caught up</b><span>No notifications yet.</span></div>:items.map(n=><article className={n.read_at?"notification-row":"notification-row unread"} key={n.id}><div className="notification-icon"><Bell size={16}/></div><div><b>{n.title}</b><p>{n.body}</p><small><Clock3 size={11}/> {new Date(n.created_at).toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}</small></div></article>)}</section>
    </section>
  </main>;
}
