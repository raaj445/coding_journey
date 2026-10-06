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
    <main className="listing-app-shell">
      <header className="listing-topbar">
        <button className="listing-brand" onClick={onBack}><span className="listing-brand-mark"><Users size={18} /></span>Connect<span>Hub</span></button>
        <div className="listing-top-search"><Search size={16}/><input placeholder="Search for roommates, tickets, or anything..." /></div>
        <button className="listing-browse">Browse</button>
        <button className="listing-post-top" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>Post Listing</button>
        <button className="listing-bell" aria-label="Notifications"><Bell size={19}/></button>
        <span className="listing-user-avatar">A</span>
      </header>

      <div className="listing-layout">
        <aside className="listing-left-nav">
          <button className="listing-nav-item muted" onClick={onBack}><Home size={18}/><span>Roommate / Flatmate<small>Coming Soon</small></span></button>
          <button type="button" className="listing-nav-item" onClick={onTrain}><Ticket size={18}/><span>Train Ticket</span></button>
          <button type="button" className="listing-nav-item" onClick={onMovie}><Ticket size={18}/><span>Movie Ticket</span></button>
          <button type="button" className="listing-nav-item active"><Music2 size={18}/><span>Concert Ticket</span></button>
        </aside>

        <section className="listing-main-column">
          <div className="listing-page-title">
            <h1>Create Concert Ticket Listing</h1>
            <p>List your concert tickets and find genuine buyers.</p>
          </div>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>1</span><div><h2>Event Details</h2><p>Enter your concert information</p></div></div>
            <div className="journey-grid">
              <label className="modern-field"><span>Event / Concert Name <i>*</i></span><input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Diljit Dosanjh - India Tour"/></label>
              <label className="modern-field"><span>Artist / Performer</span><input value={artistName} onChange={e=>setArtistName(e.target.value)} placeholder="e.g. Diljit Dosanjh"/></label>
              <label className="modern-field"><span>State <i>*</i></span><select value={stateName} onChange={e=>{setStateName(e.target.value);setCity("");}}><option value="">Select state</option>{states.map(state=><option key={state} value={state}>{state}</option>)}</select></label>
              <label className="modern-field"><span>City <i>*</i></span><select value={city} onChange={e=>setCity(e.target.value)} disabled={!stateName}><option value="">Select city</option>{cities.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
              <label className="modern-field"><span>Venue <i>*</i></span><input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="e.g. Eco Park"/></label>
            </div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>2</span><div><h2>Event Schedule</h2><p>Set the concert date and time. The listing expires automatically when the event starts.</p></div></div>
            <div className="journey-grid">
              <label className="modern-field"><span>Event Date <i>*</i></span><div className="modern-input"><input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}/><CalendarDays size={16}/></div></label>
              <label className="modern-field"><span>Event Time <i>*</i></span><div className="modern-input"><input type="time" value={eventTime} onChange={e=>setEventTime(e.target.value)}/><Clock3 size={16}/></div></label>
            </div>
            <div className="expiry-strip"><span className="expiry-icon">◷</span><div><b>Listing will automatically expire at concert start time</b><small>{eventDate && eventTime ? `Event starts: ${eventDate} • ${eventTime}` : "Select the event date and time to calculate expiry automatically."}</small></div></div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head ticket-head"><span>3</span><div><h2>Ticket Details</h2><p>Add the tickets you want to sell.</p></div><div className="ticket-counter"><b>Number of Tickets</b><div><button type="button" onClick={()=>changeTicketCount(ticketCount-1)}>−</button><strong>{ticketCount}</strong><button type="button" onClick={()=>changeTicketCount(ticketCount+1)}>+</button></div></div></div>
            <div className="modern-ticket-list">
              {Array.from({length:ticketCount},(_,index)=>(
                <div className="modern-ticket-row" key={index}>
                  <div className="modern-ticket-number"><span>▦</span><b>Ticket {index+1}</b></div>
                  <label className="modern-field"><span>Ticket Type <i>*</i></span><select value={ticketType} onChange={e=>setTicketType(e.target.value)}>{TICKET_TYPES.map(value=><option key={value}>{value}</option>)}</select></label>
                  <label className="modern-field"><span>Seat / Access Type <i>*</i></span><select value={seatType} onChange={e=>setSeatType(e.target.value)}>{SEAT_TYPES.map(value=><option key={value}>{value}</option>)}</select></label>
                  <div className="modern-field"><span>Ticket Status</span><div className="ticket-status-display">Available</div></div>
                  <button type="button" className="ticket-delete" aria-label={"Remove ticket "+(index+1)} onClick={()=>changeTicketCount(ticketCount-1)} disabled={ticketCount===1}>×</button>
                </div>
              ))}
            </div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>4</span><div><h2>Price Details</h2><p>Choose one price for all tickets or set different prices individually.</p></div></div>
            <div className="price-choice-grid">
              <label className={samePrice ? "modern-price-choice selected" : "modern-price-choice"}><input type="radio" checked={samePrice} onChange={()=>setSamePrice(true)}/><span><b>Same price for all tickets</b><small>All tickets will be listed at the same price</small></span></label>
              <label className={!samePrice ? "modern-price-choice selected" : "modern-price-choice"}><input type="radio" checked={!samePrice} onChange={()=>setSamePrice(false)}/><span><b>Different price for each ticket</b><small>Set individual prices for each ticket</small></span></label>
            </div>
            {samePrice ? (
              <div className="modern-price-row"><label className="modern-field concert-price-field"><span>Price per ticket <i>*</i></span><div className="price-input"><b>₹</b><input type="number" min="1" value={price} onChange={e=>setPrice(e.target.value.replace(/[^0-9]/g,""))} placeholder="0"/></div></label><div className="bargain-control"><div><b>Ready to Bargain</b><small>Buyers can send you offers</small></div><button type="button" className={bargain?"on":""} onClick={()=>setBargain(!bargain)}><span/></button></div></div>
            ) : (
              <div className="individual-price-list">{individualPrices.map((value,index)=><label className="modern-field" key={index}><span>Ticket {index+1} price <i>*</i></span><div className="price-input"><b>₹</b><input type="number" min="1" value={value} onChange={e=>setIndividualPrices(current=>current.map((item,i)=>i===index?e.target.value.replace(/[^0-9]/g,""):item))}/></div></label>)}</div>
            )}
          </section>

          <section className="listing-modern-card additional-card">
            <div className="modern-section-head"><span>5</span><div><h2>Additional Information <em>(Optional)</em></h2><p>Add a short note buyers should know.</p></div><small className="char-count">{description.length}/500</small></div>
            <label className="modern-field"><span>Description / Note</span><textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={500} placeholder="Mention entry rules, transfer details, or anything buyers should know..."/></label>
            <div className="modern-actions"><button onClick={onBack}>Cancel</button><button className="modern-primary" onClick={postConcertListing} disabled={posting}>{posting ? "Posting..." : "Post Listing"} <ArrowRight size={15}/></button></div>
          </section>
        </section>

        <aside className="listing-right-column">
          <div className="preview-title"><span className="preview-brand-icon">C</span><div><b>Listing Preview</b><small>This is how your listing will appear to others</small></div></div>
          <div className="modern-preview-card">
            <div className="preview-image-wrap concert-preview-image-wrap"><div className="concert-preview-art"><Music2 size={42}/></div><span className="active-listing">● Active Listing</span></div>
            <div className="preview-route-row"><div><h3>{eventName || "Your concert name"}</h3><p>♬ &nbsp;{artistName || "Artist / Performer"}</p><p>⌖ &nbsp;{venue || "Venue"}{city ? ` • ${city}` : ""}</p><p>◷ &nbsp;{eventDate || "Event date"}{eventTime ? ` • ${eventTime}` : ""}</p></div><strong>₹ {samePrice && price ? Number(price).toLocaleString("en-IN") : "—"}<small>per ticket</small></strong></div>
            <div className="preview-pills"><span>{ticketCount} Ticket{ticketCount===1?"":"s"}</span>{bargain&&<span className="bargain-pill">Bargain Available</span>}</div>
            <div className="preview-separator"/>
            <h4 className="preview-block-title">♢ &nbsp; Ticket Details</h4>
            <div className="preview-modern-tickets">{Array.from({length:ticketCount},(_,index)=><div className="preview-modern-ticket" key={index}><span className="preview-number">{index+1}</span><div><b>{ticketType}</b><section><small>{seatType}</small><small className="preview-confirmed">Available</small></section></div><strong>₹ {Number(samePrice ? price || 0 : individualPrices[index] || 0).toLocaleString("en-IN")}</strong></div>)}</div>
            <div className="preview-footer-note"><Clock3 size={14}/> Expires automatically at event start.</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
