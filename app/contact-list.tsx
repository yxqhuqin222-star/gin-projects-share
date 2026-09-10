"use client";

import { useState } from "react";
import type { ContactLink } from "./site-data";

export function ContactList({ links }: { links: ContactLink[] }) {
  const [notice, setNotice] = useState("");

  async function copyWechat(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("微信号已复制。");
    } catch {
      setNotice("未能复制，请选中上方微信号手动复制。");
    }
  }

  return <div className="contact-list">
    {links.map((link) => link.label.includes("微信") ? (
      <div className="contact-wechat" key={link.id}>
        <span>{link.label}</span>
        <strong>{link.value}</strong>
        <div className="contact-actions">
          <button type="button" onClick={() => copyWechat(link.value)}>复制微信号</button>
          {link.href.startsWith("tel:") ? <a href={link.href}>拨打电话</a> : null}
        </div>
      </div>
    ) : (
      <a href={link.href} key={link.id}
        target={link.href.startsWith("http") ? "_blank" : undefined}
        rel={link.href.startsWith("http") ? "noreferrer" : undefined}>
        <span>{link.label}</span><strong>{link.value}</strong>
      </a>
    ))}
    <p className="contact-notice" role="status">{notice}</p>
  </div>;
}
