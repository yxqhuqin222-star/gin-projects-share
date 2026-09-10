"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./project-presentation.module.css";

export function ProjectGallery({ title, images, captions = [] }: { title: string; images: string[]; captions?: string[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const captionId = useId();
  const caption = (index: number) => captions[index] || `${title} · 展示图 ${index + 1}`;

  useEffect(() => {
    if (selected === null) return;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
    };
  }, [selected]);

  if (!images.length) return null;

  return (
    <section className={styles.gallery} aria-label="项目图片">
      {images.map((src, index) => (
        <figure key={`${src}-${index}`}>
          <button type="button" className={styles.imageButton} aria-label={`放大查看：${caption(index)}`}
            onClick={(event) => { trigger.current = event.currentTarget; setSelected(index); }}>
            <img src={src} alt={caption(index)} loading={index === 0 ? "eager" : "lazy"} />
            <span className={styles.zoomHint} aria-hidden="true">放大查看 ↗</span>
          </button>
          <figcaption>{caption(index)}</figcaption>
        </figure>
      ))}
      <dialog ref={dialog} className={styles.lightbox} aria-label="图片预览" aria-describedby={captionId}
        onClose={() => setSelected(null)}
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        {selected !== null ? (
          <div className={styles.lightboxContent}>
            <div className={styles.lightboxBar}>
              <p id={captionId}>{caption(selected)}</p>
              <button type="button" autoFocus onClick={() => dialog.current?.close()}>关闭图片 ×</button>
            </div>
            <img src={images[selected]} alt={caption(selected)} />
            <a href={images[selected]} target="_blank" rel="noreferrer">打开原图 ↗</a>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
