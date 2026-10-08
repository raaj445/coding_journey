import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Users, Ticket, MapPin, MessageCircle, Mail, LockKeyhole, ShieldCheck, Music2, Trophy, PartyPopper, Heart, ChevronDown, Sparkles, Search, Bell, Bookmark, UserRound, Settings, Home, Plus, HeartHandshake, Menu, LogOut, ArrowUpRight, CalendarDays } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import MovieTicketListingPage from "./MovieTicketListingPage";
import ConcertTicketListingPage from "./ConcertTicketListingPage";
import TrainArtwork from "./TrainArtwork";
import FindTicketsPage from "./FindTicketsPage";
import UniversalSidebar from "./UniversalSidebar";

const eventCards = [
  { title: "Concerts", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=85", icon: Music2 },
  { title: "Cricket", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=700&q=85", icon: Trophy },
  { title: "Events", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=85", icon: PartyPopper },
  { title: "Meet People", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85", icon: Users },
];

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const citiesByState = {
  "Andhra Pradesh": ["Amaravati", "Anantapur", "Chittoor", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Nellore", "Rajahmundry", "Tirupati", "Vijayawada", "Visakhapatnam"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Dibrugarh", "Guwahati", "Jorhat", "Nagaon", "Silchar", "Tezpur"],
  "Bihar": ["Bhagalpur", "Bihar Sharif", "Darbhanga", "Gaya", "Muzaffarpur", "Patna", "Purnia"],
  "Chhattisgarh": ["Ambikapur", "Bhilai", "Bilaspur", "Durg", "Korba", "Raipur", "Rajnandgaon"],
  "Goa": ["Bicholim", "Mapusa", "Margao", "Panaji", "Ponda", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Anand", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Rajkot", "Surat", "Vadodara"],
  "Haryana": ["Ambala", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panipat", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Bilaspur", "Dharamshala", "Hamirpur", "Kullu", "Mandi", "Shimla", "Solan"],
  "Jharkhand": ["Bokaro", "Deoghar", "Dhanbad", "Hazaribagh", "Jamshedpur", "Ranchi"],
  "Karnataka": ["Ballari", "Belagavi", "Bengaluru", "Davanagere", "Hubballi", "Kalaburagi", "Mangaluru", "Mysuru", "Shivamogga", "Tumakuru", "Udupi"],
  "Kerala": ["Alappuzha", "Kannur", "Kochi", "Kollam", "Kozhikode", "Palakkad", "Thiruvananthapuram", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Dewas", "Gwalior", "Indore", "Jabalpur", "Ratlam", "Rewa", "Sagar", "Satna", "Ujjain"],
  "Maharashtra": ["Amravati", "Chhatrapati Sambhajinagar", "Kolhapur", "Mumbai", "Nagpur", "Nashik", "Navi Mumbai", "Pune", "Solapur", "Thane"],
  "Manipur": ["Bishnupur", "Churachandpur", "Imphal", "Thoubal"],
  "Meghalaya": ["Baghmara", "Jowai", "Nongpoh", "Shillong", "Tura"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lunglei", "Serchhip"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Balasore", "Berhampur", "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur"],
  "Punjab": ["Amritsar", "Bathinda", "Jalandhar", "Ludhiana", "Mohali", "Pathankot", "Patiala"],
  "Rajasthan": ["Ajmer", "Alwar", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Udaipur"],
  "Sikkim": ["Gangtok", "Geyzing", "Mangan", "Namchi", "Pakyong"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Erode", "Hosur", "Madurai", "Salem", "Thanjavur", "Tiruchirappalli", "Tirunelveli", "Vellore"],
  "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Nizamabad", "Ramagundam", "Warangal"],
  "Tripura": ["Agartala", "Ambassa", "Belonia", "Dharmanagar", "Kailashahar", "Udaipur"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ayodhya", "Bareilly", "Ghaziabad", "Gorakhpur", "Jhansi", "Kanpur", "Lucknow", "Mathura", "Meerut", "Noida", "Prayagraj", "Varanasi"],
  "Uttarakhand": ["Dehradun", "Haldwani", "Haridwar", "Kashipur", "Rishikesh", "Roorkee"],
  "West Bengal": ["Asansol", "Bardhaman", "Durgapur", "Howrah", "Kharagpur", "Kolkata", "Malda", "Siliguri"],
  "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Rangat"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Baramulla", "Jammu", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Andrott", "Minicoy"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};


function StationPicker({ label, value, onChange, stations, required = true, clearOnFocus = false }) {
  const [open, setOpen] = useState(false);
  const query = value.trim().toLowerCase();
  const suggestions = query
    ? stations.filter(s => `${s.name} ${s.code} ${s.state || ""}`.toLowerCase().includes(query)).slice(0, 8)
    : stations.slice(0, 8);

  return (
    <label className="modern-field station-picker-field">
      <span>{label} {required && <i>*</i>}</span>
      <div className="station-picker">
        <div className="modern-input">
          <input
            value={value}
            onFocus={() => { if (clearOnFocus) onChange(""); setOpen(true); }}
            onChange={e => { onChange(e.target.value); setOpen(true); }}
            placeholder="Search station name or code"
            autoComplete="off"
          />
          <MapPin size={16}/>
        </div>
        {open && (
          <div className="station-suggestions">
            {suggestions.length ? suggestions.map(station => (
              <button type="button" key={station.code + station.name} onMouseDown={() => {
                onChange(`${station.name} (${station.code})`);
                setOpen(false);
              }}>
                <b>{station.name}</b>
                <span>{station.code}{station.state ? ` • ${station.state}` : ""}</span>
              </button>
            )) : <div className="station-empty">No station found</div>}
          </div>
        )}
      </div>
    </label>
  );
}

function CreateListingPage({ onBack, onMovie, onConcert, onNavigate, onLogout, activeSub = "TRAIN" }) {
  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState("New Delhi (NDLS)");
  const [toStation, setToStation] = useState("Howrah (HWH)");
  const [ticketCount, setTicketCount] = useState(3);
  const [trains, setTrains] = useState([]);
  const [trainQuery, setTrainQuery] = useState("");
  const [trainOpen, setTrainOpen] = useState(false);
  const [journeyDate, setJourneyDate] = useState("2026-10-20");
  const [railValidation, setRailValidation] = useState(null);
  const [railChecking, setRailChecking] = useState(false);
  useEffect(() => {
    fetch("/rail/train-index.json")
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Train index unavailable")))
      .then(data => setTrains(Array.isArray(data?.trains) ? data.trains : []))
      .catch(() => setTrains([]));
  }, []);
  useEffect(() => {
    fetch("/rail/stations.json")
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Station data unavailable")))
      .then(data => setStations(Array.isArray(data) ? data : []))
      .catch(() => setStations([]));
  }, []);
  const [tickets, setTickets] = useState([
    { ticketType: "Sleeper (SL)", gender: "Male", status: "Confirmed", details: "Lower" },
    { ticketType: "Sleeper (SL)", gender: "Male", status: "Confirmed", details: "Upper" },
    { ticketType: "AC 3 Tier (3A)", gender: "Female", status: "RAC", details: "18" },
  ]);
  const [samePrice, setSamePrice] = useState(true);
  const [price, setPrice] = useState("1500");
  const [individualPrices, setIndividualPrices] = useState(["1500","1500","1500"]);
  const [bargain, setBargain] = useState(true);
  const [description, setDescription] = useState("Selling genuine train tickets. Please verify all journey details before contacting the seller.");
  const [posting, setPosting] = useState(false);

  function changeTicketCount(next) {
    const count = Math.max(1, Math.min(10, next));
    setTicketCount(count);
    setTickets(current => Array.from({ length: count }, (_, index) =>
      current[index] || { ticketType: "Sleeper (SL)", gender: "Male", status: "Confirmed", details: "" }
    ));
    setIndividualPrices(current => Array.from({ length: count }, (_, index) => current[index] || price));
  }

  function updateTicket(index, field, value) {
    setTickets(current => current.map((ticket, i) => i === index ? { ...ticket, [field]: value } : ticket));
  }

  const confirmed = tickets.filter(ticket => ticket.status === "Confirmed").length;
  const rac = tickets.filter(ticket => ticket.status === "RAC").length;
  const selectedFromCode = (fromStation.match(/\(([A-Z0-9]+)\)$/) || [,""])[1];
  const selectedToCode = (toStation.match(/\(([A-Z0-9]+)\)$/) || [,""])[1];
  const trainSuggestions = trainQuery.trim()
    ? trains.filter(train => `${train.number} ${train.name}`.toLowerCase().includes(trainQuery.trim().toLowerCase())).slice(0, 8)
    : trains.slice(0, 8);

  async function verifyRailJourney() {
    const trainNumber = trainQuery.trim().match(/^\d{1,5}/)?.[0]?.padStart(5, "0") || "";
    if (!trainNumber || !selectedFromCode || !selectedToCode || !journeyDate) {
      setRailValidation({ valid: false, message: "Select From, To, Journey Date and a valid Train Number." });
      return;
    }
    setRailChecking(true);
    setRailValidation(null);
    try {
      const { data, error } = await supabase.functions.invoke("validate-rail-journey", {
        body: { trainNumber, fromCode: selectedFromCode, fromName: fromStation, toCode: selectedToCode, toName: toStation, journeyDate }
      });
      if (error) {
        let functionPayload = null;
        try {
          if (error.context?.json) functionPayload = await error.context.json();
        } catch {}
        if (functionPayload?.message) {
          setRailValidation(functionPayload);
          return;
        }
        throw error;
      }
      setRailValidation(data || { valid: false, message: "Railway verification failed." });
    } catch {
      setRailValidation({ valid: false, message: "Railway verification is temporarily unavailable. Please try again." });
    } finally {
      setRailChecking(false);
    }
  }

  async function postListing() {
    if (!railValidation?.valid || !selectedTrainNumber || !selectedFromCode || !selectedToCode) return;
    setPosting(true);
    try {
      const payloadTickets = tickets.map((ticket, index) => ({
        ticketType: ticket.ticketType,
        gender: ticket.gender,
        status: ticket.status,
        berthType: ticket.status === "Confirmed" ? ticket.details : null,
        racNumber: ticket.status === "RAC" ? Number(ticket.details) : null,
        price: Number(individualPrices[index] || 0)
      }));
      const { data, error } = await supabase.functions.invoke("create-train-listing", {
        body: {
          trainNumber: selectedTrainNumber,
          fromCode: selectedFromCode,
          toCode: selectedToCode,
          journeyDate,
          priceMode: samePrice ? "SAME" : "INDIVIDUAL",
          pricePerTicket: Number(price || 0),
          readyToBargain: bargain,
          description,
          tickets: payloadTickets
        }
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || "Listing failed");
      alert("Listing posted successfully!");
      onBack();
    } catch (error) {
      alert(error?.message || "Listing could not be posted. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  const selectedTrainNumber = trainQuery.trim().match(/^\d{1,5}/)?.[0]?.padStart(5, "0") || "";
  const selectedTrain = trains.find(train => train.number === selectedTrainNumber);
  const displayDeparture = railValidation?.valid ? railValidation.departureTime : "Select train";
  const displayTrainName = railValidation?.valid ? railValidation.train.name : (selectedTrain?.name || "Verify train");

  const ticketTypeOptions = ["General / Unreserved","Sleeper (SL)","AC 3 Tier (3A)","AC 3 Economy (3E)","AC 2 Tier (2A)","First AC (1A)","AC Chair Car (CC)","Executive Chair Car (EC)","Second Sitting (2S)","Vistadome","Other"];

  function berthOptions(type) {
    if (["Sleeper (SL)","AC 3 Tier (3A)","AC 3 Economy (3E)","AC 2 Tier (2A)"].includes(type)) return ["Lower","Middle","Upper","Side Lower","Side Upper"];
    if (type === "First AC (1A)") return ["Lower","Upper"];
    if (["AC Chair Car (CC)","Executive Chair Car (EC)"].includes(type)) return ["Window","Aisle"];
    if (["General / Unreserved","Second Sitting (2S)"].includes(type)) return ["Window","Middle","Aisle","Other"];
    return ["Lower","Middle","Upper","Side Lower","Side Upper","Window","Aisle","Other"];
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
        <UniversalSidebar activeNav="Create Listing" activeSub={activeSub} onNavigate={onNavigate || (label => label === "Home" && onBack?.())} onLogout={onLogout} />

        <section className="listing-main-column">
          <div className="listing-page-title">
            <h1>Create Train Ticket Listing</h1>
            <p>List your confirmed or RAC train tickets and find genuine buyers.</p>
          </div>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>1</span><div><h2>Journey Details</h2><p>Enter your train journey information</p></div></div>
            <div className="journey-grid">
              <StationPicker label="From Station" value={fromStation} onChange={setFromStation} stations={stations} clearOnFocus />
              <StationPicker label="To Station" value={toStation} onChange={setToStation} stations={stations} clearOnFocus />
              <label className="modern-field"><span>Journey Date <i>*</i></span><div className="modern-input"><input type="date" value={journeyDate} onChange={e => { setJourneyDate(e.target.value); setRailValidation(null); }} /><Ticket size={16}/></div></label>
              <label className="modern-field train-search-field train-picker-field"><span>Train Number <i>*</i></span><div className="modern-input"><Search size={16}/><input value={trainQuery} onFocus={() => { setTrainQuery(""); setTrainOpen(true); setRailValidation(null); }} onChange={e => { setTrainQuery(e.target.value); setTrainOpen(true); setRailValidation(null); }} placeholder="Search train number or name" autoComplete="off" /></div>
                {trainOpen && <div className="train-suggestions">{trainSuggestions.length ? trainSuggestions.map(train => <button type="button" key={train.number} onMouseDown={() => { setTrainQuery(`${train.number} - ${train.name}`); setTrainOpen(false); setRailValidation(null); }}><b>{train.number}</b><span>{train.name}</span></button>) : <div className="station-empty">Train data is syncing. Try the 5-digit train number.</div>}</div>}
              </label>
              <div className="rail-verify-row"><button type="button" className="rail-verify-button" onClick={verifyRailJourney} disabled={railChecking}>{railChecking ? "Verifying..." : "Verify Train & Route"}</button>{railValidation && <span className={railValidation.valid ? "rail-valid" : "rail-invalid"}>{railValidation.valid ? `✓ Verified • ${displayTrainName} • ${fromStation.split(" (")[0]} departs ${displayDeparture}${railValidation.arrivalTime ? ` • Arrival ${railValidation.arrivalTime}` : ""}` : `✕ ${railValidation.message}`}</span>}</div>
            </div>
            <div className="expiry-strip"><span className="expiry-icon">◷</span><div><b>Listing will automatically expire at train departure time</b><small>{railValidation?.valid ? `Departure from ${fromStation.split(" (")[0]}: ${railValidation.departureTime} • ${railValidation.durationMinutes ? `Duration: ~${Math.floor(railValidation.durationMinutes/60)}h ${railValidation.durationMinutes%60}m` : "Duration unavailable"}` : "Verify the train and route to calculate departure automatically."}</small></div></div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head ticket-head"><span>2</span><div><h2>Ticket Details</h2><p>Only Confirmed and RAC tickets can be listed.</p></div><div className="ticket-counter"><b>Number of Tickets</b><div><button onClick={() => changeTicketCount(ticketCount-1)}>−</button><strong>{ticketCount}</strong><button onClick={() => changeTicketCount(ticketCount+1)}>+</button></div></div></div>
            <div className="modern-ticket-list">
              {tickets.map((ticket,index) => (
                <div className="modern-ticket-row" key={index}>
                  <div className="modern-ticket-number"><span>▦</span><b>Ticket {index+1}</b></div>
                  <label className="modern-field"><span>Ticket Type <i>*</i></span><select value={ticket.ticketType} onChange={e => updateTicket(index,"ticketType",e.target.value)}>{ticketTypeOptions.map(o=><option key={o}>{o}</option>)}</select></label>
                  <label className="modern-field"><span>Gender <i>*</i></span><select value={ticket.gender} onChange={e => updateTicket(index,"gender",e.target.value)}><option>Male</option><option>Female</option></select></label>
                  <label className="modern-field"><span>Status <i>*</i></span><select value={ticket.status} onChange={e => updateTicket(index,"status",e.target.value)}><option>Confirmed</option><option>RAC</option></select></label>
                  {ticket.status==="RAC" ? (
                    <label className="modern-field"><span>RAC Number <i>*</i></span><input value={ticket.details} onChange={e=>updateTicket(index,"details",e.target.value)} placeholder="e.g. 18" /></label>
                  ) : (
                    <label className="modern-field"><span>Seat / Berth Type <i>*</i></span><select value={ticket.details} onChange={e=>updateTicket(index,"details",e.target.value)}><option value="">Select type</option>{berthOptions(ticket.ticketType).map(o=><option key={o}>{o}</option>)}</select></label>
                  )}
                  <button className="ticket-delete" aria-label={"Remove ticket "+(index+1)} onClick={() => changeTicketCount(ticketCount-1)}>×</button>
                </div>
              ))}
            </div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>3</span><div><h2>Price Details</h2><p>Choose one price for all tickets or set different prices individually.</p></div></div>
            <div className="price-choice-grid">
              <label className={samePrice ? "modern-price-choice selected" : "modern-price-choice"}><input type="radio" checked={samePrice} onChange={()=>setSamePrice(true)}/><span><b>Same price for all tickets</b><small>All tickets will be listed at the same price</small></span></label>
              <label className={!samePrice ? "modern-price-choice selected" : "modern-price-choice"}><input type="radio" checked={!samePrice} onChange={()=>setSamePrice(false)}/><span><b>Different price for each ticket</b><small>Set individual prices for each ticket</small></span></label>
            </div>
            <div className="modern-price-row"><label className="modern-field"><span>Price per ticket <i>*</i></span><div className="price-input"><b>₹</b><input value={price} onChange={e=>setPrice(e.target.value.replace(/[^0-9]/g,""))}/></div></label><div className="bargain-control"><div><b>Ready to Bargain</b><small>Buyers can send you offers</small></div><button className={bargain?"on":""} onClick={()=>setBargain(!bargain)}><span/></button></div></div>
            {!samePrice && <div className="individual-price-list">{tickets.map((ticket,index)=><label className="modern-field" key={index}><span>Ticket {index+1} price <i>*</i></span><div className="price-input"><b>₹</b><input value={individualPrices[index] || ""} onChange={e => setIndividualPrices(current => current.map((value,i) => i===index ? e.target.value.replace(/[^0-9]/g,"") : value))}/></div></label>)}</div>}
          </section>

          <section className="listing-modern-card additional-card">
            <div className="modern-section-head"><span>4</span><div><h2>Additional Information <em>(Optional)</em></h2><p>Add a short note buyers should know.</p></div><small className="char-count">0/500</small></div>
            <label className="modern-field"><span>Description / Note</span><textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500}/></label>
            <div className="modern-actions"><button onClick={onBack}>Cancel</button><button className="modern-primary" onClick={postListing} disabled={posting || !railValidation?.valid || !selectedTrainNumber || !selectedFromCode || !selectedToCode}>{posting ? "Posting..." : "Post Listing"} <ArrowRight size={15}/></button></div>
          </section>
        </section>

        <aside className="listing-right-column">
          <div className="preview-title"><span className="preview-brand-icon">C</span><div><b>Listing Preview</b><small>This is how your listing will appear to others</small></div></div>
          <div className="modern-preview-card">
            <div className="preview-image-wrap"><TrainArtwork className="preview-train-artwork" /><span className="active-listing">● Active Listing</span><button>Edit</button></div>
            <div className="preview-route-row"><div><h3>{fromStation} → {toStation}</h3><p>◷ &nbsp;{journeyDate || "Journey date"} &nbsp;•&nbsp; Departure {displayDeparture}{railValidation?.valid && railValidation.arrivalTime ? ` • Arrival ${railValidation.arrivalTime}` : ""}</p><p>▣ &nbsp;{selectedTrainNumber || "Train"} • {displayTrainName}</p></div><strong>₹ {Number(price||0).toLocaleString("en-IN")}<small>per ticket</small></strong></div>
            <div className="preview-pills"><span>{ticketCount} Tickets</span>{bargain&&<span className="bargain-pill">Bargain Available</span>}</div>
            <div className="preview-separator"/>
            <h4 className="preview-block-title">♢ &nbsp; Tickets</h4>
            <div className="preview-modern-tickets">{tickets.map((ticket,index)=><div className="preview-modern-ticket" key={index}><span className="preview-number">{index+1}</span><div><b>{ticket.ticketType}</b><section><small>{ticket.gender}</small><small className={ticket.status==="RAC"?"preview-rac":"preview-confirmed"}>{ticket.status}</small><small>{ticket.status==="RAC" ? `RAC ${ticket.details || ""}` : ticket.details||"Seat type"}</small></section></div></div>)}</div>
            <div className="preview-separator"/>
            <div className="about-listing"><h4>▣ &nbsp; About this listing</h4><p>Selling {ticketCount} tickets for {fromStation} to {toStation}. {confirmed} confirmed{rac ? ` and ${rac} RAC` : ""}. Genuine buyers only.</p></div>
            <div className="preview-expiry"><b>◷ &nbsp; This listing will expire automatically</b><small>At the train's scheduled departure time<br/>{journeyDate}, {fromStation.split(" (")[0]} departs at {displayDeparture}</small></div>
            <button className="preview-post-button" onClick={postListing} disabled={posting || !railValidation?.valid}>{posting ? "Posting..." : "Post Listing"}</button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function MyListingsPage({ user, onBack, onNavigate, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editBargain, setEditBargain] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadListings() {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const [tr, mv, co] = await Promise.all([
      supabase.from("listings").select("id,train_number,train_name,from_name,to_name,journey_date,departure_at,status,ticket_count,price_per_ticket,ready_to_bargain,description,created_at,expired_at").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("movie_listings").select("id,movie_name,poster_url,city,cinema_hall,show_date,show_time,show_at,status,ticket_count,price_per_ticket,ready_to_bargain,description,created_at,expired_at,language,format").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("concert_listings").select("id,event_name,artist_name,city,venue,event_date,event_time,event_at,status,ticket_count,price_per_ticket,ready_to_bargain,description,created_at,expired_at").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(50)
    ]);
    const errors = [tr.error, mv.error, co.error].filter(Boolean);
    if (errors.length === 3) {
      setError(errors[0].message);
      setItems([]);
      setLoading(false);
      return;
    }
    const normalized = [
      ...(tr.data || []).map(x => ({ ...x, kind: "TRAIN", title: x.train_name || "Train Ticket", place: x.from_name + " → " + x.to_name, eventAt: x.departure_at })),
      ...(mv.data || []).map(x => ({ ...x, kind: "MOVIE", title: x.movie_name || "Movie Ticket", place: x.cinema_hall + " · " + x.city, eventAt: x.show_at })),
      ...(co.data || []).map(x => ({ ...x, kind: "CONCERT", title: x.event_name || "Concert Ticket", place: x.venue + " · " + x.city, eventAt: x.event_at }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setItems(normalized);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    loadListings().catch(err => {
      if (mounted) {
        setError(err?.message || "Could not load your listings.");
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [user?.id]);

  function openEdit(item) {
    if (item.status !== "ACTIVE") return;
    setEditing(item);
    setEditPrice(String(item.price_per_ticket ?? ""));
    setEditBargain(Boolean(item.ready_to_bargain));
    setEditDescription(item.description || "");
  }

  async function saveEdit() {
    if (!editing || editing.status !== "ACTIVE") return;
    const priceValue = Number(editPrice);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      alert("Please enter a valid price.");
      return;
    }
    setSaving(true);
    try {
      const table = editing.kind === "TRAIN" ? "listings" : editing.kind === "MOVIE" ? "movie_listings" : "concert_listings";
      const { error: updateError } = await supabase
        .from(table)
        .update({
          price_per_ticket: priceValue,
          ready_to_bargain: editBargain,
          description: editDescription.trim() || null
        })
        .eq("id", editing.id)
        .eq("seller_id", user.id)
        .eq("status", "ACTIVE");
      if (updateError) throw updateError;
      setItems(current => current.map(item => item.id === editing.id && item.kind === editing.kind
        ? { ...item, price_per_ticket: priceValue, ready_to_bargain: editBargain, description: editDescription.trim() || null }
        : item
      ));
      setEditing(null);
    } catch (err) {
      alert(err?.message || "Listing could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function expireListing(item) {
    if (item.status !== "ACTIVE") return;
    const confirmed = window.confirm(
      "Expire this listing now?\n\nOnce a listing is expired, it CANNOT be made active again. You will have to create a new listing to sell these tickets.\n\nDo you want to continue?"
    );
    if (!confirmed) return;
    const table = item.kind === "TRAIN" ? "listings" : item.kind === "MOVIE" ? "movie_listings" : "concert_listings";
    try {
      const { error: updateError } = await supabase
        .from(table)
        .update({ status: "EXPIRED", expired_at: new Date().toISOString() })
        .eq("id", item.id)
        .eq("seller_id", user.id)
        .eq("status", "ACTIVE");
      if (updateError) throw updateError;
      setItems(current => current.map(row => row.id === item.id && row.kind === item.kind
        ? { ...row, status: "EXPIRED", expired_at: new Date().toISOString() }
        : row
      ));
      if (editing?.id === item.id && editing?.kind === item.kind) setEditing(null);
    } catch (err) {
      alert(err?.message || "Listing could not be expired.");
    }
  }

  return (
    <main className="my-listings-shell">
      <UniversalSidebar activeNav="My Listings" onNavigate={onNavigate || (label => label === "Home" && onBack?.())} onLogout={onLogout} />
      <section className="my-listings-page-content">
        <header className="my-listings-header">
          <div>
            <button className="my-listings-back" onClick={onBack}>← Back to Dashboard</button>
            <span className="my-listings-kicker">CONNECTHUB</span>
            <h1>My Listings</h1>
            <p>Only listings posted by you are shown here.</p>
          </div>
          <div className="my-listings-count">{items.length} listing{items.length === 1 ? "" : "s"}</div>
        </header>

        {loading ? <div className="my-listings-empty">Loading your listings...</div> :
         error ? <div className="my-listings-empty error">{error}</div> :
         !items.length ? <div className="my-listings-empty"><Ticket size={34}/><b>You haven't posted any listings yet.</b><span>Create a listing and it will appear here.</span></div> :
         <div className="my-listings-list">
           {items.map(item => (
             <article
               className={"my-listing-full-card " + (item.status === "ACTIVE" ? "is-editable" : "is-expired")}
               key={item.kind + "-" + item.id}
               onClick={() => openEdit(item)}
             >
               <div className="my-listing-full-image">
                 {item.kind === "TRAIN" ? <TrainArtwork className="my-listing-train-artwork" /> :
                  item.kind === "MOVIE" && item.poster_url ? <img src={item.poster_url} alt="" /> :
                  item.kind === "MOVIE" ? <Ticket size={34}/> : <Music2 size={34}/>}
               </div>
               <div className="my-listing-full-main">
                 <span className={"my-listing-kind " + item.kind.toLowerCase()}>{item.kind}</span>
                 <h2>{item.title}</h2>
                 <p><MapPin size={15}/>{item.place}</p>
                 <p><Ticket size={15}/>{item.eventAt ? new Date(item.eventAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"} · {item.ticket_count} ticket{item.ticket_count === 1 ? "" : "s"}</p>
                 {item.kind === "TRAIN" && <small>{item.train_number} · {item.from_name} → {item.to_name}</small>}
                 {item.kind === "MOVIE" && <small>{item.language || ""}{item.language && item.format ? " · " : ""}{item.format || ""}</small>}
                 {item.kind === "CONCERT" && <small>{item.artist_name || "Artist / Performer"}</small>}
               </div>
               <div className="my-listing-full-side">
                 <strong>₹{Number(item.price_per_ticket || 0).toLocaleString("en-IN")}</strong>
                 <span>per ticket</span>
                 <em className={item.status === "ACTIVE" ? "listing-active" : "listing-status"}>{item.status}</em>
                 {item.ready_to_bargain && <b>Bargain available</b>}
                 {item.status === "ACTIVE" ? (
                   <div className="my-listing-actions">
                     <button type="button" className="my-listing-edit" onClick={event => { event.stopPropagation(); openEdit(item); }}>Edit</button>
                     <button type="button" className="my-listing-expire" onClick={event => { event.stopPropagation(); expireListing(item); }}>Expire</button>
                   </div>
                 ) : (
                   <small className="my-listing-locked">Expired — create a new listing to sell again</small>
                 )}
               </div>
             </article>
           ))}
         </div>}

        {editing && (
          <div className="listing-edit-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setEditing(null); }}>
            <section className="listing-edit-modal" onMouseDown={event => event.stopPropagation()}>
              <div className="listing-edit-head">
                <div>
                  <span>EDIT LISTING</span>
                  <h2>{editing.title}</h2>
                  <p>{editing.place}</p>
                </div>
                <button type="button" onClick={() => !saving && setEditing(null)} aria-label="Close">×</button>
              </div>
              <div className="listing-edit-note">Journey/show/event details stay fixed here. You can update the selling price, bargaining option and buyer note without changing the verified schedule.</div>
              <label className="listing-edit-field"><span>Price per ticket</span><div><b>₹</b><input value={editPrice} onChange={e => setEditPrice(e.target.value.replace(/[^0-9.]/g,""))} inputMode="decimal" /></div></label>
              <label className="listing-edit-toggle"><span><b>Ready to Bargain</b><small>Allow buyers to send offers</small></span><button type="button" className={editBargain ? "on" : ""} onClick={() => setEditBargain(value => !value)}><span/></button></label>
              <label className="listing-edit-field"><span>Description / Note</span><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} maxLength={500} /></label>
              <div className="listing-edit-actions"><button type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</button><button type="button" className="modern-primary" onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function FavoritesPage({ user, onBack, onNavigate, onLogout }) {
  const [favorites,setFavorites]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    let mounted=true;
    async function load(){
      if(!user?.id){setFavorites([]);setLoading(false);return;}
      setLoading(true);setError("");
      const {data:favoriteRows,error:favoriteError}=await supabase
        .from("listing_favorites")
        .select("id,listing_kind,listing_id,created_at")
        .eq("user_id",user.id)
        .order("created_at",{ascending:false});
      if(favoriteError){if(mounted){setError(favoriteError.message);setLoading(false);}return;}
      const rows=favoriteRows||[];
      const byKind={TRAIN:[],MOVIE:[],CONCERT:[]};
      rows.forEach(row=>{if(byKind[row.listing_kind])byKind[row.listing_kind].push(row.listing_id);});
      const [tr,mv,co]=await Promise.all([
        byKind.TRAIN.length ? supabase.from("listings").select("id,train_number,train_name,from_name,to_name,journey_date,departure_at,status,ticket_count,price_per_ticket,ready_to_bargain,description").in("id",byKind.TRAIN) : Promise.resolve({data:[],error:null}),
        byKind.MOVIE.length ? supabase.from("movie_listings").select("id,movie_name,poster_url,state,city,cinema_hall,show_date,show_time,show_at,status,ticket_count,price_per_ticket,ready_to_bargain,description").in("id",byKind.MOVIE) : Promise.resolve({data:[],error:null}),
        byKind.CONCERT.length ? supabase.from("concert_listings").select("id,event_name,artist_name,state,city,venue,event_date,event_time,event_at,status,ticket_count,price_per_ticket,ready_to_bargain,description").in("id",byKind.CONCERT) : Promise.resolve({data:[],error:null})
      ]);
      if(!mounted)return;
      const fetched=new Map();
      (tr.data||[]).forEach(x=>fetched.set("TRAIN:"+x.id,{...x,kind:"TRAIN",title:x.train_name||"Train Ticket",place:(x.from_name||"—")+" → "+(x.to_name||"—"),eventAt:x.departure_at}));
      (mv.data||[]).forEach(x=>fetched.set("MOVIE:"+x.id,{...x,kind:"MOVIE",title:x.movie_name||"Movie Ticket",place:(x.cinema_hall||"—")+" · "+(x.city||"—"),eventAt:x.show_at}));
      (co.data||[]).forEach(x=>fetched.set("CONCERT:"+x.id,{...x,kind:"CONCERT",title:x.event_name||"Concert Ticket",place:(x.venue||"—")+" · "+(x.city||"—"),eventAt:x.event_at}));
      setFavorites(rows.map(row=>({
        ...row,
        listing:fetched.get(row.listing_kind+":"+row.listing_id)||null
      })));
      setLoading(false);
    }
    load();
    return ()=>{mounted=false};
  },[user?.id]);

  async function removeFavorite(row){
    const {error:removeError}=await supabase.from("listing_favorites").delete().eq("user_id",user.id).eq("listing_kind",row.listing_kind).eq("listing_id",row.listing_id);
    if(removeError){alert(removeError.message||"Could not remove favorite.");return;}
    setFavorites(current=>current.filter(item=>item.id!==row.id));
  }

  const money=value=>value==null?"—":"₹"+Number(value).toLocaleString("en-IN");
  const dateText=value=>value ? new Date(value+(value.length===10?"T00:00:00":"")).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";

  return (
    <main className="favorites-shell">
      <header className="marketplace-topbar">
        <button className="marketplace-brand" onClick={onBack}><span><Heart size={18} fill="currentColor"/></span>Connect<span>Hub</span></button>
        <div className="marketplace-search"><Search size={18}/><input placeholder="Search your favorites..." readOnly /></div>
        <button className="marketplace-icon-btn active"><Heart size={20} fill="currentColor"/></button>
        <button className="marketplace-icon-btn"><Bell size={19}/></button>
        <span className="marketplace-avatar"><UserRound size={18}/></span>
      </header>
      <div className="favorites-body">
        <UniversalSidebar activeNav="Favorites" onNavigate={onNavigate} onLogout={onLogout}/>
        <section className="favorites-content">
          <button className="favorites-back" onClick={onBack}>← Back to Dashboard</button>
          <div className="favorites-heading">
            <div><span>CONNECTHUB</span><h1>Favorites</h1><p>Save tickets you may want to check later.</p></div>
            <strong>{favorites.length} saved</strong>
          </div>
          {loading ? <div className="favorites-empty">Loading your favorites...</div> :
           error ? <div className="favorites-empty error">{error}</div> :
           !favorites.length ? <div className="favorites-empty"><Heart size={34}/><b>No favorites yet</b><span>Tap the heart on any ticket in Find Tickets to save it here.</span><button onClick={()=>onNavigate?.("Find Tickets")}>Find Tickets</button></div> :
           <div className="favorites-list">
             {favorites.map(row=>{
               const item=row.listing;
               return (
                 <article className={item ? "favorite-card" : "favorite-card unavailable"} key={row.id}>
                   <div className="favorite-card-art">
                     {item?.kind==="TRAIN" ? <TrainArtwork className="favorite-train-artwork"/> :
                      item?.kind==="MOVIE"&&item.poster_url ? <img src={item.poster_url} alt=""/> :
                      item?.kind==="CONCERT" ? <Music2 size={32}/> : <Ticket size={32}/>}
                   </div>
                   <div className="favorite-card-main">
                     <span>{item?.kind || row.listing_kind}</span>
                     <h2>{item?.title || "Listing no longer available"}</h2>
                     {item ? <>
                       <p><MapPin size={14}/>{item.place}</p>
                       <p><CalendarDays size={14}/>{dateText(item.eventAt)}</p>
                     </> : <p>This listing is no longer visible in the marketplace. It may have expired or been removed.</p>}
                   </div>
                   <div className="favorite-card-side">
                     {item ? <><strong>{money(item.price_per_ticket)}</strong><small>per ticket</small><em className={item.status==="ACTIVE"?"available":"not-available"}>{item.status}</em></> : <em className="not-available">UNAVAILABLE</em>}
                     <button className="favorite-remove" onClick={()=>removeFavorite(row)}><Heart size={15} fill="currentColor"/> Remove</button>
                   </div>
                 </article>
               );
             })}
           </div>}
        </section>
      </div>
    </main>
  );
}



function CommunitiesPage({ user, onBack, onNavigate, onLogout }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([{id:1,name:"Rahul Sharma",role:"Student",time:"2h ago",text:"Anyone travelling from KGP to Kolkata this weekend? Looking for a confirmed train ticket for Saturday.",likes:12,comments:8},{id:2,name:"Priya Singh",role:"Student",time:"5h ago",text:"KGP autumn fest lineup is out! Who’s excited? 🎉 Let’s plan a group if anyone is going.",likes:28,comments:15},{id:3,name:"Aman Verma",role:"Alumni",time:"8h ago",text:"Any good and affordable PG/hostel options near IIT Kharagpur for a friend?",likes:17,comments:6}]);
  const [likedPosts,setLikedPosts]=useState({}); const [bookmarkedPosts,setBookmarkedPosts]=useState({}); const [commentOpen,setCommentOpen]=useState({}); const [postText,setPostText]=useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [joined, setJoined] = useState({ "IIT Kharagpur": true });
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name:"", type:"", description:"", state:"", city:"", privacy:"Public", rules:"" });
  const [coverPreview, setCoverPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");
  const [myCommunityIds, setMyCommunityIds] = useState([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState([]);

  const categories = ["All","Students","Travel","Housing","Career","Events","Cities","Other"];
  const [communityCards, setCommunityCards] = useState([
    { name:"IIT Kharagpur", category:"Students", members:"2,450", privacy:"Public", desc:"Discussions about academics, campus life, events, travel, and more.", image:"https://images.unsplash.com/photo-1592999620762-9e9f7f4f8f16?auto=format&fit=crop&w=900&q=85", icon:"🎓" },
    { name:"Indian Railways Travel", category:"Travel", members:"3,820", privacy:"Public", desc:"Train travel experiences, ticket sharing, travel tips, and more.", image:"https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85", icon:"🚆" },
    { name:"Music & Concerts", category:"Events", members:"1,650", privacy:"Public", desc:"Discuss upcoming concerts, ticket resale, and event plans.", image:"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85", icon:"🎟️" },
    { name:"Roommates & Housing", category:"Housing", members:"4,120", privacy:"Public", desc:"Find roommates, PGs, flats and housing near your city.", image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85", icon:"🏠" },
    { name:"Jobs & Career", category:"Career", members:"2,980", privacy:"Public", desc:"Job opportunities, interview tips, career guidance, and more.", image:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85", icon:"💼" },
    { name:"Delhi NCR", category:"Cities", members:"5,430", privacy:"Public", desc:"General discussions about city life, networking, and events.", image:"https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=85", icon:"📍" },
    { name:"GATE Aspirants", category:"Students", members:"1,950", privacy:"Public", desc:"Preparation tips, resources, doubt discussions, and more.", image:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85", icon:"🎓" },
    { name:"Sports & Events", category:"Events", members:"1,780", privacy:"Public", desc:"Cricket, football, matches, event tickets, and discussions.", image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=85", icon:"🎟️" },
    { name:"Tech & Development", category:"Other", members:"2,340", privacy:"Public", desc:"Programming, projects, jobs, and technology discussions.", image:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85", icon:"</>" },
  ]);

  const currentName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "You";
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from("communities").select("*").order("created_at",{ascending:false});
      if (!alive || !data?.length) return;
      setCommunityCards(data.map(row => ({ id:row.id, ownerId:row.owner_id, name:row.name, category:row.category, members:"0", privacy:row.privacy, desc:row.description, image:row.cover_url || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85", icon:row.icon_url ? "" : "👥", state:row.state, city:row.city })));
      if (user?.id) {
        const { data: memberships } = await supabase.from("community_members").select("community_id,role").eq("user_id",user.id);
        setMyCommunityIds((memberships||[]).filter(m=>m.role==="OWNER").map(m=>m.community_id));
        setJoinedCommunityIds((memberships||[]).map(m=>m.community_id));
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedCommunity?.id || !supabase) return;
    (async () => {
      const { data } = await supabase.from("community_posts").select("*").eq("community_id",selectedCommunity.id).order("created_at",{ascending:false});
      if (!data) return;
      const enriched = await Promise.all(data.map(async p => {
        const [{count:likes},{count:comments}] = await Promise.all([
          supabase.from("community_post_likes").select("*",{count:"exact",head:true}).eq("post_id",p.id),
          supabase.from("community_comments").select("*",{count:"exact",head:true}).eq("post_id",p.id)
        ]);
        return {id:p.id,name:p.author_name,role:p.author_role,time:new Date(p.created_at).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}),text:p.body,likes:likes||0,comments:comments||0,avatar:p.author_avatar_url};
      }));
      setPosts(enriched);
    })();
  }, [selectedCommunity?.id]);
  const filtered = communityCards.filter(item =>
    (category === "All" || item.category === category) &&
    (!search.trim() || (item.name+" "+item.desc+" "+item.category).toLowerCase().includes(search.toLowerCase()))
  );

  function showNotice(message) {
    setNotice(message);
    window.clearTimeout(window.__connectHubCommunityNotice);
    window.__connectHubCommunityNotice = window.setTimeout(() => setNotice(""), 2200);
  }

  function handleFile(event, setter) {
    const file = event.target.files?.[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
  }

  async function createCommunity() {
    if (!form.name.trim() || !form.type || !form.description.trim()) { showNotice("Please complete the required fields."); return; }
    if (!supabase || !user?.id) { showNotice("Please sign in to create a community."); return; }
    const { data, error } = await supabase.from("communities").insert({
      owner_id:user.id,name:form.name.trim(),category:form.type,description:form.description.trim(),
      state:form.state||null,city:form.city||null,privacy:form.privacy,cover_url:coverPreview||null,icon_url:iconPreview||null,rules:form.rules||null
    }).select("*").single();
    if (error) { showNotice(error.message || "Could not create community."); return; }
    const created={id:data.id,ownerId:user.id,name:data.name,category:data.category,members:"1",privacy:data.privacy,desc:data.description,image:data.cover_url||"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85",icon:data.icon_url?"":"👥",state:data.state,city:data.city};
    setCommunityCards(current=>[created,...current]); setJoined(current=>({...current,[created.name]:true})); setMyCommunityIds(current=>[created.id,...current]); setJoinedCommunityIds(current=>[created.id,...current]);
    showNotice("Community created successfully."); setCreateOpen(false);
    setForm({ name:"", type:"", description:"", state:"", city:"", privacy:"Public", rules:"" });
    setCoverPreview("");
    setIconPreview("");
  }


  async function joinCommunity(community) {
    if (!supabase || !user?.id || !community?.id) { setJoined(v=>({...v,[community.name]:!v[community.name]})); return; }
    if (joined[community.name]) {
      const { error } = await supabase.from("community_members").delete().eq("community_id",community.id).eq("user_id",user.id);
      if (!error) setJoined(v=>({...v,[community.name]:false}));
      return;
    }
    if (community.privacy === "Private") {
      const { error } = await supabase.from("community_join_requests").upsert({community_id:community.id,user_id:user.id,status:"PENDING"},{onConflict:"community_id,user_id"});
      if (!error) showNotice("Join request sent.");
      else showNotice(error.message);
      return;
    }
    const { error } = await supabase.from("community_members").insert({community_id:community.id,user_id:user.id,role:"MEMBER",username:currentName,avatar_url:avatar||null});
    if (!error) setJoined(v=>({...v,[community.name]:true})); else showNotice(error.message);
  }

  async function addPost(){if(!postText.trim()){showNotice("Write something before posting.");return;}setPosts(v=>[{id:Date.now(),name:currentName,role:"Member",time:"Just now",text:postText.trim(),likes:0,comments:0},...v]);setPostText("");showNotice("Post added.");}
  async function toggleLike(id){
    const was=!!likedPosts[id]; setLikedPosts(v=>({...v,[id]:!was}));
    if(supabase && typeof id==="string"){
      const q=was ? supabase.from("community_post_likes").delete().eq("post_id",id).eq("user_id",user.id) : supabase.from("community_post_likes").insert({post_id:id,user_id:user.id});
      const {error}=await q; if(error){setLikedPosts(v=>({...v,[id]:was}));showNotice(error.message);return;}
    }
    setPosts(v=>v.map(p=>p.id===id?{...p,likes:Math.max(0,p.likes+(was?-1:1))}:p));
  }
  async function toggleBookmark(id){
    const was=!!bookmarkedPosts[id]; setBookmarkedPosts(v=>({...v,[id]:!was}));
    if(supabase && typeof id==="string"){
      const q=was ? supabase.from("community_post_bookmarks").delete().eq("post_id",id).eq("user_id",user.id) : supabase.from("community_post_bookmarks").insert({post_id:id,user_id:user.id});
      const {error}=await q; if(error){setBookmarkedPosts(v=>({...v,[id]:was}));showNotice(error.message);return;}
    }
    showNotice(was?"Removed from bookmarks.":"Saved to bookmarks.");
  }
  if(selectedCommunity){const community=selectedCommunity;return (<main className="community-shell">
    <header className="community-topbar"><button className="community-brand" onClick={()=>setSelectedCommunity(null)}><span className="community-brand-mark"><Users size={19} fill="currentColor"/></span><span>Connect<span>Hub</span></span></button><div className="community-search"><Search size={17}/><input placeholder="Search communities, posts, or topics..."/></div><div className="community-top-actions"><button onClick={()=>onNavigate?.("Favorites")}><Heart size={20}/></button><button><MessageCircle size={20}/></button><button className="community-notification"><Bell size={19}/><i/></button><button className="community-profile-mini"><span>{avatar?<img src={avatar} alt=""/>:<UserRound size={17}/>}</span><b>{currentName.split(" ")[0]}</b><ChevronDown size={15}/></button></div></header>
    <div className="community-layout"><UniversalSidebar activeNav="Communities" onNavigate={onNavigate} onLogout={onLogout}/><section className="community-main">
      <button className="community-back-dashboard" onClick={()=>setSelectedCommunity(null)}><ArrowRight size={17} style={{transform:"rotate(180deg)"}}/> Back to Community Dashboard</button>
      <div className="community-cover"><div className="community-cover-art" style={{backgroundImage:"url("+community.image+")",backgroundSize:"cover",backgroundPosition:"center"}}></div><div className="community-header-card"><div className="community-logo">{community.icon}</div><div className="community-title-block"><h1>{community.name}</h1><p>{community.members} members <span>•</span> {community.privacy} <span>•</span> {community.category}</p><small>{community.desc}</small></div><div className="community-header-actions"><button className={joined[community.name]?"community-join joined":"community-join"} onClick={()=>joinCommunity(community)}>{joined[community.name]?"✓ Joined":"Join Community"}</button><button className="community-more">•••</button></div></div><nav className="community-tabs">{["Posts","About","Members","Events","Tickets"].map((tab,i)=><button key={tab} className={i===0?"active":""} onClick={()=>i?showNotice("No "+tab.toLowerCase()+" available yet."):null}>{tab}</button>)}</nav></div>
      <section className="community-composer"><div className="community-composer-avatar">{avatar?<img src={avatar} alt=""/>:<UserRound size={18}/>}</div><div className="community-composer-body"><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder={"Write something to the community, "+currentName.split(" ")[0]+"..."} rows={2}/><div className="community-composer-actions"><div><button onClick={()=>showNotice("Image posting will be connected next.")}>＋ Image</button><button onClick={()=>showNotice("Polls will be connected next.")}>▥ Poll</button><button onClick={()=>showNotice("Tagging will be connected next.")}>⌑ Tag</button></div><button className="community-post-button" onClick={addPost}>Post</button></div></div></section>
      <div className="community-feed-filter"><button className="active">Latest</button><button onClick={()=>showNotice("Popular sorting will be connected next.")}>Popular</button><button onClick={()=>showNotice("Following posts will be connected next.")}>Following</button></div>
      <section className="community-feed">{posts.map(post=><article className="community-post" key={post.id}><div className="community-post-avatar"><UserRound size={18}/></div><div className="community-post-body"><div className="community-post-head"><div><b>{post.name}</b><span>{post.role}</span><small>• {post.time}</small></div><button>•••</button></div><p className="community-post-text">{post.text}</p><div className="community-post-actions"><button className={likedPosts[post.id]?"active like":""} onClick={()=>toggleLike(post.id)}><Heart size={17} fill={likedPosts[post.id]?"currentColor":"none"}/>{post.likes}</button><button className={commentOpen[post.id]?"active":""} onClick={()=>setCommentOpen(v=>({...v,[post.id]:!v[post.id]}))}><MessageCircle size={17}/>{post.comments}</button><button className={bookmarkedPosts[post.id]?"active bookmark":""} onClick={()=>toggleBookmark(post.id)}><Bookmark size={17} fill={bookmarkedPosts[post.id]?"currentColor":"none"}/></button></div>{commentOpen[post.id]&&<div className="community-comment-box"><div className="community-comment-avatar"><UserRound size={15}/></div><input placeholder="Write a comment..." onKeyDown={async e=>{if(e.key==="Enter"){if(supabase && typeof post.id==="string"){const {error}=await supabase.from("community_comments").insert({post_id:post.id,author_id:user.id,author_name:currentName,author_avatar_url:avatar||null,body:e.currentTarget.value.trim()});if(error){showNotice(error.message);return;}}setPosts(v=>v.map(p=>p.id===post.id?{...p,comments:p.comments+1}:p));e.currentTarget.value="";setCommentOpen(v=>({...v,[post.id]:false}));showNotice("Comment added.");}}}/><button onClick={()=>showNotice("Comment added.")}>Post</button></div>}</div></article>)}</section>
    </section><aside className="community-right"><section className="community-side-card"><h2>Community Info</h2><div className="community-info-row"><Users size={17}/><span>{community.members} members</span></div><div className="community-info-row"><HeartHandshake size={17}/><span>{community.privacy} community</span></div><div className="community-info-row"><Ticket size={17}/><span>{community.category}</span></div>{community.city&&<div className="community-info-row"><MapPin size={17}/><span>{community.city}, {community.state}</span></div>}<p>{community.desc}</p></section><section className="community-side-card"><h2>Rules</h2><ol className="community-rules"><li>Be respectful and kind.</li><li>No spam or irrelevant posts.</li><li>No fraudulent listings.</li><li>Keep discussions constructive.</li><li>Follow community guidelines.</li></ol></section><section className="community-side-card"><div className="community-side-title-row"><h2>Upcoming Events</h2><button onClick={()=>showNotice("No upcoming events yet.")}>View all</button></div><div className="community-event"><div className="community-event-art">🎉</div><div><b>No upcoming event</b><small>Events will appear here.</small></div></div></section><section className="community-side-card"><div className="community-side-title-row"><h2>Top Members</h2><button onClick={()=>showNotice("Members will appear here.")}>View all</button></div><div className="community-member-row"><span className="community-member-avatar"><UserRound size={16}/></span><div><b>{currentName}</b><small>New member</small></div><button>Following</button></div></section></aside></div>{notice&&<div className="community-toast">{notice}</div>}</main>);}
  return (
    <main className="communities-discover-shell">
      <header className="community-topbar">
        <button className="community-brand" onClick={onBack}><span className="community-brand-mark"><Users size={19} fill="currentColor" /></span><span>Connect<span>Hub</span></span></button>
        <div className="community-search"><Search size={17} /><input placeholder="Search communities, posts, or topics..." /></div>
        <div className="community-top-actions">
          <button aria-label="Favorites" onClick={() => onNavigate?.("Favorites")}><Heart size={20} /></button>
          <button aria-label="Messages"><MessageCircle size={20} /></button>
          <button className="community-notification" aria-label="Notifications"><Bell size={19} /><i /></button>
          <button className="community-profile-mini"><span>{avatar ? <img src={avatar} alt="" /> : <UserRound size={17} />}</span><b>{currentName.split(" ")[0]}</b><ChevronDown size={15} /></button>
        </div>
      </header>

      <div className="communities-discover-layout">
        <UniversalSidebar activeNav="Communities" onNavigate={onNavigate} onLogout={onLogout} />
        <section className="communities-discover-main">
          <div className="communities-heading">
            <div><h1>Communities</h1><p>Discover communities, interests and people.</p></div>
            <button className="create-community-primary" onClick={() => setCreateOpen(true)}><Plus size={18}/> Create Community</button>
          </div>
          <div className="communities-searchbar"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search communities..." /></div>
          <div className="community-category-pills">{categories.map(item => <button key={item} className={category===item ? "active":""} onClick={()=>setCategory(item)}>{item}</button>)}</div>
          <div className="communities-dashboard-columns">
            <div>
              <div className="community-discover-grid">
                {filtered.map(item => {
                  const isOwner = item.ownerId === user?.id || myCommunityIds.includes(item.id);
                  const isJoined = isOwner || joined[item.name] || joinedCommunityIds.includes(item.id);
                  return <article className="community-discover-card" key={item.id || item.name} onClick={(event)=>{if(event.target.closest("button"))return;setSelectedCommunity(item);}}>
                    <div className="community-card-cover" style={{backgroundImage:"url("+item.image+")"}}><div className="community-card-menu">•••</div></div>
                    <div className="community-card-content">
                      <div className="community-card-icon">{item.icon}</div>
                      <h2>{item.name}</h2>
                      <p className="community-card-meta">{item.members} members <span>•</span> {item.privacy}</p>
                      <p className="community-card-description">{item.desc}</p>
                      <button className={isOwner ? "community-card-join owner" : isJoined ? "community-card-join joined" : "community-card-join"} onClick={()=>isOwner ? setSelectedCommunity(item) : joinCommunity(item)}>{isOwner ? "★  My Community" : isJoined ? "✓  Joined" : "Join Community"}</button>
                    </div>
                  </article>;
                })}
              </div>
              {!filtered.length && <div className="community-discover-empty"><Search size={28}/><b>No communities found</b><span>Try another search or category.</span></div>}
            </div>
            <aside className="communities-dashboard-right">
              <section className="my-communities-card">
                <div className="my-communities-head"><h2>My Communities</h2><button onClick={()=>showNotice("Showing all your communities.")}>View all <ArrowRight size={14}/></button></div>
                <div className="my-community-tabs"><button className="active">Created by me ({communityCards.filter(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)).length})</button><button>Joined ({Math.max(0,joinedCommunityIds.filter(id=>!myCommunityIds.includes(id)).length)})</button></div>
                <div className="my-community-list">
                  {communityCards.filter(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)).slice(0,3).map(c=><button className="my-community-item" key={c.id||c.name} onClick={()=>setSelectedCommunity(c)}><div className="my-community-thumb" style={{backgroundImage:"url("+c.image+")"}}></div><div className="my-community-copy"><b>{c.name}</b><span>{c.members} members • {c.privacy}</span></div><em>Owner</em><span className="my-community-dots">•••</span></button>)}
                  {!communityCards.some(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)) && <div className="my-community-empty">Create your first community and it will appear here.</div>}
                </div>
              </section>
              <section className="my-activity-card"><h2>Your Community Activity</h2><div className="activity-stats"><div><b>{communityCards.filter(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)).length}</b><span>My Community</span></div><div><b>{Math.max(0,joinedCommunityIds.filter(id=>!myCommunityIds.includes(id)).length)}</b><span>Joined Communities</span></div><div><b>0</b><span>Posts</span></div><div><b>0</b><span>Likes Received</span></div></div></section>
              <section className="recommended-community-card"><div className="my-communities-head"><h2>Recommended for You</h2><button onClick={()=>showNotice("Showing recommended communities.")}>View all <ArrowRight size={14}/></button></div><div className="recommended-row"><span>🎓</span><div><b>Kharagpur Students</b><small>1,210 members</small></div><button onClick={()=>showNotice("Recommendation join will be connected next.")}>Join</button></div><div className="recommended-row"><span>🚆</span><div><b>Travel Buddies India</b><small>3,560 members</small></div><button onClick={()=>showNotice("Recommendation join will be connected next.")}>Join</button></div><div className="recommended-row"><span>🎓</span><div><b>MTech Aspirants</b><small>980 members</small></div><button onClick={()=>showNotice("Recommendation join will be connected next.")}>Join</button></div></section>
            </aside>
          </div>
        </section>

        {createOpen && (
          <aside className="create-community-drawer">
            <div className="create-community-drawer-head"><button onClick={()=>setCreateOpen(false)}>← Back to Communities</button><button aria-label="Close" onClick={()=>setCreateOpen(false)}>×</button></div>
            <div className="create-community-title"><h1>Create Community</h1><p>Create a space for people with shared interests, location or purpose.</p></div>
            <div className="create-community-form">
              <label>Community Name *<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. IIT Kharagpur Students" /></label>
              <label>Community Type *<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="">Select a category</option>{categories.slice(1).map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Description *<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} maxLength={500} placeholder={"Tell people what this community is about...\n(e.g. discussions, events, ticket sharing, etc.)"} /><small>{form.description.length}/500</small></label>
              <label>Cover Image <span className="optional">(Optional)</span>
                <label className="create-upload-box">{coverPreview ? <img src={coverPreview} alt="" /> : <><span>▧</span><b>Upload a cover image</b><small>JPG, PNG up to 5MB</small></>}<input type="file" accept="image/png,image/jpeg" onChange={e=>handleFile(e,setCoverPreview)} /></label>
              </label>
              <label>Community Icon <span className="optional">(Optional)</span>
                <label className="create-icon-upload"><span>{iconPreview ? <img src={iconPreview} alt="" /> : "▧"}</span><div><b>Upload community icon</b><small>JPG, PNG up to 2MB</small></div><input type="file" accept="image/png,image/jpeg" onChange={e=>handleFile(e,setIconPreview)} /></label>
              </label>
              <label>Location <span className="optional">(Optional)</span><div className="create-location-row"><select value={form.state} onChange={e=>setForm({...form,state:e.target.value,city:""})}><option value="">Select State</option>{states.map(x=><option key={x}>{x}</option>)}</select><select value={form.city} onChange={e=>setForm({...form,city:e.target.value})} disabled={!form.state}><option value="">Select City</option>{(citiesByState[form.state]||[]).map(x=><option key={x}>{x}</option>)}</select></div></label>
              <fieldset className="create-privacy"><legend>Community Privacy *</legend><label><input type="radio" checked={form.privacy==="Public"} onChange={()=>setForm({...form,privacy:"Public"})}/><span><b>Public</b><small>Anyone can find and join this community.</small></span></label><label><input type="radio" checked={form.privacy==="Private"} onChange={()=>setForm({...form,privacy:"Private"})}/><span><b>Private</b><small>Members need approval to join.</small></span></label></fieldset>
              <label>Community Rules <span className="optional">(Optional)</span><textarea value={form.rules} onChange={e=>setForm({...form,rules:e.target.value})} placeholder={"Add rules for your community...\n(e.g. be respectful, no spam, etc.)"} /></label>
              <div className="create-community-actions"><button onClick={()=>setCreateOpen(false)}>Cancel</button><button className="create-community-submit" onClick={createCommunity}>Create Community</button></div>
            </div>
          </aside>
        )}
      </div>
      {notice && <div className="community-toast">{notice}</div>}
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState("Home");
  const [search, setSearch] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadMyListings() {
      if (!supabase || !user?.id) {
        if (mounted) setListingsLoading(false);
        return;
      }
      setListingsLoading(true);
      const [trainResult, movieResult, concertResult] = await Promise.all([
        supabase
          .from("listings")
          .select("id, category, train_number, train_name, from_name, to_name, journey_date, departure_at, status, ticket_count, price_per_ticket, ready_to_bargain, created_at")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("movie_listings")
          .select("id, movie_name, poster_url, city, cinema_hall, show_date, show_at, status, ticket_count, price_mode, price_per_ticket, ready_to_bargain, created_at")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("concert_listings")
          .select("id, event_name, artist_name, city, venue, event_date, event_at, status, ticket_count, price_mode, price_per_ticket, ready_to_bargain, created_at")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);
      const trainListings = (trainResult.data || []).map(item => ({ ...item, listingKind: "TRAIN" }));
      const movieListings = (movieResult.data || []).map(item => ({ ...item, listingKind: "MOVIE" }));
      const concertListings = (concertResult.data || []).map(item => ({ ...item, listingKind: "CONCERT" }));
      const combined = [...trainListings, ...movieListings, ...(concertListings.length ? concertListings : [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      if (mounted) {
        setMyListings((trainResult.error && movieResult.error && concertResult.error) ? [] : combined);
        setListingsLoading(false);
      }
    }
    loadMyListings();
    return () => { mounted = false; };
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    async function loadFavoriteCount() {
      if (!user?.id) { setFavoriteCount(0); return; }
      const { count, error } = await supabase
        .from("listing_favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (mounted) setFavoriteCount(error ? 0 : (count || 0));
    }
    loadFavoriteCount();
    return () => { mounted = false; };
  }, [user?.id]);

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Amartya";
  const firstName = name.split(" ")[0];
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  if (activeNav === "Movie Ticket") return <MovieTicketListingPage activeSub="MOVIE" onBack={() => setActiveNav("Home")} onTrain={() => setActiveNav("Create Listing")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} states={states} citiesByState={citiesByState} />;
  if (activeNav === "Concert Ticket") return <ConcertTicketListingPage activeSub="CONCERT" onBack={() => setActiveNav("Home")} onTrain={() => setActiveNav("Create Listing")} onMovie={() => setActiveNav("Movie Ticket")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} states={states} citiesByState={citiesByState} />;
  if (activeNav === "Find People") return (
    <main className="coming-soon-shell coming-soon-with-sidebar">
      <UniversalSidebar activeNav="Find People" onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} />
      <section className="coming-soon-stage">
        <button className="coming-soon-back" onClick={() => setActiveNav("Home")}><ArrowRight size={16} style={{transform:"rotate(180deg)"}} /> Back to Dashboard</button>
        <section className="coming-soon-card">
          <div className="coming-soon-icon"><Users size={30}/></div>
          <span>CONNECTHUB</span>
          <h1>Roommate & People Finder</h1>
          <p>Find roommates, friends and people with similar interests. This section is coming next.</p>
          <button onClick={() => setActiveNav("Home")}>Back to Home</button>
        </section>
      </section>
    </main>
  );
  if (activeNav === "Find Tickets") return <FindTicketsPage user={user} onBack={() => setActiveNav("Home")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} />;
  if (activeNav === "Favorites") return <FavoritesPage user={user} onBack={() => setActiveNav("Home")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} />;
  if (activeNav === "Communities") return <CommunitiesPage user={user} onBack={() => setActiveNav("Home")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} />;
  if (activeNav === "Create Listing") return <CreateListingPage activeSub="TRAIN" onBack={() => setActiveNav("Home")} onMovie={() => setActiveNav("Movie Ticket")} onConcert={() => setActiveNav("Concert Ticket")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} />;
  if (activeNav === "My Listings") return <MyListingsPage user={user} onBack={() => setActiveNav("Home")} onNavigate={setActiveNav} onLogout={async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }} />;
  const navItems = [
    { label: "Home", icon: Home }, { label: "Find Tickets", icon: Ticket }, { label: "Create Listing", icon: Plus }, { label: "Find People", icon: Users },
    { label: "Communities", icon: HeartHandshake }, { label: "Messages", icon: MessageCircle }, { label: "My Listings", icon: Ticket },
    { label: "Bookmarks", icon: Bookmark }, { label: "Profile", icon: UserRound }, { label: "Settings", icon: Settings },
  ];
  const tickets = [
    { type: "Concert", title: "Diljit Dosanjh - India Tour", place: "Mumbai, MH", date: "25 Nov 2026", price: "₹2,500", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=85" },
    { type: "Cricket", title: "India vs Australia - 3rd ODI", place: "Kolkata, WB", date: "17 Nov 2026", price: "₹1,800", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=700&q=85" },
    { type: "Movie", title: "Pushpa 2 - Movie Tickets", place: "Delhi, DL", date: "8 Dec 2026", price: "₹650", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=85" },
    { type: "Train", title: "Patna to Delhi", place: "Patna → Delhi", date: "12 Nov 2026", price: "₹1,200", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=700&q=85" },
  ];
  const people = [
    { name: "Neha", city: "Delhi", about: "Looking for Roommate" }, { name: "Rohan", city: "Bengaluru", about: "Tech & Startups" },
    { name: "Sneha", city: "Mumbai", about: "Concerts & Travel" }, { name: "Vikram", city: "Kolkata", about: "Cricket & Football" },
    { name: "Ananya", city: "Pune", about: "Movies & Food" },
  ];
  const suggested = [
    { name: "Rahul Sharma", meta: "IIT KGP · Interested in Concerts" }, { name: "Priya Singh", meta: "Kolkata · Looking for Roommate" }, { name: "Arjun Mehta", meta: "Mumbai · Cricket Fan" },
  ];
  const communities = [
    { name: "IIT Students", count: "2.4k members", icon: "🎓" }, { name: "Cricket Fans", count: "8.2k members", icon: "🏏" },
    { name: "Movie Buffs", count: "5.1k members", icon: "🎬" }, { name: "Concert Goers", count: "3.6k members", icon: "🎵" },
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="dashboard-brand"><span className="dashboard-logo"><Users size={20} fill="currentColor" /></span><span>Connect<span>Hub</span></span></div>
        <div className="dashboard-search top-search"><Search size={18} /><input placeholder="Search tickets, people, events, locations..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="top-actions">
          <button className="post-button" onClick={() => setActiveNav("Create Listing")}><Plus size={17} /> Post</button>
          <button className="icon-button" aria-label="Messages"><MessageCircle size={20} /></button><button className="icon-button dashboard-favorite-button" aria-label="Favorites" onClick={() => setActiveNav("Favorites")}><Heart size={20} fill={favoriteCount ? "currentColor" : "none"} /><i>{favoriteCount > 99 ? "99+" : favoriteCount}</i></button>
          <button className="icon-button notification-button" aria-label="Notifications"><Bell size={20} /><i /></button>
          <button className="profile-mini"><span className="avatar">{avatar ? <img src={avatar} alt="" /> : <UserRound size={18} />}</span><b>{firstName}</b><ChevronDown size={16} /></button>
          <button className="mobile-menu" aria-label="Menu"><Menu size={21} /></button>
        </div>
      </header>
      <div className="dashboard-body">
        <UniversalSidebar activeNav={activeNav} activeSub={activeNav === "Create Listing" ? "TRAIN" : activeNav === "Movie Ticket" ? "MOVIE" : activeNav === "Concert Ticket" ? "CONCERT" : ""} onNavigate={setActiveNav} onLogout={onLogout} />
        <section className="dashboard-main">
          <div className="welcome-panel">
            <div><p className="welcome-kicker">YOUR CONNECTHUB SPACE</p><h1>Good evening, {firstName} <span>👋</span></h1><p>What are you looking for today?</p></div>
            <div className="dashboard-search hero-search"><Search size={19} /><input placeholder="Search tickets, people, events, locations..." value={search} onChange={e => setSearch(e.target.value)} /><button aria-label="Search"><Search size={18} /></button></div>
            <div className="search-tags">{["Concerts","Cricket","Movies","Train Tickets","Roommates","IIT Students","Nearby"].map(tag => <button key={tag} onClick={() => setSearch(tag)}>{tag}</button>)}</div>
          </div>

          <section className="dashboard-section">
            <div className="section-heading"><h2>Quick Actions</h2></div>
            <div className="quick-grid">
              <button className="quick-card lavender" onClick={() => setActiveNav("Find Tickets")}><span><Ticket size={23} /></span><div><b>Find Tickets</b><small>Concerts, Movies, Trains</small></div><ArrowRight size={18} /></button>
              <button className="quick-card pink" onClick={() => setActiveNav("Find People")}><span><Users size={23} /></span><div><b>Find People</b><small>Roommates, Friends</small></div><ArrowRight size={18} /></button>
              <button className="quick-card green" onClick={() => setActiveNav("Communities")}><span><Users size={23} /></span><div><b>Explore Communities</b><small>Join groups & interests</small></div><ArrowRight size={18} /></button>
              <button className="quick-card yellow" onClick={() => setActiveNav("Create Listing")}><span><Plus size={23} /></span><div><b>Create a Listing</b><small>Sell or find what you need</small></div><ArrowRight size={18} /></button>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading"><h2>Your Listings</h2><button onClick={() => setActiveNav("My Listings")}>View all <ArrowUpRight size={16} /></button></div>
            {listingsLoading ? (
              <div className="dashboard-empty-card">Loading your listings...</div>
            ) : myListings.length ? (
              <div className="my-listing-grid">
                {myListings.slice(0, 4).map(listing => (
                  <article className="my-listing-card" key={listing.id}>
                    {listing.listingKind === "MOVIE" ? (
                      <div className="my-listing-poster">{listing.poster_url ? <img src={listing.poster_url} alt="" /> : <span>🎬</span>}</div>
                    ) : (
                      <div className="my-listing-icon">{listing.listingKind === "CONCERT" ? <Music2 size={20} /> : <Ticket size={20} />}</div>
                    )}
                    <div className="my-listing-info">
                      <b>{listing.listingKind === "MOVIE" ? listing.movie_name : listing.listingKind === "CONCERT" ? listing.event_name : (listing.from_name + " → " + listing.to_name)}</b>
                      <span>{listing.listingKind === "MOVIE" ? (listing.cinema_hall + " · " + listing.city) : listing.listingKind === "CONCERT" ? (listing.venue + " · " + listing.city) : (listing.train_number + " · " + listing.train_name)}</span>
                      <small>{listing.listingKind === "MOVIE" ? (listing.show_date + " · " + listing.ticket_count + " ticket" + (listing.ticket_count === 1 ? "" : "s")) : listing.listingKind === "CONCERT" ? (listing.event_date + " · " + listing.ticket_count + " ticket" + (listing.ticket_count === 1 ? "" : "s")) : (listing.journey_date + " · " + listing.ticket_count + " ticket" + (listing.ticket_count === 1 ? "" : "s"))}</small>
                    </div>
                    <div className="my-listing-side">
                      <strong>{listing.price_per_ticket ? "₹" + Number(listing.price_per_ticket).toLocaleString("en-IN") : "Price varies"}</strong>
                      <em className={listing.status === "ACTIVE" ? "listing-active" : "listing-status"}>{listing.status}</em>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-card">You haven't posted any listings yet.</div>
            )}
          </section>

          <section className="dashboard-section">
            <div className="section-heading"><h2>Trending Tickets Near You</h2><button>View all <ArrowUpRight size={16} /></button></div>
            <div className="ticket-grid">{tickets.map(ticket => (
              <article className="ticket-card" key={ticket.title}>
                <div className="ticket-image"><img src={ticket.image} alt="" /><button className="heart-button" aria-label="Bookmark ticket"><Heart size={17} /></button><span>{ticket.type}</span></div>
                <div className="ticket-content"><h3>{ticket.title}</h3><p><MapPin size={13} /> {ticket.place}</p><p><Ticket size={13} /> {ticket.date}</p><div className="ticket-bottom"><b>{ticket.price}</b><button>View Details</button></div></div>
              </article>
            ))}</div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading"><h2>People Near You</h2><button>View all <ArrowUpRight size={16} /></button></div>
            <div className="people-grid">{people.map((person, index) => (
              <article className="person-card" key={person.name}><div className={`person-avatar avatar-${index + 1}`}><UserRound size={20} /></div><div><b>{person.name}</b><small>{person.city}</small><small>{person.about}</small></div><button>Connect</button></article>
            ))}</div>
          </section>
        </section>

        <aside className="dashboard-right">
          <section className="profile-card">
            <div className="profile-card-head"><span className="large-avatar">{avatar ? <img src={avatar} alt="" /> : <UserRound size={25} />}</span><div><b>{name}</b><small>@{firstName.toLowerCase()}</small></div><button>Edit Profile</button></div>
            <div className="profile-stats"><div><b>{myListings.length}</b><small>Listings</small></div><div><b>{favoriteCount}</b><small>Favorites</small></div><div><b>4</b><small>Communities</small></div></div>
          </section>
          <section className="side-card"><div className="section-heading"><h2>Suggested People</h2><button>View all</button></div>{suggested.map((person, index) => (
            <div className="suggested-row" key={person.name}><span className={`person-avatar small avatar-${index + 2}`}><UserRound size={16} /></span><div><b>{person.name}</b><small>{person.meta}</small></div><button>Connect</button></div>
          ))}</section>
          <section className="side-card"><div className="section-heading"><h2>Popular Communities</h2><button onClick={() => setActiveNav("Communities")}>View all</button></div>{communities.map((community, index) => (
            <div className="community-row" key={community.name}><span className={`community-icon community-${index + 1}`}>{community.icon}</span><div><b>{community.name}</b><small>{community.count}</small></div><button onClick={() => setActiveNav("Communities")}>Join</button></div>
          ))}</section>
        </aside>
      </div>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [isResetMode, setIsResetMode] = useState(() => new URLSearchParams(window.location.search).get("reset") === "1");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [legalPage, setLegalPage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && !isResetMode) setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResetMode(true);
        setUser(null);
        setMessage("");
        setPassword("");
        setConfirmPassword("");
        return;
      }
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && !isResetMode) setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") setUser(null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [isResetMode]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if ((mode === "signup" || isResetMode) && password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match. Please check both fields.");
      return;
    }
    if (mode === "signup" && (!mobile.trim() || !stateName || !city.trim())) {
      setMessageType("error");
      setMessage("Please complete your mobile number, state and city.");
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setMessageType("error");
      setMessage("Supabase is not connected yet. Check your Vercel environment variables.");
      return;
    }

    setLoading(true);
    try {
      if (isResetMode) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setIsResetMode(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setMessageType("success");
        setMessage("Your password has been reset successfully. You can now log in with your new password.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim(), mobile: mobile.trim(), state: stateName, city: city.trim() } },
        });
        if (error) throw error;
        setMessageType("success");
        setMessage(data.session
          ? "Account created successfully! Welcome to ConnectHub."
          : "Account created! Check your email for a confirmation link, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setMessageType("success");
        setMessage("You're signed in successfully. Welcome to ConnectHub!");
        const { data: sessionData } = await supabase.auth.getSession();
        setUser(sessionData.session?.user ?? null);
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessageType("info");
      setMessage("Enter your email address first, then select Forgot password.");
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setMessageType("error");
      setMessage("Password reset will work once Supabase is connected.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/?reset=1`,
      });
      if (error) throw error;
      setMessageType("success");
      setMessage("If an account exists for this email, a password reset link has been sent.");
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to send a reset link right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured || !supabase) {
      setMessageType("error");
      setMessage("Supabase is not connected yet. Check your Vercel environment variables.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  if (user && !isResetMode) {
    return <Dashboard user={user} onLogout={async () => {
      if (supabase) await supabase.auth.signOut();
      setUser(null);
    }} />;
  }

  return (
    <main className={`auth-layout ${mode === "signup" && !isResetMode ? "signup-mode" : "login-mode"}`}>
      <section className="visual-panel" aria-label="ConnectHub community">
        <div className="visual-backdrop" />
        <header className="site-header">
          <a className="brand" href="/" aria-label="ConnectHub home">
            <span className="brand-symbol"><Users size={22} fill="currentColor" strokeWidth={1.8} /></span>
            <span>ConnectHub</span>
          </a>
          <nav className="desktop-nav" aria-label="Site preview">
            <span>People</span><span>Tickets</span><span>Communities</span><span>Conversations</span>
          </nav>
        </header>

        <div className="visual-content">
          <div className="visual-copy">
            <span className="eyebrow"><Sparkles size={14} /> SAME INTERESTS. SAME CITIES.</span>
            <h1>{mode === "login" ? <>Connect with<br />people around <em>you.</em></> : <>Join <em>ConnectHub</em><br />and find your people.</>}</h1>
            <p>{mode === "login"
              ? "Find tickets, meet people from your city, explore communities and be a part of something bigger."
              : "Discover events, meet people nearby and join a growing community across your city and beyond."}</p>
            <div className="feature-row">
              <div className="feature-item"><span><Ticket size={17} /></span><div><b>Tickets</b><small>Buy &amp; sell</small></div></div>
              <div className="feature-item"><span><MessageCircle size={17} /></span><div><b>Communities</b><small>Local discussions</small></div></div>
              <div className="feature-item"><span><Users size={17} /></span><div><b>People</b><small>Make new friends</small></div></div>
            </div>
          </div>

          <div className="friends-photo" role="img" aria-label="Friends spending time together at sunset">
            <div className="photo-caption"><Heart size={14} fill="currentColor" /> Stronger connections start here</div>
          </div>
          <div className="event-collage">
            {eventCards.map(({ title, image, icon: Icon }, index) => (
              <article className={`event-card event-card-${index + 1}`} key={title}>
                <img src={image} alt="" />
                <span className="event-card-label"><Icon size={14} /> {title}</span>
              </article>
            ))}
          </div>
          <div className="handwritten-note">Different cities.<br />Stronger connections.</div>
        </div>
        <footer className="visual-footer"><ShieldCheck size={16} /> Real people. Real conversations. Real connections.</footer>
        <span className="decor-orbit orbit-one" /><span className="decor-orbit orbit-two" />
      </section>

      <section className="form-side">
        <div className="form-topline">
          <span>{isResetMode ? "Remembered your password?" : mode === "login" ? "New to ConnectHub?" : "Already have an account?"}</span>
          <button className="link-button" type="button" onClick={() => { if (isResetMode) { setIsResetMode(false); window.history.replaceState({}, document.title, window.location.pathname); setMessage(""); } else switchMode(mode === "login" ? "signup" : "login"); }}>
            {isResetMode ? "Log in" : mode === "login" ? "Create an account" : "Log in"}
          </button>
        </div>

        <div className={`auth-card ${mode === "signup" ? "auth-card-signup" : ""}`}>
          <div className="mobile-brand brand"><span className="brand-symbol"><Users size={20} fill="currentColor" /></span><span>ConnectHub</span></div>
          <div className="form-heading">
            <span className="form-kicker">{isResetMode ? "SECURE YOUR ACCOUNT" : mode === "login" ? "WELCOME BACK" : "YOUR NEXT CHAPTER STARTS HERE"}</span>
            <h2>{isResetMode ? "Set a new password" : mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>{isResetMode ? "Choose a new password for your ConnectHub account." : mode === "login" ? "Log in to continue your journey." : "Join ConnectHub and start connecting today."}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate={false}>
            {mode === "signup" && !isResetMode && <div className="field-grid">
              <div className="field-group"><label htmlFor="fullName">Full name</label><div className="input-wrap"><Users size={16} /><input id="fullName" name="fullName" autoComplete="name" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={80} /></div></div>
              <div className="field-group"><label htmlFor="signupEmail">Email address</label><div className="input-wrap"><Mail size={16} /><input id="signupEmail" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>
              <div className="field-group"><label htmlFor="mobile">Mobile number</label><div className="input-wrap"><span className="country-code">🇮🇳 +91</span><input id="mobile" name="mobile" type="tel" autoComplete="tel-national" inputMode="numeric" placeholder="Enter mobile number" value={mobile} onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} required minLength={10} maxLength={10} /></div></div>
              <div className="field-group"><label htmlFor="state">State / Union Territory</label><div className="select-wrap"><MapPin size={16} /><select id="state" value={stateName} onChange={e => { setStateName(e.target.value); setCity(""); }} required><option value="">Select your state</option>{states.map(item => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={15} /></div></div>
              <div className="field-group field-full"><label htmlFor="city">City</label><div className="select-wrap"><MapPin size={16} /><select id="city" name="city" value={city} onChange={e => setCity(e.target.value)} required disabled={!stateName}><option value="">{stateName ? "Select your city" : "Select a state first"}</option>{(citiesByState[stateName] || []).map(item => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={15} /></div><small className="field-hint">Cities shown for your selected state.</small></div>
            </div>}

            {mode === "login" && !isResetMode && <div className="field-group"><label htmlFor="email">Email address</label><div className="input-wrap"><Mail size={17} /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>}

            <div className={`field-group ${mode === "signup" ? "field-grid-password" : ""}`}>
              <div className="label-row"><label htmlFor="password">Password</label>{mode === "login" && !isResetMode && <button className="link-button tiny" type="button" onClick={handleForgotPassword}>Forgot password?</button>}</div>
              <div className="input-wrap password-wrap"><LockKeyhole size={16} /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={isResetMode ? "Enter your new password" : mode === "login" ? "Enter your password" : "Create a password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            </div>

            {(mode === "signup" || isResetMode) && <div className="field-group"><label htmlFor="confirmPassword">Confirm password</label><div className="input-wrap password-wrap"><LockKeyhole size={16} /><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} /><button type="button" className="password-toggle" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirmPassword(v => !v)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>}

            {mode === "login" && !isResetMode && <label className="remember-row"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /><span>Remember me</span></label>}
            {mode === "signup" && !isResetMode && <label className="terms-row"><input type="checkbox" required /><span>I agree to the <a href="#terms" onClick={e => { e.preventDefault(); setLegalPage("terms"); }}>Terms of Service</a> and <a href="#privacy" onClick={e => { e.preventDefault(); setLegalPage("privacy"); }}>Privacy Policy</a></span></label>}

            {message && <div className={`form-message ${messageType}`} role="status">{message}</div>}
            <button className="submit-button" type="submit" disabled={loading}><span>{loading ? (isResetMode ? "Updating password..." : mode === "login" ? "Logging in..." : "Creating account...") : (isResetMode ? "Reset Password" : mode === "login" ? "Log In" : "Create Account")}</span>{!loading && <ArrowRight size={18} />}</button>
          </form>

          {mode === "login" && !isResetMode && <><div className="divider-label"><span />or continue with<span /></div><div className="social-row"><button type="button" className="social-button" onClick={handleGoogleSignIn} disabled={loading}><b className="google-g">G</b> Google</button><button type="button" className="social-button" onClick={() => { setMessageType("info"); setMessage("Apple sign-in can be enabled when we configure the provider in Supabase."); }}><span className="apple-mark">●</span> Apple</button></div></>}
          {mode === "signup" && !isResetMode && <p className="signin-prompt">Already have an account? <button type="button" className="link-button" onClick={() => switchMode("login")}>Log in</button></p>}
        </div>
        <footer className="form-footer"><span>© 2026 ConnectHub</span><span><ShieldCheck size={14} /> Your connections start safely</span></footer>
      </section>
      {legalPage && <div className="legal-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setLegalPage(""); }}>
        <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title">
          <button type="button" className="legal-close" onClick={() => setLegalPage("")} aria-label="Close legal information">×</button>
          <span className="form-kicker">CONNECTHUB · USER GUIDELINES</span>
          <h2 id="legal-title">{legalPage === "terms" ? "Terms of Service" : "Privacy Policy"}</h2>
          {legalPage === "terms" ? <>
            <h3>1. What ConnectHub does</h3>
            <p>ConnectHub is a platform that helps people who need something connect with people who may be able to provide it. We primarily facilitate connections between users; we do not ourselves sell tickets, goods, or services listed by users.</p>
            <h3>2. ConnectHub does not buy or sell</h3>
            <p>ConnectHub does not buy, sell, issue, or own tickets or other items listed by users. We only help users connect with one another. Any purchase, sale, payment, or exchange is arranged directly between the users.</p>
            <h3>3. Meet the ticket seller and check before buying</h3>
            <p>If you want to buy a ticket, meet the user selling it whenever possible and carefully check the ticket details and available proof before paying or accepting it. Make your own decision only after you are satisfied with what you have checked. Do not rely on ConnectHub as the seller or as a guarantor of the ticket. The buyer and seller are responsible for their own transaction.</p>
            <h3>4. Deals and bargaining are between users</h3>
            <p>Any price negotiation, bargaining, payment, exchange, delivery, meeting, or final transaction is decided directly between the users involved. ConnectHub does not set the price and is not a party to user-to-user deals.</p>
            <h3>5. Contact information is not shared by ConnectHub</h3>
            <p>ConnectHub does not disclose or share your private contact details with another user on your behalf without your action or permission, except where required by law or necessary to protect the platform and its users. If you choose to share your phone number, email, or other contact details with another user, you do so voluntarily and at your own discretion.</p>
            <h3>6. User responsibility and safety</h3>
            <p>Users are responsible for the accuracy of their listings, their communications, and any decision to transact or share information. Do not share passwords, OTPs, financial credentials, or unnecessary personal information. Be cautious of fraud and report suspicious activity.</p>
            
            <h3>7. Acceptable use</h3>
            <p>Do not post misleading, illegal, fraudulent, unsafe, or unauthorised listings, or misuse another person's information. We may restrict content or accounts that violate these rules or applicable law.</p>
            <h3>8. Updates</h3>
            <p>We may update these terms as the service develops. Continued use after an update means you acknowledge the updated terms, subject to applicable law.</p>
          </> : <>
            <h3>Information you provide</h3>
            <p>We may collect information you enter, such as your name, email, mobile number, city, account details, and listings, to operate ConnectHub and help users connect.</p>
            <h3>Contact details and your choice</h3>
            <p>ConnectHub does not sell your personal information or share your private contact details with other users on its own initiative. If you voluntarily send your contact details to another user, you decide what to share and with whom. Please share carefully.</p>
            <h3>Service providers and legal requirements</h3>
            <p>We use service providers such as our authentication and hosting providers to run the platform. Information may be processed by them to provide the service, or disclosed when legally required or needed to protect users and the platform.</p>
            <h3>Your choices</h3>
            <p>Keep your account credentials private and avoid including sensitive information in public listings. Contact the platform team to ask about account or personal-information concerns.</p>
          </>}
          <button type="button" className="submit-button legal-done" onClick={() => setLegalPage("")}>I understand</button>
        </section>
      </div>}
    </main>
  );
}          </div>
            <aside className="communities-dashboard-right">
              <section className="my-communities-card">
                <div className="my-communities-head"><h2>My Communities</h2><button onClick={()=>showNotice("Showing all your communities.")}>View all <ArrowRight size={14}/></button></div>
                <div className="my-community-tabs"><button className="active">Created by me ({communityCards.filter(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)).length})</button><button>Joined ({Math.max(0,joinedCommunityIds.filter(id=>!myCommunityIds.includes(id)).length)})</button></div>
                <div className="my-community-list">
                  {communityCards.filter(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)).slice(0,3).map(c=><button className="my-community-item" key={c.id||c.name} onClick={()=>setSelectedCommunity(c)}><div className="my-community-thumb" style={{backgroundImage:"url("+c.image+")"}}></div><div className="my-community-copy"><b>{c.name}</b><span>{c.members} members • {c.privacy}</span></div><em>Owner</em><span className="my-community-dots">•••</span></button>)}
                  {!communityCards.some(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)) && <div className="my-community-empty">Create your first community and it will appear here.</div>}
                </div>
              </section>
              <section className="my-activity-card"><h2>Your Community Activity</h2><div className="activity-stats"><div><b>{communityCards.filter(c=>c.ownerId===user?.id || myCommunityIds.includes(c.id)).length}</b><span>My Community</span></div><div><b>{Math.max(0,joinedCommunityIds.filter(id=>!myCommunityIds.includes(id)).length)}</b><span>Joined Communities</span></div><div><b>0</b><span>Posts</span></div><div><b>0</b><span>Likes Received</span></div></div></section>
              <section className="recommended-community-card"><div className="my-communities-head"><h2>Recommended for You</h2><button>View all <ArrowRight size={14}/></button></div><div className="recommended-row"><span>🎓</span><div><b>Kharagpur Students</b><small>1,210 members</small></div><button>Join</button></div><div className="recommended-row"><span>🚆</span><div><b>Travel Buddies India</b><small>3,560 members</small></div><button>Join</button></div><div className="recommended-row"><span>🎓</span><div><b>MTech Aspirants</b><small>980 members</small></div><button>Join</button></div></section>
            </aside>
          </div>

