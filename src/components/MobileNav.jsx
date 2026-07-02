import { memo } from 'react';

function MobileNav({ open, onClose }) {
  return (
    <div className={`mobile-nav ${open ? 'open' : ''}`} id="mobileNav">
      <button className="mobile-nav-close" type="button" onClick={onClose} aria-label="Закрыть">
        ✕
      </button>
      <a href="#catalog" onClick={onClose}>
        Каталог
      </a>
      <a href="#how" onClick={onClose}>
        Как это работает
      </a>
      <a href="#about" onClick={onClose}>
        О нас
      </a>
    </div>
  );
}

export default memo(MobileNav);
