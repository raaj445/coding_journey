import { useEffect, useState } from "react";
import { ArrowRight, Bell, Home, MapPin, Music2, Search, Ticket, Users } from "lucide-react";
import { supabase } from "./lib/supabase";
import UniversalSidebar from "./UniversalSidebar";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";

const cinemaHallsByCity = {
  Kolkata: ["INOX: South City, Kolkata","INOX: Quest Mall","PVR: Diamond Plaza, Jessore Kolkata","Cinepolis: Lake Mall, Kolkata","PVR: Mani Square Mall, Kolkata","Cinepolis: Acropolis Mall, Kolkata","INOX: City Centre II, Rajarhat","INOX: City Centre, Salt Lake","PVR: Avani, Kolkata","Miraj Cinemas: The Terminus, New Town","Other"],
  Mumbai: ["PVR: Phoenix Marketcity, Kurla","INOX: R-City Mall","Cinepolis: Viviana Mall","PVR: High Street Phoenix","INOX: Malad","Other"],
  Delhi: ["PVR: Select Citywalk","PVR: Ambience Mall","INOX: Nehru Place","Cinepolis: Pacific Mall","Other"],
  "New Delhi": ["PVR: Select Citywalk","PVR: Ambience Mall","INOX: Nehru Place","Cinepolis: Pacific Mall","Other"],
  Bengaluru: ["PVR: Phoenix Marketcity","INOX: Mantri Square","INOX: Orion Mall","PVR: Forum Mall","Cinepolis: ETA Mall","Other"],
  Hyderabad: ["PVR: Inorbit Mall","AMB Cinemas","INOX: GVK One","PVR: Forum Sujana Mall","Other"],
  Pune: ["PVR: Phoenix Marketcity","INOX: Amanora Mall","Cinepolis: Seasons Mall","PVR: Pavilion","Other"],
  Chennai: ["PVR: VR Chennai","PVR: Phoenix Marketcity","INOX: Chennai City Centre","Cinepolis: BSR Mall","Other"],
  Lucknow: ["PVR: Phoenix Palassio","PVR: Sahara Mall","INOX: Crown Mall","Cinepolis: Fun Republic","Other"],
  Ahmedabad: ["Cinepolis: Alpha One Mall","PVR: Acropolis Mall","INOX: Himalaya Mall","Other"],
  Jaipur: ["Cinepolis: World Trade Park","PVR: Mall of Jaipur","INOX: GT Central","Other"],
  Noida: ["PVR: DLF Mall of India","Cinepolis: The Great India Place","INOX: Logix City Centre","Other"],
  Gurugram: ["PVR: Ambience Mall","PVR: MGF Metropolitan Mall","INOX: Worldmark","Other"],
  Chandigarh: ["PVR: Elante Mall","INOX: Elante Mall","Other"],
  Kochi: ["PVR: Lulu Mall","Cinepolis: Centre Square Mall","INOX: LuLu Mall","Other"],
  Indore: ["INOX: Malhar Mega Mall","PVR: Treasure Island Mall","Other"],
  Bhubaneswar: ["Cinepolis: Esplanade One","INOX: DN Regalia","PVR: BMC Bhawani Mall","Other"],
  Patna: ["PVR: City Centre","INOX: P&M Mall","Miraj Cinemas: Patna","Other"],
  Ranchi: ["PVR: Nucleus Mall","INOX: Spring City Mall","Other"],
  Guwahati: ["PVR: City Centre","Cinepolis: Central Mall","INOX: Guwahati Central","Other"],
  Nagpur: ["PVR: Empress City Mall","Cinepolis: VR Nagpur","INOX: Jaswant Tuli Mall","Other"],
  Surat: ["PVR: Rahul Raj Mall","INOX: VR Mall","Cinepolis: Imperial Square","Other"],
  Vadodara: ["INOX: Seven Seas Mall","PVR: Eva The Mall","Other"],
  Visakhapatnam: ["INOX: CMR Central","Cinepolis: CMR Central","Other"],
  Coimbatore: ["INOX: Prozone Mall","PVR: Brookefields Mall","Other"],
  Thane: ["Cinepolis: Viviana Mall","PVR: Korum Mall","Other"]
};

