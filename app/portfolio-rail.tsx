"use client";

import Link from "next/link";
import { useState } from "react";

type RailItem = {
  id: string;
  label: string;
};

function RailIcon({ id }: { id: string }) {
  if (id === "home") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 11.4 12 5l8 6.4V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.6Z" />
      </svg>
    );
  }

  if (id === "work") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7h3.5A1.5 1.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9A1.5 1.5 0 0 1 4.5 7H8Zm2 0h4V6h-4v1Zm-5 5.2V17a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4.8A13.3 13.3 0 0 1 12 14a13.3 13.3 0 0 1-7-1.8Z" />
      </svg>
    );
  }

  if (id === "skills-tools") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13.3 3.2 14 6a7.4 7.4 0 0 1 1.4.6l2.5-1.5 1.9 1.9-1.5 2.5c.3.4.5.9.6 1.4l2.8.7v2.8l-2.8.7a7.4 7.4 0 0 1-.6 1.4l1.5 2.5-1.9 1.9-2.5-1.5c-.4.3-.9.5-1.4.6l-.7 2.8h-2.6L10 20a7.4 7.4 0 0 1-1.4-.6l-2.5 1.5-1.9-1.9 1.5-2.5a7.4 7.4 0 0 1-.6-1.4l-2.8-.7v-2.8l2.8-.7c.1-.5.3-1 .6-1.4L4.2 7l1.9-1.9 2.5 1.5A7.4 7.4 0 0 1 10 6l.7-2.8h2.6ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      </svg>
    );
  }

  if (id === "personal-efficiency") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 21s-7.5-4.5-9.3-9.3C1.4 8.1 3.4 5 6.7 5c2 0 3.4 1 4.3 2.3C11.9 6 13.3 5 15.3 5c3.3 0 5.3 3.1 4 6.7C17.5 16.5 12 21 12 21Z" />
      </svg>
    );
  }

  if (id === "writing") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 4h10.5L19 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm9 1.8V9h3.2L14 5.8ZM7 12h10v2H7v-2Zm0 4h7v2H7v-2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.6 3.8 9.8 7c.5.5.5 1.3.1 1.9l-1.1 1.5a14 14 0 0 0 4.8 4.8l1.5-1.1c.6-.4 1.4-.4 1.9.1l3.2 3.2c.6.6.6 1.6-.1 2.2A5.2 5.2 0 0 1 16.6 21C9.1 21 3 14.9 3 7.4c0-1.3.5-2.6 1.4-3.5.6-.7 1.6-.7 2.2-.1Z" />
    </svg>
  );
}

export function PortfolioRail({ items }: { items: readonly RailItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <aside className="portfolio-rail" aria-label="站点导航">
      <Link
        className={`rail-home ${activeId === "home" ? "active" : ""}`}
        href="/"
        aria-label="Gin Home"
        onClick={() => setActiveId("home")}
      >
        <span className="rail-icon">
          <RailIcon id="home" />
        </span>
        <span className="rail-label">首页</span>
      </Link>
      <nav>
        {items.map((item) => (
          <a
            className={activeId === item.id ? "active" : ""}
            href={`#${item.id}`}
            key={item.id}
            aria-label={item.label}
            onClick={() => setActiveId(item.id)}
          >
            <span className="rail-icon">
              <RailIcon id={item.id} />
            </span>
            <span className="rail-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
