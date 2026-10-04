import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Ticket, ShieldCheck, CircleHelp } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

// Login page only for this first step. We will build Sign Up separately next.
export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // This function sends the email/password to Supabase Auth.
  // Supabase checks the credentials; we never save the raw password ourselves.
  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessageType("error");
      setMessage(
        "Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setMessageType("success");
    setMessage("You are signed in successfully. Account dashboard is the next step.");
  }

  return (
    <main className="page-shell">
      {/* Left panel: product introduction and reassurance. */}
      <section className="intro-panel" aria-label="About Ticketly">
        <a className="brand" href="/" aria-label="Ticketly home">
          <span className="brand-mark"><Ticket size={22} strokeWidth={2.4} /></span>
          <span>ticketly<span className="brand-period">.</span></span>
        </a>

        <div className="intro-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT EXPERIENCE STARTS HERE</span>
          <h1>Good times<br />shouldn't go<br /><span>to waste.</span></h1>
          <p>
            Find someone who can use the ticket you can’t. Discover events in your city
            and connect directly with other fans.
          </p>

          <div className="event-preview" aria-label="Example event listing">
            <div className="event-icon">♫</div>
            <div className="event-details">
              <strong>Your next great memory</strong>
              <span>Movies · Live sports · More</span>
            </div>
            <span className="event-arrow"><ArrowRight size={18} /></span>
          </div>
        </div>

        <div className="intro-footer">
          <ShieldCheck size={17} />
          <span>Connect with people. Make plans happen.</span>
        </div>
        <div className="decor decor-one" />
        <div className="decor decor-two" />
      </section>

      {/* Right panel: accessible login form. */}
      <section className="form-panel">
        <div className="form-topline">
          <span>New to Ticketly?</span>
          <button className="text-button" type="button" onClick={() => {
            setMessageType("info");
            setMessage("Sign Up is the next step we will build after this login page.");
          }}>Create account</button>
        </div>

        <div className="login-card">
          <div className="mobile-brand brand">
            <span className="brand-mark"><Ticket size={20} strokeWidth={2.4} /></span>
            <span>ticketly<span className="brand-period">.</span></span>
          </div>

          <div className="form-heading">
            <span className="form-kicker">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details below to continue.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="text-button small"
                  onClick={() => {
                    setMessageType("info");
                    setMessage("Password reset can be added after the core login and sign-up flow.");
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {message && (
              <div className={`form-message ${messageType}`} role="status">
                {message}
              </div>
            )}

            <button className="submit-button" type="submit" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="secure-note">
            <ShieldCheck size={16} />
            <span>Your sign-in is securely handled by Supabase Auth.</span>
          </div>
        </div>

        <footer className="form-footer">
          <span>© 2026 Ticketly</span>
          <span className="footer-help"><CircleHelp size={14} /> Need help?</span>
        </footer>
      </section>
    </main>
  );
}