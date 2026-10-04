import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Ticket, ShieldCheck, CircleHelp } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

export default function App() {
  // mode decides whether this form logs an existing user in or creates an account.
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // Keep the form message and mode in sync when switching between login and signup.
  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessageType("error");
      setMessage("Supabase is not connected. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // Supabase Auth securely stores credentials; the raw password is never saved in our own table.
        // full_name is saved as Auth user metadata for now. We can add a separate profiles table next.
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) throw error;

        setMessageType("success");
        setMessage(
          data.session
            ? "Account created successfully! You can now continue to Ticketly."
            : "Account created! Check your email for a confirmation link, then sign in."
        );
      } else {
        // Supabase verifies the email/password pair for an existing account.
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessageType("success");
        setMessage("You are signed in successfully. Your dashboard is the next step.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

      {/* Right panel: the same form layout is reused for login and account creation. */}
      <section className="form-panel">
        <div className="form-topline">
          <span>{mode === "login" ? "New to Ticketly?" : "Already have an account?"}</span>
          <button
            className="text-button"
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>

        <div className="login-card">
          <div className="mobile-brand brand">
            <span className="brand-mark"><Ticket size={20} strokeWidth={2.4} /></span>
            <span>ticketly<span className="brand-period">.</span></span>
          </div>

          <div className="form-heading">
            <span className="form-kicker">{mode === "login" ? "WELCOME BACK" : "JOIN TICKETLY"}</span>
            <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
            <p>
              {mode === "login"
                ? "Enter your details below to continue."
                : "Create an account to discover and list tickets."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="field-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  maxLength={80}
                />
              </div>
            )}

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
                {mode === "login" && (
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
                )}
              </div>
              <div className="password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "login" ? "Enter your password" : "Create a password (at least 6 characters)"}
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
              <span>
                {loading
                  ? (mode === "login" ? "Signing in..." : "Creating account...")
                  : (mode === "login" ? "Sign in" : "Create account")}
              </span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="secure-note">
            <ShieldCheck size={16} />
            <span>Your account is securely handled by Supabase Auth.</span>
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
