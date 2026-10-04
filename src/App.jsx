import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Users, Ticket, MapPin, MessageCircle, Mail, LockKeyhole, ShieldCheck, Music2, Trophy, PartyPopper, Heart, ChevronDown, Sparkles } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

const eventCards = [
  { title: "Concerts", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=85", icon: Music2 },
  { title: "Cricket", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=700&q=85", icon: Trophy },
  { title: "Events", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=85", icon: PartyPopper },
  { title: "Meet People", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85", icon: Users },
];

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function App() {
  const [mode, setMode] = useState("login");
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

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (mode === "signup" && password !== confirmPassword) {
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
      if (mode === "signup") {
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
        redirectTo: window.location.origin,
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

  return (
    <main className={`auth-layout ${mode === "signup" ? "signup-mode" : "login-mode"}`}>
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
          <span>{mode === "login" ? "New to ConnectHub?" : "Already have an account?"}</span>
          <button className="link-button" type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </div>

        <div className={`auth-card ${mode === "signup" ? "auth-card-signup" : ""}`}>
          <div className="mobile-brand brand"><span className="brand-symbol"><Users size={20} fill="currentColor" /></span><span>ConnectHub</span></div>
          <div className="form-heading">
            <span className="form-kicker">{mode === "login" ? "WELCOME BACK" : "YOUR NEXT CHAPTER STARTS HERE"}</span>
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>{mode === "login" ? "Log in to continue your journey." : "Join ConnectHub and start connecting today."}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate={false}>
            {mode === "signup" && <div className="field-grid">
              <div className="field-group"><label htmlFor="fullName">Full name</label><div className="input-wrap"><Users size={16} /><input id="fullName" name="fullName" autoComplete="name" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={80} /></div></div>
              <div className="field-group"><label htmlFor="signupEmail">Email address</label><div className="input-wrap"><Mail size={16} /><input id="signupEmail" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>
              <div className="field-group"><label htmlFor="mobile">Mobile number</label><div className="input-wrap"><span className="country-code">🇮🇳 +91</span><input id="mobile" name="mobile" type="tel" autoComplete="tel-national" inputMode="numeric" placeholder="Enter mobile number" value={mobile} onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} required minLength={10} maxLength={10} /></div></div>
              <div className="field-group"><label htmlFor="state">State / Union Territory</label><div className="select-wrap"><MapPin size={16} /><select id="state" value={stateName} onChange={e => setStateName(e.target.value)} required><option value="">Select your state</option>{states.map(item => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={15} /></div></div>
              <div className="field-group field-full"><label htmlFor="city">City</label><div className="input-wrap"><MapPin size={16} /><input id="city" name="city" placeholder="Enter your city" value={city} onChange={e => setCity(e.target.value)} required /></div></div>
            </div>}

            {mode === "login" && <div className="field-group"><label htmlFor="email">Email address</label><div className="input-wrap"><Mail size={17} /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>}

            <div className={`field-group ${mode === "signup" ? "field-grid-password" : ""}`}>
              <div className="label-row"><label htmlFor="password">Password</label>{mode === "login" && <button className="link-button tiny" type="button" onClick={handleForgotPassword}>Forgot password?</button>}</div>
              <div className="input-wrap password-wrap"><LockKeyhole size={16} /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "login" ? "Enter your password" : "Create a password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            </div>

            {mode === "signup" && <div className="field-group"><label htmlFor="confirmPassword">Confirm password</label><div className="input-wrap password-wrap"><LockKeyhole size={16} /><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} /><button type="button" className="password-toggle" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirmPassword(v => !v)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>}

            {mode === "login" && <label className="remember-row"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /><span>Remember me</span></label>}
            {mode === "signup" && <label className="terms-row"><input type="checkbox" required /><span>I agree to the <a href="#terms" onClick={e => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={e => e.preventDefault()}>Privacy Policy</a></span></label>}

            {message && <div className={`form-message ${messageType}`} role="status">{message}</div>}
            <button className="submit-button" type="submit" disabled={loading}><span>{loading ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Log In" : "Create Account")}</span>{!loading && <ArrowRight size={18} />}</button>
          </form>

          {mode === "login" && <><div className="divider-label"><span />or continue with<span /></div><div className="social-row"><button type="button" className="social-button" onClick={() => { setMessageType("info"); setMessage("Google sign-in can be enabled when we configure the provider in Supabase."); }}><b className="google-g">G</b> Google</button><button type="button" className="social-button" onClick={() => { setMessageType("info"); setMessage("Apple sign-in can be enabled when we configure the provider in Supabase."); }}><span className="apple-mark">●</span> Apple</button></div></>}
          {mode === "signup" && <p className="signin-prompt">Already have an account? <button type="button" className="link-button" onClick={() => switchMode("login")}>Log in</button></p>}
        </div>
        <footer className="form-footer"><span>© 2026 ConnectHub</span><span><ShieldCheck size={14} /> Your connections start safely</span></footer>
      </section>
    </main>
  );
}
