import { memo } from 'react';

function Hero() {
  return (
    <section className="hero" id="hero">
      <p className="hero-eyebrow">Парфюмерия на распив · 100% оригинал</p>
      <h1 className="hero-title">
        <span className="hero-title-brand">AROMA NAUR</span>
        <span className="hero-title-line">
          парфюмерный <em>бутик</em>
        </span>
      </h1>
      <p className="hero-sub">Более 1000 оригинальных ароматов. Попробуй перед покупкой и найди свой.</p>
      <div className="hero-cta">
        <a href="#catalog" className="btn-primary">
          Смотреть каталог
        </a>
        <a href="#how" className="btn-secondary">
          Как это работает
        </a>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="scroll-line" />
        <span>Вниз</span>
      </div>
    </section>
  );
}

export default memo(Hero);
