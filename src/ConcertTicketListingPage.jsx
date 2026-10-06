import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, CalendarDays, Clock3, Home, MapPin, Music2, Search, Ticket, Users } from "lucide-react";
import { supabase } from "./lib/supabase";

const TICKET_TYPES = ["General Admission", "Standing", "Seated", "VIP", "Premium", "Early Bird", "Other"];
const SEAT_TYPES = ["General", "Standing", "Floor", "Lower", "Upper", "Balcony", "Box", "Other"];

export default function ConcertTicketListingPage({ onBack, onTrain, onMovie, states = [], citiesByState = {} }) {
  const [eventName, setEventName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [ticketType, setTicketType] = useState("General Admission");
  const [seatType, setSeatType] = useState("General");
  const [ticketCount, setTicketCount] = useState(1);
  const [samePrice, setSamePrice] = useState(true);
  const [price, setPrice] = useState("");
  const [individualPrices, setIndividualPrices] = useState([""]);
  const [bargain, setBargain] = useState(false);
  const [description, setDescription] = useState("");
  const [posting, setPosting] = useState(false);

  const cities = useMemo(() => citiesByState[stateName] || [], [citiesByState, stateName]);

  function changeTicketCount(value) {
    const count = Math.max(1, Math.min(10, Number(value) || 1));
    setTicketCount(count);
    setIndividualPrices(prev => Array.from({ length: count }, (_, i) => prev[i] || ""));
  }

  async function postConcertListing() {
    if (!eventName.trim() || !stateName || !city || !venue.trim() || !eventDate || !eventTime || !ticketCount) {
      alert("Please complete all required event details.");
      return;
    }
    if (samePrice && Number(price) <= 0) {
      alert("Please enter a valid price per ticket.");
      return;
    }
    if (!samePrice && individualPrices.some(value => Number(value) <= 0)) {
      alert("Please enter a valid price for every ticket.");
      return;
    }

    setPosting(true);
    try {
      const tickets = Array.from({ length: ticketCount }, (_, index) => ({
        price: Number(samePrice ? price : individualPrices[index])
      }));
      const { data, error } = await supabase.functions.invoke("create-concert-listing", {
        body: {
          eventName: eventName.trim(),
          artistName: artistName.trim(),
          state: stateName,
          city,
          venue: venue.trim(),
          eventDate,
          eventTime,
          ticketType,
          seatType,
          priceMode: samePrice ? "SAME" : "INDIVIDUAL",
          pricePerTicket: samePrice ? Number(price) : null,
          readyToBargain: bargain,
          description,
          tickets
        }
      });
      if (error) {
        let payload = null;
        try { if (error.context?.json) payload = await error.context.json(); } catch {}
        throw new Error(payload?.message || error.message || "Concert listing could not be created.");
      }
      if (!data?.ok) throw new Error(data?.message || "Concert listing could not be created.");
      alert("Concert listing posted successfully!");
      onBack();
    } catch (error) {
      alert(error?.message || "Concert listing could not be posted. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="listing-shell">
      <header className="listing-topbar">
        <div className="listing-brand"><span className="listing-logo"><Music2 size={19} /></span><span>Connect<span>Hub</span></span></div>
        <div className="listing-top-search"><Search size={17} /><input placeholder="Search tickets, people, events..." /></div>
        <div className="listing-top-actions"><button><Bell size={18}/></button><span className="listing-avatar"><Users size={18}/></span></div>
      </header>

      <div className="listing-layout">
        <aside className="listing-sidebar">
          <button className="listing-back" onClick={onBack}><ArrowLeft size={16}/> Back to Dashboard</button>
          <div className="listing-sidebar-title">Ticket Listing</div>
          <button className="listing-nav-item" onClick={onTrain}><Ticket size={18}/><span>Train</span></button>
          <button className="listing-nav-item" onClick={onMovie}><Ticket size={18}/><span>Movie</span></button>
          <button className="listing-nav-item active"><Music2 size={18}/><span>Concert</span></button>
        </aside>

        <section className="listing-main">
          <div className="listing-page-heading">
            <div><span className="eyebrow">CREATE LISTING</span><h1>Concert Ticket</h1><p>List your concert tickets for genuine buyers.</p></div>
          </div>

          <section className="listing-card">
            <div className="listing-card-heading"><span>1</span><div><h2>Event Details</h2><p>Tell buyers about the concert.</p></div></div>
            <div className="modern-form-grid">
              <label className="modern-field"><span>Event / Concert Name <i>*</i></span><input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Diljit Dosanjh - India Tour"/></label>
              <label className="modern-field"><span>Artist / Performer</span><input value={artistName} onChange={e=>setArtistName(e.target.value)} placeholder="e.g. Diljit Dosanjh"/></label>
            </div>
            <div className="modern-form-grid three">
              <label className="modern-field"><span>State <i>*</i></span><select value={stateName} onChange={e=>{setStateName(e.target.value);setCity("");}}><option value="">Select state</option>{states.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
              <label className="modern-field"><span>City <i>*</i></span><select value={city} onChange={e=>setCity(e.target.value)} disabled={!stateName}><option value="">Select city</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
              <label className="modern-field"><span>Venue <i>*</i></span><input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="e.g. Eco Park"/></label>
            </div>
          </section>

          <section className="listing-card">
            <div className="listing-card-heading"><span>2</span><div><h2>Event Schedule</h2><p>Listing expires automatically when the concert starts.</p></div></div>
            <div className="modern-form-grid two">
              <label className="modern-field"><span>Event Date <i>*</i></span><div className="modern-input"><input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}/><CalendarDays size={16}/></div></label>
              <label className="modern-field"><span>Event Time <i>*</i></span><div className="modern-input"><input type="time" value={eventTime} onChange={e=>setEventTime(e.target.value)}/><Clock3 size={16}/></div></label>
            </div>
            <div className="listing-expiry-strip"><Clock3 size={16}/><div><b>Auto Expiry</b><span>This listing will automatically expire at the concert start time.</span></div></div>
          </section>

          <section className="listing-card">
            <div className="listing-card-heading"><span>3</span><div><h2>Ticket Details</h2><p>Add the tickets you want to sell.</p></div></div>
            <div className="modern-form-grid three">
              <label className="modern-field"><span>Ticket Type <i>*</i></span><select value={ticketType} onChange={e=>setTicketType(e.target.value)}>{TICKET_TYPES.map(v=><option key={v}>{v}</option>)}</select></label>
              <label className="modern-field"><span>Seat / Access Type <i>*</i></span><select value={seatType} onChange={e=>setSeatType(e.target.value)}>{SEAT_TYPES.map(v=><option key={v}>{v}</option>)}</select></label>
              <label className="modern-field"><span>Number of Tickets <i>*</i></span><select value={ticketCount} onChange={e=>changeTicketCount(e.target.value)}>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
            </div>
          </section>

          <section className="listing-card">
            <div className="listing-card-heading"><span>4</span><div><h2>Pricing & Preferences</h2><p>Set your pricing and additional preferences.</p></div></div>
            <div className="price-mode-row">
              <button className={samePrice ? "price-mode active" : "price-mode"} onClick={()=>setSamePrice(true)}><span className="radio-dot">{samePrice ? "●" : ""}</span><div><b>Same price for all tickets</b><small>All tickets will be listed at the same price</small></div></button>
              <button className={!samePrice ? "price-mode active" : "price-mode"} onClick={()=>setSamePrice(false)}><span className="radio-dot">{!samePrice ? "●" : ""}</span><div><b>Different price for each ticket</b><small>Set individual prices for each ticket</small></div></button>
              {samePrice ? <label className="modern-field concert-price-field"><span>Price per ticket <i>*</i></span><div className="modern-input"><b>₹</b><input type="number" min="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0"/></div></label> : null}
            </div>
            {!samePrice && <div className="concert-individual-prices">{individualPrices.map((value,index)=><label className="modern-field" key={index}><span>Ticket {index+1} price <i>*</i></span><div className="modern-input"><b>₹</b><input type="number" min="1" value={value} onChange={e=>setIndividualPrices(prev=>prev.map((p,i)=>i===index?e.target.value:p))}/></div></label>)}</div>}
            <div className="concert-bargain-row"><div><b>Ready to Bargain?</b><small>Buyers can send you offers</small></div><button className={bargain ? "modern-toggle on" : "modern-toggle"} onClick={()=>setBargain(!bargain)}><span/></button></div>
          </section>

          <section className="listing-card">
            <div className="listing-card-heading"><span>5</span><div><h2>Additional Info</h2><p>Add any useful information for buyers.</p></div></div>
            <label className="modern-field"><span>Description</span><textarea maxLength={500} rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Mention entry rules, transfer details, or anything buyers should know..."/></label>
          </section>

          <div className="listing-bottom-actions"><button className="secondary-action" onClick={onBack}>Cancel</button><button className="modern-primary" onClick={postConcertListing} disabled={posting}>{posting ? "Posting..." : <>Post Listing <ArrowRight size={15}/></>}</button></div>
        </section>

        <aside className="listing-preview">
          <div className="preview-sticky"><div className="preview-label">LIVE PREVIEW</div><article className="concert-preview-card"><div className="concert-preview-icon"><Music2 size={30}/></div><div className="concert-preview-body"><span>CONCERT</span><h3>{eventName || "Your concert name"}</h3><p>{artistName || "Artist / Performer"}</p><p><MapPin size={13}/> {venue || "Venue"}{city ? ", "+city : ""}</p><p><CalendarDays size={13}/> {eventDate || "Event date"} {eventTime ? "· "+eventTime : ""}</p><div className="concert-preview-footer"><b>{samePrice && price ? "₹"+Number(price).toLocaleString("en-IN") : "Price varies"}</b><small>{ticketCount} ticket{ticketCount===1?"":"s"}</small></div></div></article><div className="preview-note"><Clock3 size={14}/><span>Expires automatically at event start.</span></div></div>
        </aside>
      </div>
    </main>
  );
}