export default function MovieTicketListingPage({ onBack, onTrain, states, citiesByState, onNavigate, onLogout, activeSub = "MOVIE" }) {
  const [movieName, setMovieName] = useState("Pushpa 2: The Rule");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [movieSearchOpen, setMovieSearchOpen] = useState(false);
  const [movieSearching, setMovieSearching] = useState(false);
  const [movieSearchError, setMovieSearchError] = useState("");
  const [movieOther, setMovieOther] = useState(false);
  const [stateName, setStateName] = useState("West Bengal");
  const [city, setCity] = useState("Kolkata");
  const [cinemaHall, setCinemaHall] = useState("INOX: South City, Kolkata");
  const [otherHall, setOtherHall] = useState("");
  const [showDate, setShowDate] = useState("2026-10-20");
  const [showTime, setShowTime] = useState("19:30");
  const [language, setLanguage] = useState("Hindi");
  const [format, setFormat] = useState("2D");
  const [ticketCount, setTicketCount] = useState(2);
  const [tickets, setTickets] = useState([
    { ticketType: "Premium", seatType: "Normal", price: "800" },
    { ticketType: "Premium", seatType: "Normal", price: "800" }
  ]);
  const [samePrice, setSamePrice] = useState(true);
  const [price, setPrice] = useState("800");
  const [bargain, setBargain] = useState(true);
  const [description, setDescription] = useState("2 premium tickets for Pushpa 2 at INOX South City. Good seats. Genuine buyers only.");
  const [posting, setPosting] = useState(false);

  const cities = citiesByState[stateName] || [];
  const halls = cinemaHallsByCity[city] || ["Other"];
  const hallDisplay = cinemaHall === "Other" ? (otherHall.trim() || "Cinema Hall") : cinemaHall;
  const totalPrice = samePrice ? Number(price || 0) * ticketCount : tickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);

  async function searchMovies(mode = "search", query = "") {
    setMovieSearching(true);
    setMovieSearchError("");
    if (!TMDB_API_KEY) {
      setMovieResults([]);
      setMovieSearchError("Movie search is not configured yet.");
      setMovieSearching(false);
      return;
    }
    try {
      const endpoint = mode === "recent"
        ? "https://api.themoviedb.org/3/discover/movie"
        : "https://api.themoviedb.org/3/search/movie";
      const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "en-IN",
        include_adult: "false",
        page: "1",
        region: "IN"
      });
      if (mode === "recent") {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 45);
        params.set("primary_release_date.gte", start.toISOString().slice(0, 10));
        params.set("primary_release_date.lte", today.toISOString().slice(0, 10));
        params.set("sort_by", "primary_release_date.desc");
        params.set("with_release_type", "2|3");
      } else {
        if (!query) {
          setMovieResults([]);
          setMovieSearching(false);
          return;
        }
        params.set("query", query);
      }
      const response = await fetch(endpoint + "?" + params.toString());
      if (!response.ok) throw new Error("TMDB request failed");
      const data = await response.json();
      setMovieResults((data.results || []).slice(0, 8).map(movie => ({
        id: movie.id,
        title: movie.title || movie.original_title || "Untitled",
        originalTitle: movie.original_title || movie.title || "",
        releaseDate: movie.release_date || "",
        year: movie.release_date ? movie.release_date.slice(0, 4) : "",
        language: movie.original_language || "",
        posterPath: movie.poster_path || null,
        posterUrl: movie.poster_path ? "https://image.tmdb.org/t/p/w342" + movie.poster_path : null
      })));
    } catch (error) {
      console.error(error);
      setMovieResults([]);
      setMovieSearchError("Movie search is temporarily unavailable.");
    } finally {
      setMovieSearching(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!movieSearchOpen || movieOther) return;
      searchMovies(movieQuery.trim() ? "search" : "recent", movieQuery.trim());
    }, movieQuery.trim() ? 350 : 0);
    return () => clearTimeout(timer);
  }, [movieQuery, movieSearchOpen, movieOther]);

  function selectMovie(movie) {
    setSelectedMovie(movie);
    setMovieName(movie.title);
    setMovieQuery(movie.title);
    setMovieOther(false);
    setMovieSearchOpen(false);
    setMovieSearchError("");
  }

  function selectOtherMovie() {
    setSelectedMovie(null);
    setMovieOther(true);
    setMovieSearchOpen(false);
    setMovieQuery(movieName);
  }

  function changeTicketCount(next) {
    const count = Math.max(1, Math.min(10, next));
    setTicketCount(count);
    setTickets(current => Array.from({ length: count }, (_, index) => current[index] || { ticketType: "Premium", seatType: "Normal", price: price || "0" }));
  }
  function updateTicket(index, field, value) {
    setTickets(current => current.map((ticket, i) => i === index ? { ...ticket, [field]: value } : ticket));
  }
  function resetCity(nextState) {
    const nextCities = citiesByState[nextState] || [];
    setStateName(nextState);
    setCity(nextCities[0] || "");
    const nextHalls = cinemaHallsByCity[nextCities[0]] || ["Other"];
    setCinemaHall(nextHalls[0] || "Other");
    setOtherHall("");
  }
  function resetHall(nextCity) {
    setCity(nextCity);
    const nextHalls = cinemaHallsByCity[nextCity] || ["Other"];
    setCinemaHall(nextHalls[0] || "Other");
    setOtherHall("");
  }
  function formattedShowDate() {
    if (!showDate) return "Show date";
    return new Date(showDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function formattedShowTime() {
    if (!showTime) return "Show time";
    return new Date("1970-01-01T" + showTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  async function postMovieListing() {
    if (!movieName.trim() || !stateName || !city || !hallDisplay || !showDate || !showTime || !language || !format) {
      alert("Please complete all required movie listing details.");
      return;
    }
    if (cinemaHall === "Other" && !otherHall.trim()) {
      alert("Please enter the cinema hall name.");
      return;
    }
    if (!tickets.length || tickets.some(ticket => !ticket.ticketType || !ticket.seatType || Number(ticket.price || 0) <= 0)) {
      alert("Please enter valid details and price for every ticket.");
      return;
    }
    if (samePrice && Number(price || 0) <= 0) {
      alert("Please enter a valid price per ticket.");
      return;
    }
    if (!supabase) {
      alert("Supabase is not connected. Please check your environment variables.");
      return;
    }

    setPosting(true);
    try {
      const payloadTickets = tickets.map(ticket => ({
        ticketType: ticket.ticketType,
        seatType: ticket.seatType,
        price: Number(samePrice ? price : ticket.price)
      }));

      const { data, error } = await supabase.functions.invoke("create-movie-listing", {
        body: {
          movieTmdbId: selectedMovie?.id ?? null,
          movieName: movieName.trim(),
          posterPath: selectedMovie?.posterPath ?? null,
          posterUrl: selectedMovie?.posterUrl ?? null,
          state: stateName,
          city,
          cinemaHall: hallDisplay,
          showDate,
          showTime,
          language,
          format,
          priceMode: samePrice ? "SAME" : "INDIVIDUAL",
          pricePerTicket: samePrice ? Number(price) : null,
          readyToBargain: bargain,
          description,
          tickets: payloadTickets
        }
      });

      if (error) {
        let functionPayload = null;
        try {
          if (error.context?.json) functionPayload = await error.context.json();
        } catch {}
        throw new Error(functionPayload?.message || error.message || "Listing could not be created.");
      }
      if (!data?.ok) throw new Error(data?.message || "Movie listing could not be created.");

      alert("Movie listing posted successfully!");
      onBack();
    } catch (error) {
      alert(error?.message || "Movie listing could not be posted. Please try again.");
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
        <UniversalSidebar activeNav="Create Listing" activeSub={activeSub} onNavigate={onNavigate || (label => label === "Home" && onBack?.())} onLogout={onLogout} />

        <section className="listing-main-column">
          <div className="listing-page-title"><h1>Create Movie Ticket Listing</h1><p>List your movie tickets and find genuine buyers.</p></div>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>1</span><div><h2>Movie & Theatre Details</h2><p>Enter movie, location and theatre information</p></div></div>
            <label className="modern-field movie-name-field"><span>Movie Name <i>*</i></span>
              <div className="movie-search-wrap">
                <div className="modern-input">
                  <Search size={16}/>
                  <input
                    value={movieQuery || movieName}
                    onFocus={() => { setMovieSearchOpen(true); if (!movieQuery && !movieOther) searchMovies("recent", ""); }}
                    onChange={e => {
                      const value = e.target.value;
                      setMovieQuery(value);
                      setMovieName(value);
                      setSelectedMovie(null);
                      setMovieOther(false);
                      setMovieSearchOpen(true);
                    }}
                    placeholder="Search movie name"
                    autoComplete="off"
                  />
                  {movieSearching && <span className="movie-search-spinner">...</span>}
                </div>
                {movieSearchOpen && !movieOther && (
                  <div className="movie-suggestions">
                    <div className="movie-suggestions-title">{movieQuery.trim() ? "Movie Search Results" : "Recently Released Movies"}</div>
                    {movieResults.map(movie => (
                      <button type="button" key={movie.id} onMouseDown={e=>e.preventDefault()} onClick={()=>selectMovie(movie)}>
                        {movie.posterUrl ? <img src={movie.posterUrl} alt="" /> : <span className="movie-suggestion-placeholder">🎬</span>}
                        <span className="movie-suggestion-info"><b>{movie.title}</b><small>{movie.year || "Release year unavailable"}{movie.language ? " • " + movie.language.toUpperCase() : ""}</small></span>
                      </button>
                    ))}
                    {!movieSearching && movieResults.length === 0 && <div className="movie-empty">{movieSearchError || "No movie found."}</div>}
                    <button type="button" className="movie-other-option" onMouseDown={e=>e.preventDefault()} onClick={selectOtherMovie}><span>＋</span><span><b>Other</b><small>Enter movie name manually</small></span></button>
                  </div>
                )}
              </div>
              {movieOther && <small className="movie-manual-note">Manual movie name selected. No poster will be attached unless you select a movie from the search.</small>}
            </label>
            <div className="movie-location-grid">
              <label className="modern-field"><span>State <i>*</i></span><select value={stateName} onChange={e=>resetCity(e.target.value)}><option value="">Select state</option>{states.map(state=><option key={state}>{state}</option>)}</select></label>
              <label className="modern-field"><span>City <i>*</i></span><select value={city} onChange={e=>resetHall(e.target.value)} disabled={!stateName}><option value="">Select city</option>{cities.map(item=><option key={item}>{item}</option>)}</select></label>
              <label className="modern-field"><span>Cinema Hall <i>*</i></span><select value={cinemaHall} onChange={e=>{setCinemaHall(e.target.value);if(e.target.value!=="Other")setOtherHall("");}} disabled={!city}><option value="">Select cinema hall</option>{halls.map(hall=><option key={hall}>{hall}</option>)}</select></label>
            </div>
            {cinemaHall === "Other" && <label className="modern-field other-hall-field"><span>Cinema Hall Name <i>*</i></span><div className="modern-input"><MapPin size={16}/><input value={otherHall} onChange={e=>setOtherHall(e.target.value)} placeholder="Enter cinema hall name" /></div></label>}
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>2</span><div><h2>Show Details</h2><p>Enter show date, time and format details</p></div></div>
            <div className="show-details-grid">
              <label className="modern-field"><span>Show Date <i>*</i></span><div className="modern-input"><input type="date" value={showDate} onChange={e=>setShowDate(e.target.value)} /><Ticket size={16}/></div></label>
              <label className="modern-field"><span>Show Time <i>*</i></span><div className="modern-input"><input type="time" value={showTime} onChange={e=>setShowTime(e.target.value)} /><span className="time-glyph">◷</span></div></label>
              <label className="modern-field"><span>Language <i>*</i></span><select value={language} onChange={e=>setLanguage(e.target.value)}><option>Hindi</option><option>English</option><option>Bengali</option><option>Tamil</option><option>Telugu</option><option>Malayalam</option><option>Kannada</option><option>Marathi</option><option>Gujarati</option><option>Punjabi</option><option>Other</option></select></label>
              <label className="modern-field"><span>Format <i>*</i></span><select value={format} onChange={e=>setFormat(e.target.value)}><option>2D</option><option>3D</option><option>IMAX</option><option>IMAX 3D</option><option>4DX</option><option>MX4D</option><option>ScreenX</option><option>Other</option></select></label>
            </div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head ticket-head"><span>3</span><div><h2>Ticket Details</h2><p>Add ticket information</p></div><div className="ticket-counter"><b>Number of Tickets</b><div><button onClick={()=>changeTicketCount(ticketCount-1)}>−</button><strong>{ticketCount}</strong><button onClick={()=>changeTicketCount(ticketCount+1)}>+</button></div></div></div>
            <div className="movie-ticket-list">
              {tickets.map((ticket,index)=>(
                <div className="movie-ticket-row" key={index}>
                  <div className="modern-ticket-number"><span>▦</span><b>Ticket {index+1}</b></div>
                  <label className="modern-field"><span>Ticket Type <i>*</i></span><select value={ticket.ticketType} onChange={e=>updateTicket(index,"ticketType",e.target.value)}><option>Premium</option><option>Normal</option><option>Recliner</option><option>Executive</option><option>VIP</option><option>Other</option></select></label>
                  <label className="modern-field"><span>Seat Type <i>*</i></span><select value={ticket.seatType} onChange={e=>updateTicket(index,"seatType",e.target.value)}><option>Normal</option><option>Premium</option><option>Recliner</option><option>Couple</option><option>Balcony</option><option>Other</option></select></label>
                  {!samePrice && <label className="modern-field"><span>Price <i>*</i></span><div className="price-input"><b>₹</b><input value={ticket.price} onChange={e=>updateTicket(index,"price",e.target.value.replace(/[^0-9]/g,""))}/></div></label>}
                  <button className="ticket-delete" aria-label={"Remove ticket "+(index+1)} onClick={()=>changeTicketCount(ticketCount-1)}>×</button>
                </div>
              ))}
            </div>
          </section>

          <section className="listing-modern-card">
            <div className="modern-section-head"><span>4</span><div><h2>Pricing & Preferences</h2><p>Set your pricing and additional preferences</p></div></div>
            <div className="movie-pricing-row">
              <label className={samePrice ? "modern-price-choice selected" : "modern-price-choice"}><input type="radio" checked={samePrice} onChange={()=>setSamePrice(true)}/><span><b>Same price for all tickets</b><small>All tickets will be listed at the same price</small></span></label>
              <label className={!samePrice ? "modern-price-choice selected" : "modern-price-choice"}><input type="radio" checked={!samePrice} onChange={()=>setSamePrice(false)}/><span><b>Different price for each ticket</b><small>Set individual prices for each ticket</small></span></label>
              {samePrice && <label className="modern-field movie-price-field"><span>Price per ticket <i>*</i></span><div className="price-input"><b>₹</b><input value={price} onChange={e=>setPrice(e.target.value.replace(/[^0-9]/g,""))}/></div></label>}
              <div className="bargain-control"><div><b>Ready to Bargain?</b><small>Buyers can send you offers</small></div><button className={bargain?"on":""} onClick={()=>setBargain(!bargain)}><span/></button></div>
            </div>
            {!samePrice && <div className="individual-price-list">{tickets.map((ticket,index)=><label className="modern-field" key={index}><span>Ticket {index+1} price <i>*</i></span><div className="price-input"><b>₹</b><input value={ticket.price} onChange={e=>updateTicket(index,"price",e.target.value.replace(/[^0-9]/g,""))}/></div></label>)}</div>}
            <div className="movie-total-price"><span>Total ticket value</span><b>₹ {totalPrice.toLocaleString("en-IN")}</b></div>
          </section>

          <section className="listing-modern-card additional-card">
            <div className="modern-section-head"><span>5</span><div><h2>Additional Information <em>(Optional)</em></h2><p>Add any extra details for buyers</p></div><small className="char-count">{description.length}/500</small></div>
            <label className="modern-field"><span>Description</span><textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={500}/></label>
            <div className="modern-actions"><button onClick={onBack}>Cancel</button><button className="modern-primary" onClick={postMovieListing} disabled={posting}>{posting ? "Posting..." : <>Post Listing <ArrowRight size={15}/></>}</button></div>
          </section>
        </section>

        <aside className="listing-right-column">
          <div className="preview-title"><span className="preview-brand-icon">C</span><div><b>Listing Preview</b><small>This is how your listing will appear to others</small></div></div>
          <div className="modern-preview-card movie-preview-card">
            <div className="movie-preview-image">{selectedMovie?.posterUrl ? <img src={selectedMovie.posterUrl} alt={selectedMovie.title} /> : <div className="movie-preview-placeholder"><span>🎬</span><b>{movieName || "Movie"}</b><small>{movieOther ? "Custom movie" : "Select a movie to show poster"}</small></div>}<span className="active-listing">Preview</span><button>Edit</button></div>
            <div className="preview-route-row"><div><h3>{movieName || "Movie Name"}</h3><p><MapPin size={12} /> &nbsp;{hallDisplay}, {city || "City"}</p><p>▣ &nbsp;{formattedShowDate()}</p><p>◷ &nbsp;{formattedShowTime()}</p></div><strong>₹{Number(samePrice ? price : (tickets[0]?.price || 0)).toLocaleString("en-IN")}<small>per ticket</small></strong></div>
            <div className="preview-pills"><span>{language}</span><span>{format}</span>{bargain&&<span className="bargain-pill">Bargain Available</span>}</div>
            <div className="preview-separator"/>
            <h4 className="preview-block-title">♢ &nbsp; Tickets</h4>
            <div className="preview-modern-tickets">{tickets.map((ticket,index)=><div className="preview-modern-ticket" key={index}><span className="preview-number">{index+1}</span><div><b>{ticket.ticketType}</b><section><small>{ticket.seatType}</small><small>₹{Number(samePrice ? price : ticket.price || 0).toLocaleString("en-IN")}</small></section></div></div>)}</div>
            <div className="preview-separator"/>
            <div className="about-listing"><h4>▣ &nbsp; About this listing</h4><p>{ticketCount} ticket{ticketCount===1?"":"s"} for {movieName || "this movie"} at {hallDisplay}. {language} {format}. Genuine buyers only.</p></div>
            <div className="preview-expiry"><b>◷ &nbsp; This listing will automatically expire at show time</b><small>{formattedShowDate()}, {formattedShowTime()}<br/>The listing will stop appearing after the show starts.</small></div>
            <button className="preview-post-button" onClick={postMovieListing} disabled={posting}>{posting ? "Posting..." : "Post Listing"}</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
