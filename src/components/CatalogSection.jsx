import { memo } from 'react';

const ProductCard = memo(function ProductCard({ product, onSelect }) {
  return (
    <button type="button" className="product-card" onClick={() => onSelect(product)}>
      <div className="product-img">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            className="product-real-img"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="product-img-inner" style={{ display: product.img ? 'none' : 'flex' }}>
          {product.brand?.slice(0, 1) || '◈'}
        </div>
        <div className="product-fill" />
        {product.badge ? <div className={`product-badge ${product.badge}`}>{product.badge === 'new' ? 'Новинка' : 'Хит'}</div> : null}
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-notes">{product.notesText || product.notes}</div>
        <div className="product-footer">
          <div className="product-price">
            от {product.price * 10} ₽ <span>/ 10 мл</span>
          </div>
        </div>
      </div>
    </button>
  );
});

const CatalogSkeletonCard = memo(function CatalogSkeletonCard() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-img skeleton-box skeleton-img" />
      <div className="product-info">
        <div className="skeleton-line skeleton-brand" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-title short" />
        <div className="skeleton-line skeleton-notes" />
        <div className="product-footer">
          <div className="skeleton-line skeleton-price" />
        </div>
      </div>
    </div>
  );
});

const Pagination = memo(function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  const visiblePages = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i += 1) {
    visiblePages.push(i);
  }

  return (
    <div className="pagination">
      <button type="button" className="pagination-btn" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
        ←
      </button>
      {visiblePages[0] > 1 ? (
        <>
          <button type="button" className={`pagination-btn ${page === 1 ? 'active' : ''}`} onClick={() => onPageChange(1)}>
            1
          </button>
          {visiblePages[0] > 2 ? <span className="pagination-dots">…</span> : null}
        </>
      ) : null}
      {visiblePages.map((n) => (
        <button
          key={n}
          type="button"
          className={`pagination-btn ${page === n ? 'active' : ''}`}
          onClick={() => onPageChange(n)}
        >
          {n}
        </button>
      ))}
      {visiblePages[visiblePages.length - 1] < totalPages ? (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 ? <span className="pagination-dots">…</span> : null}
          <button type="button" className={`pagination-btn ${page === totalPages ? 'active' : ''}`} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      ) : null}
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        →
      </button>
    </div>
  );
});

function CatalogSection({
  sectionRef,
  categories,
  products,
  total,
  page,
  limit,
  search,
  category,
  loading,
  error,
  onSelectProduct,
  onCategoryChange,
  onSearchChange,
  onPageChange,
}) {
  const handleSearch = (event) => {
    onSearchChange(event.target.value);
  };

  const skeletonCount = Math.max(4, Math.min(limit || 12, 8));

  return (
    <section className="section" id="catalog" ref={sectionRef}>
      <p className="section-label">Коллекция</p>
      <h2 className="section-title">
        Найди <em>свой</em> аромат
      </h2>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span>Поиск</span>
          <input type="search" value={search} onChange={handleSearch} placeholder="Бренд, название, описание..." />
        </label>

        <div className="filters" role="tablist" aria-label="Фильтры каталога">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`filter-btn ${category === key ? 'active' : ''}`}
              onClick={() => onCategoryChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="section-state error">{error}</div> : null}

      <div className="catalog-grid">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, index) => <CatalogSkeletonCard key={`catalog-skeleton-${index}`} />)
          : products.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}
      </div>

      {!loading && !error && products.length === 0 ? <div className="section-state">Ничего не найдено.</div> : null}

      <div className="catalog-footer">
        <div className="catalog-meta">
          Показано {products.length} из {total}
        </div>
        <Pagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      </div>
    </section>
  );
}

export default memo(CatalogSection);
