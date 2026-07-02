import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createParfumeFormPayload, productToForm, resolveParfumeId } from '../lib/parfume';

const emptyForm = {
  name: '',
  description: '',
  brand: '',
  category: 'unisex',
  notes: '',
  price_per_ml: '',
  available_volumes: '5, 10, 30',
  badge: '',
  is_active: true,
  imageFile: null,
  imageUrl: '',
  originalImageUrl: '',
  imagePreview: '',
};

const ProductRow = memo(function ProductRow({ product, categoryLabel, onBeginEdit, onDelete }) {
  const productId = resolveParfumeId(product);

  return (
    <div className="table-row">
      <div>
        {product.img ? (
          <img src={product.img} alt={product.name} className="table-thumb" />
        ) : (
          <div className="table-thumb-emoji table-thumb-empty">Нет фото</div>
        )}
      </div>
      <div>
        <div className="table-name">{product.name}</div>
      </div>
      <div>
        <div className="table-brand">{product.brand}</div>
      </div>
      <div>
        <span className="table-cat">{categoryLabel}</span>
      </div>
      <div className="table-price">{product.price} ₽</div>
      <div className="admin-row-actions">
        {product.badge ? (
          <span className={`table-badge ${product.badge}`}>{product.badge === 'new' ? 'new' : 'hit'}</span>
        ) : (
          <span className="table-badge none">—</span>
        )}
        <button type="button" className="edit-btn" onClick={() => onBeginEdit(product)}>
          Редактировать
        </button>
        <button type="button" className="delete-btn" onClick={() => onDelete(product)}>
          Удалить
        </button>
      </div>
    </div>
  );
});

