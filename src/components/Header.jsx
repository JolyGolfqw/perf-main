import { memo } from 'react';

function Header({ mobileNavOpen, navScrolled, onToggleMobileNav, onOpenAdmin, onCloseMobileNav }) {
  return (
    <header className={`site-nav ${navScrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="logo" onClick={onCloseMobileNav}>
        AROMA <span>NAUR</span>
      </a>

      <nav className="nav-links" aria-label="Основная навигация">
        <a href="#catalog">Каталог</a>
        <a href="#how">Как это работает</a>
        <a href="#about">О нас</a>
      </nav>

      <div className="nav-right">
        <button type="button" className="nav-admin-btn" onClick={onOpenAdmin}>
          Панель управления
        </button>
        <button
          className={`hamburger ${mobileNavOpen ? 'active' : ''}`}
          type="button"
          aria-label="Меню"
          aria-expanded={mobileNavOpen}
          aria-controls="mobileNav"
          onClick={onToggleMobileNav}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default memo(Header);
