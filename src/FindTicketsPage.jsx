import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, CalendarDays, ChevronDown, Clock3, Flag, Heart, Home, MapPin, MessageCircle, Music2, Search, SlidersHorizontal, Ticket, UserRound, Users, X, Tag } from "lucide-react";
import { supabase } from "./lib/supabase";
import TrainArtwork from "./TrainArtwork";
import UniversalSidebar from "./UniversalSidebar";

const money = value => value == null ? "—" : "₹" + Number(value).toLocaleString("en-IN");
const dateText = value => value ? new Date(value + (value.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";

export default function FindTicketsPage({ user, onBack, onNavigate, onLogout }) {
  const [category,setCategory]=useState("ALL");
  const [search,setSearch]=useState("");
  const [state,setState]=useState("");
  const [city,setCity]=useState("");
  const [date,setDate]=useState("");
  const [maxPrice,setMaxPrice]=useState("");
  const [sort,setSort]=useState("DATE");
  const [listings,setListings]=useState([]);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [stationLocations,setStationLocations]=useState({});
  const [stateCities,setStateCities]=useState({});
  const [favorites,setFavorites]=useState([]);
  const [favoriteBusy,setFavoriteBusy]=useState("");
  const [reportTarget,setReportTarget]=useState(null);
  const [reportReason,setReportReason]=useState("SUSPICIOUS_OR_SCAM");
  const [reportDetails,setReportDetails]=useState("");
  const [reportSubmitting,setReportSubmitting]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      setLoading(true); setError("");
      const [tr,mv,co]=await Promise.all([
        supabase.from("listings").select("id,seller_id,train_number,train_name,from_code,from_name,to_code,to_name,journey_date,departure_at,status,ticket_count,price_mode,price_per_ticket,ready_to_bargain,description,created_at").eq("status","ACTIVE").neq("seller_id", user?.id || "").gt("departure_at",new Date().toISOString()).order("departure_at",{ascending:true}).limit(60),
        supabase.from("movie_listings").select("id,seller_id,movie_name,poster_url,state,city,cinema_hall,show_date,show_time,show_at,language,format,status,ticket_count,price_mode,price_per_ticket,ready_to_bargain,description,created_at").eq("status","ACTIVE").neq("seller_id", user?.id || "").gt("show_at",new Date().toISOString()).order("show_at",{ascending:true}).limit(60),
        supabase.from("concert_listings").select("id,seller_id,event_name,artist_name,state,city,venue,event_date,event_time,event_at,status,ticket_count,ticket_type,seat_type,price_mode,price_per_ticket,ready_to_bargain,description,created_at").eq("status","ACTIVE").neq("seller_id", user?.id || "").gt("event_at",new Date().toISOString()).order("event_at",{ascending:true}).limit(60)
      ]);
      if(cancelled)return;
      const errors=[tr.error,mv.error,co.error].filter(Boolean);
      if(errors.length && !tr.data?.length && !mv.data?.length && !co.data?.length){setError(errors[0].message);setLoading(false);return;}
      const normalized=[
        ...(tr.data||[]).map(x=>({...x,kind:"TRAIN",title:x.train_name||"Train Ticket",place:x.from_name+" → "+x.to_name,eventAt:x.departure_at,price:x.price_per_ticket})),
        ...(mv.data||[]).map(x=>({...x,kind:"MOVIE",title:x.movie_name||"Movie Ticket",place:x.cinema_hall+" · "+x.city,eventAt:x.show_at,price:x.price_per_ticket})),
        ...(co.data||[]).map(x=>({...x,kind:"CONCERT",title:x.event_name||"Concert Ticket",place:x.venue+" · "+x.city,eventAt:x.event_at,price:x.price_per_ticket}))
      ];
      setListings(normalized);
      setLoading(false);
    }
    load(); return ()=>{cancelled=true};
  },[user?.id]);

  useEffect(()=>{
    let cancelled=false;
    async function loadFavorites(){
      if(!user?.id){setFavorites([]);return;}
      const {data,error}=await supabase.from("listing_favorites").select("listing_kind,listing_id").eq("user_id",user.id);
      if(!cancelled) setFavorites(error ? [] : (data||[]).map(row=>row.listing_kind+":"+row.listing_id));
    }
    loadFavorites();
    return ()=>{cancelled=true};
  },[user?.id]);

  useEffect(()=>{
    let cancelled=false;
    async function loadLocations(){
      try{
        const [stationsRes, locationsRes] = await Promise.all([
          fetch("/rail/stations.json"),
          fetch("https://raw.githubusercontent.com/bhanuc/indian-list/master/state-city.json")
        ]);
        const stations = stationsRes.ok ? await stationsRes.json() : [];
        const locations = locationsRes.ok ? await locationsRes.json() : {};
        if(cancelled)return;
        const stationMap={};
        (stations||[]).forEach(s=>{
          if(s?.code) stationMap[s.code]={city:s.state || s.name || ""};
        });
        setStationLocations(stationMap);
        setStateCities(locations && typeof locations==="object" ? locations : {});
      }catch{
        if(!cancelled){
          setStationLocations({});
          setStateCities({});
        }
      }
    }
    loadLocations();
    return ()=>{cancelled=true};
  },[]);

  const cityStateMap=useMemo(()=>{
    const map={};
    Object.entries(stateCities).forEach(([st,cities])=>{
      (cities||[]).forEach(city=>{
        const clean=String(city).replace(/\\*$/,"").trim().toLowerCase();
        if(clean && !map[clean]) map[clean]=st;
      });
    });
    return map;
  },[stateCities]);

  const enrichLocation=(code, fallbackCity="")=>{
    const city=stationLocations[code]?.city || fallbackCity || "";
    const state=cityStateMap[String(city).trim().toLowerCase()] || "";
    return {city,state};
  };

  const enrichedListings=useMemo(()=>listings.map(x=>{
    if(x.kind!=="TRAIN") return {
      ...x,
      locationStates:[x.state].filter(Boolean),
      locationCities:[x.city].filter(Boolean)
    };
    const from=enrichLocation(x.from_code,x.from_name);
    const to=enrichLocation(x.to_code,x.to_name);
    return {
      ...x,
      locationStates:[from.state,to.state].filter(Boolean),
      locationCities:[from.city,to.city].filter(Boolean)
    };
  }),[listings,stationLocations,cityStateMap]);

  const fallbackStates=["Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh"];
  const states=[...new Set([
    ...fallbackStates,
    ...Object.keys(stateCities),
    ...enrichedListings.flatMap(x=>x.locationStates||[])
  ])].sort();

  const cities=[...new Set(
    state
      ? [
          ...(stateCities[state]||[]),
          ...enrichedListings.filter(x=>(x.locationStates||[]).includes(state)).flatMap(x=>x.locationCities||[])
        ]
      : [
          ...enrichedListings.flatMap(x=>x.locationCities||[]),
          ...Object.values(stateCities).flat()
        ]
  )].map(x=>String(x).replace(/\\*$/,"").trim()).filter(Boolean).sort();

  const filtered=useMemo(()=>{
    let data=enrichedListings.filter(x=>{
      if(category!=="ALL"&&x.kind!==category)return false;
      const hay=[x.title,x.place,x.artist_name,x.train_number,x.city,x.state,x.venue,x.cinema_hall].filter(Boolean).join(" ").toLowerCase();
      if(search.trim()&&!hay.includes(search.trim().toLowerCase()))return false;
      if(state&&!(x.locationStates||[]).includes(state))return false;
      if(city&&!(x.locationCities||[]).map(v=>String(v).replace(/\\*$/,"").trim()).includes(city))return false;
      if(date&&x.eventAt?.slice(0,10)!==date)return false;
      if(maxPrice&&Number(x.price||0)>Number(maxPrice))return false;
      return true;
    });
    return data.sort((a,b)=>sort==="PRICE" ? Number(a.price||0)-Number(b.price||0) : new Date(a.eventAt)-new Date(b.eventAt));
  },[enrichedListings,category,search,state,city,date,maxPrice,sort]);



  useEffect(()=>{if(selected && !filtered.some(x=>x.id===selected.id))setSelected(null)},[filtered,selected]);

  const choose=x=>setSelected(x);
  const favoriteKey=item=>item.kind+":"+item.id;
  const isFavorite=item=>favorites.includes(favoriteKey(item));
  function reportListing(item){
    if(!user?.id){alert("Please sign in to report a listing.");return;}
    if(!item?.id || item.seller_id===user.id){alert("This listing cannot be reported from this account.");return;}
    setReportTarget(item);
    setReportReason("SUSPICIOUS_OR_SCAM");
    setReportDetails("");
  }
  async function submitListingReport(){
    if(!user?.id || !reportTarget || reportSubmitting) return;
    if(reportReason==="OTHER"&&!reportDetails.trim()){alert("Please explain the reason when selecting Other.");return;}
    const {error}=await supabase.from("listing_reports").insert({
      listing_id:reportTarget.id,
      listing_kind:reportTarget.kind,
      reporter_id:user.id,
      reason:reportReason,
      details:reportDetails.trim()||null
    });
    if(error){alert(error.message||"Could not submit report.");return;}
    setReportTarget(null);
    setReportDetails("");
    alert("Report submitted. Thank you for helping keep ConnectHub safe.");
  }
  async function toggleFavorite(item){
    if(!user?.id || favoriteBusy) return;
    const key=favoriteKey(item);
    setFavoriteBusy(key);
    try{
      if(isFavorite(item)){
        const {error}=await supabase.from("listing_favorites").delete().eq("user_id",user.id).eq("listing_kind",item.kind).eq("listing_id",item.id);
        if(error) throw error;
        setFavorites(current=>current.filter(value=>value!==key));
      }else{
        const {error}=await supabase.from("listing_favorites").insert({user_id:user.id,listing_kind:item.kind,listing_id:item.id});
        if(error) throw error;
        setFavorites(current=>[...current,key]);
      }
    }catch(err){
      alert(err?.message || "Could not update favorites.");
    }finally{
      setFavoriteBusy("");
    }
  }
  return (
    <main className="marketplace-shell">
      <header className="marketplace-topbar">
        <button className="marketplace-brand" onClick={onBack}><span><Music2 size={18}/></span>Connect<span>Hub</span></button>
        <div className="marketplace-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search concerts, artists, venues, cities..."/></div>
        <button className="marketplace-icon-btn marketplace-favorite-top" onClick={()=>onNavigate?.("Favorites")} aria-label="Favorites"><Heart size={20} fill={favorites.length ? "currentColor" : "none"}/>{favorites.length>0&&<i>{favorites.length>99?"99+":favorites.length}</i>}</button><button className="marketplace-icon-btn"><Bell size={19}/></button><span className="marketplace-avatar"><UserRound size={18}/></span>
      </header>

      <div className="marketplace-body">
        <UniversalSidebar activeNav="Find Tickets" onNavigate={onNavigate || (label => label === "Home" && onBack?.())} onLogout={onLogout} />

        <section className="marketplace-content">
          <div className="marketplace-tabs">
            {[["ALL","All Tickets"],["TRAIN","Train Tickets"],["MOVIE","Movie Tickets"],["CONCERT","Concert Tickets"]].map(([value,label])=>
              <button key={value} className={category===value?"marketplace-tab active":"marketplace-tab"} onClick={()=>setCategory(value)}>
                {value==="TRAIN"?<Ticket size={17}/>:value==="MOVIE"?<Ticket size={17}/>:value==="CONCERT"?<Music2 size={17}/>:<SlidersHorizontal size={17}/>}
                {label}
              </button>
            )}
          </div>

          <div className="marketplace-filters">
            <select value={state} onChange={e=>setState(e.target.value)}><option value="">State</option>{states.map(x=><option key={x}>{x}</option>)}</select>
            <select value={city} onChange={e=>setCity(e.target.value)}><option value="">City</option>{cities.map(x=><option key={x}>{x}</option>)}</select>
            <label className="marketplace-date"><CalendarDays size={15}/><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
            <input value={maxPrice} onChange={e=>setMaxPrice(e.target.value.replace(/\D/g,""))} placeholder="Max price"/>
            <select value={sort} onChange={e=>setSort(e.target.value)}><option value="DATE">Date (Soonest)</option><option value="PRICE">Price (Lowest)</option></select>
            <button className="clear-filters" onClick={()=>{setState("");setCity("");setDate("");setMaxPrice("");setSearch("");}}>Clear</button>
          </div>

          <div className="marketplace-heading"><div><span>FIND TICKETS</span><h1>Tickets from real sellers</h1></div><small>{filtered.length} listing{filtered.length===1?"":"s"}</small></div>

          {loading ? <div className="marketplace-empty">Loading listings...</div> : error ? <div className="marketplace-empty error">{error}</div> : !filtered.length ? <div className="marketplace-empty"><Ticket size={30}/><b>No tickets found</b><span>Try changing your filters or search.</span></div> : (
            <div className="marketplace-list">
              {filtered.map(item=>(
                <article key={item.kind+"-"+item.id} className={selected?.id===item.id&&selected?.kind===item.kind?"marketplace-card selected":"marketplace-card"} onClick={()=>choose(item)}>
                  <div className="marketplace-card-image">
                    {item.kind==="MOVIE"&&item.poster_url ? <img src={item.poster_url} alt=""/> : <div className={"marketplace-type-art "+item.kind.toLowerCase()}>{item.kind==="CONCERT"?<Music2 size={32}/>:item.kind==="TRAIN"?<TrainArtwork className="marketplace-train-icon"/>:<Ticket size={32}/>}</div>}
                  </div>
                  <div className="marketplace-card-main">
                    <span className="marketplace-kind">{item.kind}</span>
                    <h3>{item.title}</h3>
                    {item.kind==="CONCERT"&&item.artist_name&&<p className="marketplace-subtitle">{item.artist_name}</p>}
                    <p><MapPin size={14}/>{item.place}</p>
                    <p><CalendarDays size={14}/>{dateText(item.eventAt)} · {new Date(item.eventAt).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}</p>
                  </div>
                  <div className="marketplace-card-price"><strong>{money(item.price)}</strong><small>per ticket</small><span>{item.ticket_count} ticket{item.ticket_count===1?"":"s"} available</span><button>View Details <ChevronDown size={14}/></button></div>
                  <button className={isFavorite(item) ? "marketplace-heart active" : "marketplace-heart"} onClick={e=>{e.stopPropagation();toggleFavorite(item)}} aria-label={isFavorite(item)?"Remove from favorites":"Add to favorites"} disabled={favoriteBusy===favoriteKey(item)}><Heart size={19} fill={isFavorite(item) ? "currentColor" : "none"}/></button>
                </article>
              ))}
            </div>
          )}
        </section>

        {selected && <aside className="marketplace-detail">
          <button className="detail-close" onClick={()=>setSelected(null)}><X size={18}/></button><button className={isFavorite(selected) ? "detail-favorite active" : "detail-favorite"} onClick={()=>toggleFavorite(selected)} aria-label={isFavorite(selected)?"Remove from favorites":"Add to favorites"} disabled={favoriteBusy===favoriteKey(selected)}><Heart size={18} fill={isFavorite(selected) ? "currentColor" : "none"}/></button>
          <div className="detail-hero">{selected.kind==="MOVIE"&&selected.poster_url?<img src={selected.poster_url} alt=""/>:<div className={"detail-art "+selected.kind.toLowerCase()}>{selected.kind==="CONCERT"?<Music2 size={52}/>:selected.kind==="TRAIN"?<TrainArtwork className="detail-train-icon"/>:<Ticket size={52}/>}</div>}</div>
          <div className="detail-body">
            <span className="marketplace-kind">{selected.kind}</span>
            <h2>{selected.title}</h2>
            {selected.kind==="CONCERT"&&<p className="detail-artist">{selected.artist_name||"Artist / Performer"}</p>}
            <p><MapPin size={15}/>{selected.place}</p>
            <p><CalendarDays size={15}/>{dateText(selected.eventAt)} · {new Date(selected.eventAt).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}</p>
            <div className="detail-expiry"><Clock3 size={15}/> Listing expires at event/show start.</div>
            <h4>Tickets Available <span>{selected.ticket_count}</span></h4>
            <div className="detail-info">
              <div><span>Price per ticket</span><b>{money(selected.price)}</b></div>
              {selected.kind==="TRAIN"&&<><div><span>Train</span><b>{selected.train_number} · {selected.train_name}</b></div><div><span>Journey</span><b>{selected.from_name} → {selected.to_name}</b></div></>}
              {selected.kind==="MOVIE"&&<><div><span>Cinema</span><b>{selected.cinema_hall}</b></div><div><span>Language / Format</span><b>{selected.language||"—"} / {selected.format||"—"}</b></div></>}
              {selected.kind==="CONCERT"&&<><div><span>Ticket Type</span><b>{selected.ticket_type}</b></div><div><span>Access Type</span><b>{selected.seat_type}</b></div></>}
              {selected.ready_to_bargain&&<div><span>Offer</span><b className="offer-ok">Bargain available</b></div>}
            </div>
            {selected.description&&<><h4>About this listing</h4><p className="detail-description">{selected.description}</p></>}
            <div className="detail-actions"><button><MessageCircle size={17}/> Message Seller</button><button className="offer-button" disabled={!selected.ready_to_bargain}><Tag size={17}/> Make Offer</button></div>
            <button className="detail-report-button" onClick={()=>reportListing(selected)}><Flag size={15}/> Report listing</button>
          </div>
        </aside>}
      </div>
      {reportTarget && <div className="community-modal-backdrop marketplace-report-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!reportSubmitting)setReportTarget(null);}}>
        <section className="community-leave-modal community-report-modal marketplace-report-modal" role="dialog" aria-modal="true" aria-labelledby="listing-report-title">
          <button type="button" className="community-modal-close" aria-label="Close report dialog" disabled={reportSubmitting} onClick={()=>setReportTarget(null)}><X size={17}/></button>
          <div className="community-modal-icon community-report-modal-icon"><Flag size={23}/></div>
          <span className="community-report-eyebrow">MARKETPLACE SAFETY</span>
          <h2 id="listing-report-title">Report this listing</h2>
          <p>Help us understand the problem with “{reportTarget.title}”. Your report will be sent to the moderation team.</p>
          <div className="community-report-reasons" role="radiogroup" aria-label="Listing report reason">
            {[
              ["SUSPICIOUS_OR_SCAM","Suspicious or scam","Potential fraud or misleading offer"],
              ["INCORRECT_INFORMATION","Incorrect information","Details do not match the listing"],
              ["PROHIBITED_OR_INVALID_TICKET","Invalid ticket","Ticket may be invalid or not allowed"],
              ["DUPLICATE_LISTING","Duplicate listing","The same ticket is listed more than once"],
              ["INAPPROPRIATE_CONTENT","Inappropriate content","Content that should not be listed"],
              ["OTHER","Other","Another concern not listed above"]
            ].map(([value,label,description])=><button type="button" key={value} role="radio" aria-checked={reportReason===value} className={"community-report-reason"+(reportReason===value?" selected":"")} onClick={()=>setReportReason(value)}>
              <span className="community-report-radio">{reportReason===value&&<span/>}</span><span className="community-report-reason-copy"><b>{label}</b><small>{description}</small></span>
            </button>)}
          </div>
          <label className="community-report-details-label" htmlFor="listing-report-details">{reportReason==="OTHER"?"Please explain your concern":"Additional details (optional)"}</label>
          <textarea id="listing-report-details" value={reportDetails} onChange={e=>setReportDetails(e.target.value.slice(0,1000))} maxLength={1000} rows={3} placeholder={reportReason==="OTHER"?"Explain why this listing should be reviewed…":"Add context for the moderation team…"}/>
          <div className="community-report-details-meta"><span>{reportReason==="OTHER"&&!reportDetails.trim()?"An explanation is required for Other":"Only include details relevant to this report."}</span><span>{reportDetails.length}/1000</span></div>
          <div className="community-modal-actions community-report-modal-actions">
            <button type="button" disabled={reportSubmitting} onClick={()=>setReportTarget(null)}>Cancel</button>
            <button type="button" className="primary" disabled={reportSubmitting||(reportReason==="OTHER"&&!reportDetails.trim())} onClick={async()=>{setReportSubmitting(true);await submitListingReport();setReportSubmitting(false);}}>{reportSubmitting?"Submitting…":<><Flag size={15}/> Submit report</>}</button>
          </div>
        </section>
      </div>}
    </main>
  );
}
