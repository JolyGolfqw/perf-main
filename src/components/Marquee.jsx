import { memo } from 'react';

function Marquee({ brands }) {
  const items = [...brands, ...brands];

  return (
    <section className="marquee-wrap" aria-label="Бренды">
      <div className="marquee-track">
        {items.map((brand, index) => (
          <span className="marquee-item" key={`${brand}-${index}`}>
            {brand}
            {index % brands.length !== brands.length - 1 ? <span className="marquee-sep">◆</span> : null}
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(Marquee);
