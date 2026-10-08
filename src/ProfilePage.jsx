import { useEffect, useState } from "react";
import { ArrowLeft, Camera, MapPin, UserRound } from "lucide-react";
import { supabase } from "./lib/supabase";
import UniversalSidebar from "./UniversalSidebar";

export default function ProfilePage({ user, onBack, onNavigate, onLogout }) {
  const [profile,setProfile]=useState({full_name:"",username:"",bio:"",mobile:"",state:"",city:"",avatar_url:""});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    let alive=true;
    async function load(){
      if(!user?.id){setLoading(false);return;}
      const {data}=await supabase.from("profiles").select("full_name,username,bio,mobile,state,city,avatar_url").eq("id",user.id).maybeSingle();
      if(alive){
        setProfile(data || {
          full_name:user.user_metadata?.full_name || user.user_metadata?.name || "",
          username:"",
          bio:"",
          mobile:user.user_metadata?.mobile || "",
          state:user.user_metadata?.state || "",
          city:user.user_metadata?.city || "",
          avatar_url:user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
        });
        setLoading(false);
      }
    }
    load();
    return()=>{alive=false};
  },[user?.id]);

  async function save(){
    setSaving(true);setMessage("");
    const {error}=await supabase.from("profiles").upsert({id:user.id,...profile,updated_at:new Date().toISOString()});
    if(error)setMessage(error.message);
    else setMessage("Profile updated successfully.");
    setSaving(false);
  }

  return <main className="profile-page-shell">
    <UniversalSidebar activeNav="Profile" onNavigate={onNavigate} onLogout={onLogout}/>
    <section className="profile-page-content">
      <button className="profile-back" onClick={onBack}><ArrowLeft size={16}/> Back</button>
      <div className="profile-page-heading"><div><span>YOUR PROFILE</span><h1>Profile</h1><p>Manage the information other ConnectHub members see.</p></div></div>
      <section className="profile-card">
        <div className="profile-hero">
          <div className="profile-large-avatar">{profile.avatar_url?<img src={profile.avatar_url} alt=""/>:<UserRound size={42}/>}<span><Camera size={13}/></span></div>
          <div><h2>{profile.full_name || "Your name"}</h2><p>{user?.email}</p></div>
        </div>
        {loading ? <div className="profile-loading">Loading profile...</div> : <div className="profile-form">
          <label><span>Full name</span><input value={profile.full_name||""} onChange={e=>setProfile({...profile,full_name:e.target.value})}/></label>
          <label><span>Username</span><input value={profile.username||""} onChange={e=>setProfile({...profile,username:e.target.value.replace(/[^a-zA-Z0-9_.-]/g,"").slice(0,30)})} placeholder="e.g. amartya_raj"/></label>
          <label className="profile-full"><span>Bio</span><textarea value={profile.bio||""} maxLength={240} onChange={e=>setProfile({...profile,bio:e.target.value})} placeholder="Tell the community a little about yourself."/></label>
          <label><span>Mobile</span><input value={profile.mobile||""} onChange={e=>setProfile({...profile,mobile:e.target.value.replace(/\D/g,"").slice(0,10)})}/></label>
          <label><span>State</span><input value={profile.state||""} onChange={e=>setProfile({...profile,state:e.target.value})}/></label>
          <label><span>City</span><div className="profile-input-icon"><MapPin size={15}/><input value={profile.city||""} onChange={e=>setProfile({...profile,city:e.target.value})}/></div></label>
          <label className="profile-full"><span>Avatar URL</span><input value={profile.avatar_url||""} onChange={e=>setProfile({...profile,avatar_url:e.target.value})} placeholder="https://..."/></label>
        </div>}
        {message&&<div className={message.includes("successfully")?"profile-success":"profile-error"}>{message}</div>}
        <div className="profile-actions"><button onClick={onBack}>Cancel</button><button className="profile-save" onClick={save} disabled={saving||loading}>{saving?"Saving...":"Save Changes"}</button></div>
      </section>
    </section>
  </main>;
}
