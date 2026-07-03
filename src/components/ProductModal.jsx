import { memo, useEffect, useMemo, useState } from 'react';
import { InstagramIcon, WhatsAppIcon } from './SocialIcons';

function ProductModal({ product, onClose }) {
  const availableVolumes = useMemo(
    () => product?.availableVolumes || product?.available_volumes || [5, 10, 30],
    [product?.availableVolumes, product?.available_volumes],
  );
  const unitPrice = Number(product?.price_per_ml ?? product?.price ?? 0);
  const [selectedVolume, setSelectedVolume] = useState(availableVolumes[0] || 10);

  useEffect(() => {
    setSelectedVolume(availableVolumes[0] || 10);
  }, [availableVolumes]);

  const selectedPrice = Math.round(unitPrice * selectedVolume);

  if (!product) return null;

  const contactLinks = [
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
    <div className="modal-overlay open" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-x" type="button" onClick={onClose}>
          ✕
        </button>
        <div className="modal-inner">
          <div className="modal-media">
            {product.img ? (
              <img
                src={product.img}
                alt={product.name}
                className="modal-image"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  const fallback = event.currentTarget.parentElement?.querySelector('.modal-fallback');
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="modal-fallback" style={{ display: product.img ? 'none' : 'flex' }}>
              {product.brand?.slice(0, 1) || '◈'}
            </div>
          </div>
          <div className="modal-content">
            <div className="modal-brand">{product.brand}</div>
            <div className="modal-title">{product.name}</div>
            <div className="modal-notes">
              {product.description || product.desc}
              <br />
              <br />
              <em>{product.notesText || product.notes}</em>
            </div>
            <div className="modal-volumes" aria-label="Доступные объёмы">
              {availableVolumes.map((volume) => (
                <button
                  type="button"
                  className={`vol-chip ${selectedVolume === volume ? 'active' : ''}`}
                  key={volume}
                  onClick={() => setSelectedVolume(volume)}
                  aria-pressed={selectedVolume === volume}
                >
                  {volume} мл
                </button>
              ))}
            </div>
            <div className="modal-price">
              от {selectedPrice} ₽ <span>/ {selectedVolume} мл</span>
            </div>
            <div className="modal-socials">
              <div className="modal-socials-title">Связаться</div>
              <div className="modal-socials-row">
                {contactLinks.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    className="modal-social-link"
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
        </div>
      </div>
    </div>
  );
}

export default memo(ProductModal);
