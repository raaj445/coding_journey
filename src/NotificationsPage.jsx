import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Check, Clock3, UserRound, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import UniversalSidebar from "./UniversalSidebar";

export default function NotificationsPage({ user, onBack, onNavigate, onLogout }) {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [notice,setNotice]=useState("");
  const [profile,setProfile]=useState(null);
  const [busyRequest,setBusyRequest]=useState("");
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
  async function reviewRequest(n,status){
    if(!n?.entity_id)return;
    setBusyRequest(n.entity_id);
    const {error}=await supabase.rpc("process_community_join_request",{p_request_id:n.entity_id,p_status:status});
    setBusyRequest("");
    if(error){setNotice(error.message||"Could not process this request.");return;}
    setItems(v=>v.filter(item=>item.entity_id!==n.entity_id || item.type!=="JOIN_REQUEST"));
    setNotice(status==="ACCEPTED"?"Request accepted. The requester is now a community member.":"Request rejected.");
  }
  async function viewProfile(userId){
    if(!userId)return;
    const {data,error}=await supabase.from("profiles").select("id,full_name,username,bio,state,city,avatar_url").eq("id",userId).maybeSingle();
    if(error){setNotice("Could not load this profile.");return;}
    setProfile(data||{full_name:"Community member"});
  }
  return <main className="notifications-page-shell">
    <UniversalSidebar activeNav="Notifications" onNavigate={onNavigate} onLogout={onLogout}/>
    <section className="notifications-page-content">
      <button className="profile-back" onClick={onBack}><ArrowLeft size={16}/> Back</button>
      <div className="notifications-heading"><div><span>CONNECTHUB</span><h1>Notifications</h1><p>Community activity and account updates in one place.</p></div><button onClick={markAll}><Check size={14}/> Mark all read</button></div>
      {notice&&<div className="notifications-feedback" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
      <section className="notifications-card">{loading?<div className="notifications-empty">Loading notifications...</div>:!items.length?<div className="notifications-empty"><Bell size={28}/><b>You're all caught up</b><span>No notifications yet.</span></div>:items.map(n=><article className={n.read_at?"notification-row":"notification-row unread"} key={n.id}><div className="notification-icon"><Bell size={16}/></div><div className="notification-row-content"><b>{n.title}</b><p>{n.body}</p><small><Clock3 size={11}/> {new Date(n.created_at).toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}</small>{n.type==="JOIN_REQUEST"&&<div className="notification-join-actions"><button onClick={()=>viewProfile(n.actor_id)}>View Profile</button><button disabled={busyRequest===n.entity_id} onClick={()=>reviewRequest(n,"ACCEPTED")}>{busyRequest===n.entity_id?"Working...":"Accept"}</button><button disabled={busyRequest===n.entity_id} onClick={()=>reviewRequest(n,"REJECTED")}>Reject</button></div>}</div></article>)}</section>
      {profile&&<div className="notification-profile-overlay" role="dialog" aria-modal="true"><section className="notification-profile-card"><button className="notification-profile-close" onClick={()=>setProfile(null)} aria-label="Close profile"><X size={18}/></button><div className="notification-profile-avatar">{profile.avatar_url?<img src={profile.avatar_url} alt=""/>:<UserRound size={25}/>}</div><h2>{profile.full_name||profile.username||"Community member"}</h2>{profile.username&&<p>@{profile.username}</p>}{profile.bio&&<p>{profile.bio}</p>}{(profile.city||profile.state)&&<p>{[profile.city,profile.state].filter(Boolean).join(", ")}</p>}<button className="notification-profile-done" onClick={()=>setProfile(null)}>Close</button></section></div>}
    </section>
  </main>;
}