const ConfirmDeleteModal = memo(function ConfirmDeleteModal({ product, onCancel, onConfirm }) {
  if (!product) return null;
  const title = product.name || product.brand || `ID ${resolveParfumeId(product)}`;

  return (
    <div className="confirm-overlay" role="presentation" onClick={onCancel}>
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-label="Подтверждение удаления" onClick={(event) => event.stopPropagation()}>
        <p className="confirm-kicker">Удаление товара</p>
        <h3 className="confirm-title">Удалить "{title}"?</h3>
        <p className="confirm-text">
          Товар будет удалён из каталога без возможности восстановления.
        </p>
        <div className="confirm-actions">
          <button type="button" className="btn-reset" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="delete-btn danger" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
});

function AdminPanel({
  token,
  loginDefaults,
  catalog,
  categories,
  loading,
  error,
  authLoading,
  authError,
  onClose,
  onLogin,
  onLogout,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}) {
  const [loginForm, setLoginForm] = useState(loginDefaults);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const imageFileRef = useRef(null);
  const imagePreviewRef = useRef('');
  const formTitleRef = useRef(null);

  const brandCount = useMemo(() => new Set(catalog.map((product) => product.brand)).size, [catalog]);
  const newCount = useMemo(() => catalog.filter((product) => product.badge === 'new').length, [catalog]);

  useEffect(() => {
    imageFileRef.current = form.imageFile;
    imagePreviewRef.current = form.imagePreview || '';
  }, [form.imageFile, form.imagePreview]);

  useEffect(() => {
    return () => {
      if (form.imageFile && form.imagePreview) {
        URL.revokeObjectURL(form.imagePreview);
      }
    };
  }, [form.imageFile, form.imagePreview]);

  const resetForm = useCallback(() => {
    if (imageFileRef.current && imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current);
    }
    setForm(emptyForm);
    setEditingId(null);
    setSubmitError('');
  }, []);

  const beginEdit = useCallback((product) => {
    resetForm();
    setEditingId(resolveParfumeId(product));
    setForm({
      ...productToForm(product),
      originalImageUrl: product.image_url || product.img || '',
      imagePreview: product.image_url || product.img || '',
    });
    requestAnimationFrame(() => {
      formTitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [resetForm]);

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = createParfumeFormPayload(form);
    if (!editingId && !payload.imageFile && !payload.image_url) {
      setSubmitError('Выбери картинку товара');
      return;
    }
    if (!payload.available_volumes.length) {
      setSubmitError('Укажи хотя бы один объём');
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    try {
      if (editingId) {
        await onUpdateProduct(editingId, payload);
      } else {
        await onCreateProduct(payload);
      }
      resetForm();
    } catch (error) {
      setSubmitError(error.message || 'Не удалось сохранить товар');
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((product) => {
    setSubmitError('');
    setPendingDelete(product);
  }, []);

  const handleDelete = useCallback(async (id) => {
    setSubmitError('');
    try {
      await onDeleteProduct(id);
      if (editingId === id) {
        resetForm();
      }
      setPendingDelete(null);
    } catch (error) {
      setSubmitError(error.message || 'Не удалось удалить товар');
    }
  }, [editingId, onDeleteProduct, resetForm]);

  const handleLoginSubmit = useCallback(async (event) => {
    event.preventDefault();
    try {
      await onLogin(loginForm.email, loginForm.password);
    } catch {
      // Error is surfaced in the parent auth state.
    }
  }, [loginForm.email, loginForm.password, onLogin]);

  const handleImageChange = useCallback((event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setForm((current) => {
        if (current.imageFile && current.imagePreview) {
          URL.revokeObjectURL(current.imagePreview);
        }
        return {
          ...current,
          imageFile: null,
          imagePreview: current.originalImageUrl || '',
          imageUrl: current.originalImageUrl || '',
        };
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setForm((current) => {
      if (current.imageFile && current.imagePreview) {
        URL.revokeObjectURL(current.imagePreview);
      }
      return { ...current, imageFile: file, imagePreview: preview };
    });
  }, []);

  const handleToggleActive = useCallback((event) => {
    setForm((current) => ({ ...current, is_active: event.target.checked }));
  }, []);

  if (!token) {
    return (
      <div className="admin-panel" role="dialog" aria-modal="true" aria-label="Панель управления">
        <div className="admin-nav">
          <h1>
            AROMA NAUR <span>Admin</span>
          </h1>
          <button className="admin-close-btn" type="button" onClick={onClose}>
            ← Вернуться на сайт
          </button>
        </div>

        <div className="admin-body">
          <div className="admin-login-card">
            <p className="section-label">Авторизация</p>
            <h2 className="admin-section-title">Вход в админку</h2>
            <form className="admin-login-form" onSubmit={handleLoginSubmit}>
              <label className="admin-form-group">
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@test.com"
                />
              </label>
              <label className="admin-form-group">
                <span>Пароль</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="••••••••"
                />
              </label>

              {(authError || submitError) ? <div className="section-state error">{authError || submitError}</div> : null}

              <div className="admin-actions">
                <button type="submit" className="btn-add" disabled={authLoading}>
                  {authLoading ? 'Входим...' : 'Войти'}
                </button>
                <button type="button" className="btn-reset" onClick={onClose}>
                  Закрыть
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel" role="dialog" aria-modal="true" aria-label="Панель управления">
      <div className="admin-nav">
        <h1>
          AROMA NAUR <span>Admin</span>
        </h1>
        <div className="admin-nav-actions">
          <button className="admin-close-btn" type="button" onClick={onLogout}>
            Выйти
          </button>
          <button className="admin-close-btn" type="button" onClick={onClose}>
            ← Вернуться на сайт
          </button>
        </div>
      </div>

      <div className="admin-body">
        <div className="admin-stats">
          <div className="admin-stat">
            <div className="admin-stat-n">{catalog.length}</div>
            <div className="admin-stat-l">Товаров</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-n">{brandCount}</div>
            <div className="admin-stat-l">Брендов</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-n">{newCount}</div>
            <div className="admin-stat-l">Новинок</div>
          </div>
        </div>

        <h2 className="admin-section-title" ref={formTitleRef}>
          {editingId ? 'Редактировать товар' : 'Добавить товар'}
        </h2>
        {editingId ? (
          <div className="edit-banner">
            Режим редактирования активен. После сохранения изменения применятся к товару.
          </div>
        ) : null}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-group">
              <span>Название аромата *</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Sauvage"
              />
            </label>
            <label className="admin-form-group">
              <span>Бренд *</span>
              <input
                type="text"
                value={form.brand}
                onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                placeholder="Dior"
              />
            </label>
            <label className="admin-form-group">
              <span>Категория</span>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                <option value="unisex">Унисекс</option>
                <option value="male">Мужские</option>
                <option value="female">Женские</option>
              </select>
            </label>
            <label className="admin-form-group">
              <span>Цена за 1 мл (₽) *</span>
              <input
                type="number"
                value={form.price_per_ml}
                onChange={(event) => setForm((current) => ({ ...current, price_per_ml: event.target.value }))}
                placeholder="85"
              />
            </label>
            <label className="admin-form-group">
              <span>Доступные объёмы</span>
              <input
                type="text"
                value={form.available_volumes}
                onChange={(event) => setForm((current) => ({ ...current, available_volumes: event.target.value }))}
                placeholder="5, 10, 30"
              />
            </label>
            <label className="admin-form-group">
              <span>Метка</span>
              <select value={form.badge} onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}>
                <option value="">Нет</option>
                <option value="new">Новинка</option>
                <option value="hit">Хит</option>
              </select>
            </label>
            <label className="admin-form-group full">
              <span>Ноты аромата</span>
              <input
                type="text"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Бергамот, Амбра, Ветивер"
              />
            </label>
            <label className="admin-form-group full">
              <span>Описание</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Короткое описание аромата..."
              />
            </label>
            <label className="admin-form-group full">
              <span>Картинка товара</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {form.imagePreview || form.imageUrl ? (
                <div className="admin-image-preview">
                  <img src={form.imagePreview || form.imageUrl} alt="Предпросмотр" />
                </div>
              ) : null}
            </label>
          </div>

          <div className="admin-toggle-row">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={handleToggleActive}
              />
              <span>Товар активен</span>
            </label>
          </div>

          {(error || submitError) ? <div className="section-state error">{error || submitError}</div> : null}

          <div className="admin-actions">
            <button type="submit" className="btn-add" disabled={submitting || loading}>
              {submitting ? 'Сохраняем...' : editingId ? 'Сохранить изменения' : 'Добавить товар'}
            </button>
            <button type="button" className="btn-reset" onClick={resetForm}>
              Очистить
            </button>
          </div>
        </form>

        <h2 className="admin-section-title">Товары в каталоге</h2>
        {loading ? <div className="section-state">Загружаем товары...</div> : null}
        <div className="products-table">
          <div className="table-header">
            <div />
            <div>Название</div>
            <div>Бренд</div>
            <div>Категория</div>
            <div>Цена/мл</div>
            <div>Действие</div>
          </div>

          <div className="admin-table-body">
            {catalog.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                categoryLabel={categories[product.category] || product.category}
                onBeginEdit={beginEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        product={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            handleDelete(resolveParfumeId(pendingDelete));
          }
        }}
      />
    </div>
  );
}

export default memo(AdminPanel);
