import { Heart, HeartHandshake, Home, LogOut, MessageCircle, Plus, Settings, Ticket, UserRound, Users } from "lucide-react";

const listingSubItems = [
  ["TRAIN", "Train Ticket"],
  ["MOVIE", "Movie Ticket"],
  ["CONCERT", "Concert Ticket"],
];

const items = [
  ["Home", Home],
  ["Find Tickets", Ticket],
  ["Create Listing", Plus],
  ["Find People", Users],
  ["Communities", HeartHandshake],
  ["Messages", MessageCircle],
  ["My Listings", Ticket],
  ["Favorites", Heart],
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
            {label === "Create Listing" && activeNav === "Create Listing" && (
              <div className="universal-listing-subnav">
                {listingSubItems.map(([value, subLabel]) => (
                  <button
                    type="button"
                    key={value}
                    className={activeSub === value ? "universal-listing-subitem active" : "universal-listing-subitem"}
                    onClick={() => go(value === "TRAIN" ? "Create Listing" : value === "MOVIE" ? "Movie Ticket" : "Concert Ticket")}
                  >
                    <span className="universal-listing-dot" />
                    {subLabel}
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
