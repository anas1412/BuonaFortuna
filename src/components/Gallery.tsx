import { useState } from 'react';

/**
 * Product photos. Server-renders the cover so the page is complete without
 * JavaScript; the thumbnails become clickable once the island hydrates.
 */
export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={current} alt={alt} width={800} height={1000} decoding="async" />
      </div>
      {images.length > 1 && (
        <div className="gallery__thumbs" role="list">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="listitem"
              className={`gallery__thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1} sur ${images.length}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <img src={src} alt="" width={120} height={150} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
