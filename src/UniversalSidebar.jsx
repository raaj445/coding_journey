import { Bookmark, HeartHandshake, Home, LogOut, MessageCircle, Plus, Settings, Ticket, UserRound, Users } from "lucide-react";

const items = [
  ["Home", Home],
  ["Find Tickets", Ticket],
  ["Create Listing", Plus],
  ["Find People", Users],
  ["Communities", HeartHandshake],
  ["Messages", MessageCircle],
  ["My Listings", Ticket],
  ["Bookmarks", Bookmark],
  ["Profile", UserRound],
  ["Settings", Settings],
];

export default function UniversalSidebar({ activeNav = "", activeSub = "", onNavigate, onLogout }) {
  const go = label => onNavigate?.(label);
  return (
    <aside className="universal-sidebar">
      <nav>
        {items.map(([label, Icon]) => (
          <div className="universal-nav-group" key={label}>
            <button
              type="button"
              className={activeNav === label ? "universal-side-nav active" : "universal-side-nav"}
              onClick={() => go(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
            {label === "Create Listing" && (
              <div className="universal-listing-subnav">
                {[
                  ["TRAIN", "Train Ticket"],
                  ["MOVIE", "Movie Ticket"],
                  ["CONCERT", "Concert Ticket"],
                ].map(([value, text]) => (
                  <button
                    type="button"
                    key={value}
                    className={activeSub === value ? "universal-subnav-item active" : "universal-subnav-item"}
                    onClick={() => go(value === "TRAIN" ? "Create Listing" : value === "MOVIE" ? "Movie Ticket" : "Concert Ticket")}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      {onLogout && (
        <button type="button" className="universal-side-nav logout-nav" onClick={onLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      )}
    </aside>
  );
}
