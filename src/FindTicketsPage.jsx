import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, CalendarDays, ChevronDown, Clock3, Heart, Home, MapPin, MessageCircle, Music2, Search, SlidersHorizontal, Ticket, UserRound, Users, X, Tag } from "lucide-react";
import { supabase } from "./lib/supabase";

const money = value => value == null ? "—" : "₹" + Number(value).toLocaleString("en-IN");
const dateText = value => value ? new Date(value + (value.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";

export default function FindTicketsPage({ onBack }) {
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

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      setLoading(true); setError("");
      const [tr,mv,co]=await Promise.all([
        supabase.from("listings").select("id,seller_id,train_number,train_name,from_name,to_name,journey_date,departure_at,status,ticket_count,price_mode,price_per_ticket,ready_to_bargain,description,created_at").eq("status","ACTIVE").gt("departure_at",new Date().toISOString()).order("departure_at",{ascending:true}).limit(60),
        supabase.from("movie_listings").select("id,seller_id,movie_name,poster_url,state,city,cinema_hall,show_date,show_time,show_at,language,format,status,ticket_count,price_mode,price_per_ticket,ready_to_bargain,description,created_at").eq("status","ACTIVE").gt("show_at",new Date().toISOString()).order("show_at",{ascending:true}).limit(60),
        supabase.from("concert_listings").select("id,seller_id,event_name,artist_name,state,city,venue,event_date,event_time,event_at,status,ticket_count,ticket_type,seat_type,price_mode,price_per_ticket,ready_to_bargain,description,created_at").eq("status","ACTIVE").gt("event_at",new Date().toISOString()).order("event_at",{ascending:true}).limit(60)
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
  },[]);

  const states=[...new Set(listings.map(x=>x.state).filter(Boolean))].sort();
  const cities=[...new Set(listings.map(x=>x.city).filter(Boolean))].sort();

  const filtered=useMemo(()=>{
    let data=listings.filter(x=>{
      if(category!=="ALL"&&x.kind!==category)return false;
      const hay=[x.title,x.place,x.artist_name,x.train_number,x.city,x.state,x.venue,x.cinema_hall].filter(Boolean).join(" ").toLowerCase();
      if(search.trim()&&!hay.includes(search.trim().toLowerCase()))return false;
      if(state&&x.state!==state)return false;
      if(city&&x.city!==city)return false;
      if(date&&x.eventAt?.slice(0,10)!==date)return false;
      if(maxPrice&&Number(x.price||0)>Number(maxPrice))return false;
      return true;
    });
    return data.sort((a,b)=>sort==="PRICE" ? Number(a.price||0)-Number(b.price||0) : new Date(a.eventAt)-new Date(b.eventAt));
  },[listings,category,search,state,city,date,maxPrice,sort]);

  useEffect(()=>{if(selected && !filtered.some(x=>x.id===selected.id))setSelected(null)},[filtered,selected]);

  const choose=x=>setSelected(x);
  return (
    <main className="marketplace-shell">
      <header className="marketplace-topbar">
        <button className="marketplace-brand" onClick={onBack}><span><Music2 size={18}/></span>Connect<span>Hub</span></button>
        <div className="marketplace-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search concerts, artists, venues, cities..."/></div>
        <button className="marketplace-icon-btn"><Bell size={19}/></button><span className="marketplace-avatar"><UserRound size={18}/></span>
      </header>

      <div className="marketplace-body">
        <aside className="marketplace-sidebar">
          <button className="marketplace-side-item" onClick={onBack}><Home size={18}/> Home</button>
          <button className="marketplace-side-item active"><Ticket size={18}/> Find Tickets</button>
          <button className="marketplace-side-item" onClick={onBack}><span className="plus-mini">+</span> Create Listing</button>
          <button className="marketplace-side-item"><Users size={18}/> Find People</button>
          <button className="marketplace-side-item"><Heart size={18}/> Communities</button>
          <button className="marketplace-side-item"><MessageCircle size={18}/> Messages</button>
          <button className="marketplace-side-item"><Ticket size={18}/> My Listings</button>
          <button className="marketplace-side-item"><Heart size={18}/> Bookmarks</button>
        </aside>

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
                    {item.kind==="MOVIE"&&item.poster_url ? <img src={item.poster_url} alt=""/> : <div className={"marketplace-type-art "+item.kind.toLowerCase()}>{item.kind==="CONCERT"?<Music2 size={32}/>:<Ticket size={32}/>}</div>}
                  </div>
                  <div className="marketplace-card-main">
                    <span className="marketplace-kind">{item.kind}</span>
                    <h3>{item.title}</h3>
                    {item.kind==="CONCERT"&&item.artist_name&&<p className="marketplace-subtitle">{item.artist_name}</p>}
                    <p><MapPin size={14}/>{item.place}</p>
                    <p><CalendarDays size={14}/>{dateText(item.eventAt)} · {new Date(item.eventAt).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})}</p>
                  </div>
                  <div className="marketplace-card-price"><strong>{money(item.price)}</strong><small>per ticket</small><span>{item.ticket_count} ticket{item.ticket_count===1?"":"s"} available</span><button>View Details <ChevronDown size={14}/></button></div>
                  <button className="marketplace-heart" onClick={e=>e.stopPropagation()}><Heart size={19}/></button>
                </article>
              ))}
            </div>
          )}
        </section>

        {selected && <aside className="marketplace-detail">
          <button className="detail-close" onClick={()=>setSelected(null)}><X size={18}/></button>
          <div className="detail-hero">{selected.kind==="MOVIE"&&selected.poster_url?<img src={selected.poster_url} alt=""/>:<div className={"detail-art "+selected.kind.toLowerCase()}>{selected.kind==="CONCERT"?<Music2 size={52}/>:<Ticket size={52}/>}</div>}</div>
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
          </div>
        </aside>}
      </div>
    </main>
  );
}
