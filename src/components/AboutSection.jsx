import { memo } from 'react';

function AboutSection() {
  return (
    <section className="section" id="about">
      <div className="about-inner">
        <div className="about-visual">◈
          {/* <img src="/logo.webp" alt="" /> */}
        </div>
        <div>
          <p className="section-label">О проекте</p>
          <h2 className="section-title">
            Парфюм без <em>переплат</em>
          </h2>
          <div className="about-text" style={{ marginTop: 24 }}>
            <p>
              AROMA NAUR — это магазин оригинальных ароматов на распив. Мы работаем напрямую с официальными
              дистрибьюторами и предоставляем сертификаты на каждую партию.
            </p>
            <p>
              Покупать флакон за 15 000 ₽, чтобы понять, что аромат тебе не подходит, — дорого. Мы даём возможность
              попробовать любой аромат за несколько сотен рублей.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-item">
              <div className="stat-num">1000+</div>
              <div className="stat-label">Ароматов в каталоге</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">5000+</div>
              <div className="stat-label">Довольных клиентов</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Оригинальная парфюмерия</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">от 5 мл</div>
              <div className="stat-label">Минимальный объём</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(AboutSection);
