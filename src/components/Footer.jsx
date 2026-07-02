import { memo } from 'react';
import { InstagramIcon, WhatsAppIcon } from './SocialIcons';

function Footer({ onOpenAdmin }) {
  const socials = [
    {
      label: 'WhatsApp',
      href: 'https://wa.me/+79659671547',
      icon: <WhatsAppIcon />,
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com/aroma_naur',
      icon: <InstagramIcon />,
    },
  ];

  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <a href="#hero" className="logo">
            AROMA <span>NAUR</span>
          </a>
          <p>
            Оригинальная парфюмерия на распив.
            <br />
            100% гарантия качества.
          </p>
        </div>
        <div className="footer-col">
          <h4>Навигация</h4>
          <a href="#catalog">Каталог</a>
          <a href="#how">Как это работает</a>
          <a href="#about">О нас</a>
        </div>
        <div className="footer-col contacts-col">
          <h4>Контакты</h4>
          <div className="footer-contacts">
            {socials.map(({ label, href, icon }) => (
              <a
                key={label}
                className="footer-social-link"
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-mobile-admin">
        <button type="button" className="footer-admin-btn" onClick={onOpenAdmin}>
          Панель управления
        </button>
      </div>
      <div className="footer-bottom">
        <span>© 2025 AROMA NAUR. Все права защищены.</span>
        <span>Доставка СДЕК по всей России</span>
      </div>
    </footer>
  );
}

export default memo(Footer);
