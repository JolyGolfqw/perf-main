import { memo } from 'react';

function HowSection() {
  return (
    <section className="section how-section" id="how">
      <p className="section-label">Просто</p>
      <h2 className="section-title">
        Как это <em>работает</em>
      </h2>

      <div className="how-grid">
        <div className="how-item">
          <div className="how-num">01</div>
          <div className="how-title">Выбери аромат</div>
          <p className="how-text">
            Просматривай каталог из 1000+ оригинальных ароматов. Фильтруй по бренду, категории или настроению.
          </p>
        </div>
        <div className="how-item">
          <div className="how-num">02</div>
          <div className="how-title">Выбери объём</div>
          <p className="how-text">Доступны объёмы от 5 мл. Попробуй несколько ароматов или возьми любимый побольше.</p>
        </div>
        <div className="how-item">
          <div className="how-num">03</div>
          <div className="how-title">Свяжись с нами</div>
          <p className="how-text">Свяжись с нами в Instagram или WhatsApp. Доставка СДЕК по всей России.</p>
        </div>
        <div className="how-item">
          <div className="how-num">04</div>
          <div className="how-title">Получи и влюбись</div>
          <p className="how-text">Всё запаяно и защищено от утечек. Аромат точно такой же, как в оригинальном флаконе.</p>
        </div>
      </div>
    </section>
  );
}

export default memo(HowSection);
