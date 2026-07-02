import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createParfume,
  deleteParfume,
  fetchAllParfumes,
  fetchParfumes,
  loginAdmin,
  updateParfume,
} from './lib/api';
import { brands, categories } from './data/catalog';
import { normalizeParfumeList } from './lib/parfume';
import AboutSection from './components/AboutSection';
import AdminPanel from './components/AdminPanel';
import CatalogSection from './components/CatalogSection';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import HowSection from './components/HowSection';
import Marquee from './components/Marquee';
import MobileNav from './components/MobileNav';
import ProductModal from './components/ProductModal';

const DEFAULT_LIMIT = 12;
const DEFAULT_ADMIN_LOGIN = {
  email: 'admin@test.com',
  password: '',
};

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('aroma_admin_token') || '');
  const [adminCatalog, setAdminCatalog] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminLoginDefaults] = useState(DEFAULT_ADMIN_LOGIN);
  const [catalogQuery, setCatalogQuery] = useState({
    category: 'all',
    search: '',
    page: 1,
    limit: DEFAULT_LIMIT,
  });
  const [catalogState, setCatalogState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    loading: true,
    error: '',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const catalogCacheRef = useRef(new Map());

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen || selectedProduct || adminOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen, selectedProduct, adminOpen]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(catalogQuery.search.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [catalogQuery.search]);

  const getCatalogCacheKey = useCallback((query) => {
    const search = query.search.trim().toLowerCase();
    return [query.category, search, query.page, query.limit].join('|');
  }, []);

  const loadPublicCatalog = useCallback(
    async ({ force = false } = {}) => {
      const query = {
        category: catalogQuery.category,
        search: debouncedSearch,
        page: catalogQuery.page,
        limit: catalogQuery.limit,
      };
      const cacheKey = getCatalogCacheKey(query);

      if (!force) {
        const cached = catalogCacheRef.current.get(cacheKey);
        if (cached) {
          setCatalogState({ ...cached, loading: false, error: '' });
          return cached;
        }
      }

      setCatalogState((current) => ({ ...current, loading: true, error: '' }));

      try {
        const response = await fetchParfumes(query);
        const nextState = {
          items: normalizeParfumeList(response.parfumes || []),
          total: response.total || 0,
          page: response.page || catalogQuery.page,
          limit: response.limit || catalogQuery.limit,
          loading: false,
          error: '',
        };

        catalogCacheRef.current.set(cacheKey, nextState);
        setCatalogState(nextState);
        return nextState;
      } catch (error) {
        setCatalogState((current) => ({
          ...current,
          loading: false,
          error: error.message || 'Не удалось загрузить каталог',
        }));
        throw error;
      }
    },
    [catalogQuery.category, catalogQuery.limit, catalogQuery.page, debouncedSearch, getCatalogCacheKey],
  );

  useEffect(() => {
    let ignore = false;

    loadPublicCatalog().catch(() => {
      if (ignore) return;
    });

    return () => {
      ignore = true;
    };
  }, [loadPublicCatalog]);

  useEffect(() => {
    if (!adminOpen || !adminToken) {
      setAdminCatalog([]);
      return;
    }

    let ignore = false;

    async function loadAdminCatalog() {
      setAdminLoading(true);
      setAdminError('');

      try {
        const items = await fetchAllParfumes({ token: adminToken, pageSize: 100 });
        if (ignore) return;
        setAdminCatalog(normalizeParfumeList(items));
      } catch (error) {
        if (ignore) return;
        setAdminError(error.message || 'Не удалось загрузить каталог для админки');
      } finally {
        if (!ignore) {
          setAdminLoading(false);
        }
      }
    }

    loadAdminCatalog();
    return () => {
      ignore = true;
    };
  }, [adminOpen, adminToken]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('aroma_admin_token', adminToken);
    } else {
      localStorage.removeItem('aroma_admin_token');
    }
  }, [adminToken]);

  const marqueeBrands = useMemo(() => {
    const source = adminCatalog.length ? adminCatalog : catalogState.items;
    const list = source.map((item) => item.brand).filter(Boolean);
    const unique = [...new Set(list)];
    return unique.length > 0 ? unique : brands;
  }, [adminCatalog, catalogState.items]);

  const publicProducts = catalogState.items;

  const openAdmin = useCallback(() => {
    setMobileNavOpen(false);
    setAdminOpen(true);
    setAdminAuthError('');
  }, []);

  const closeAdmin = useCallback(() => {
    setAdminOpen(false);
    setAdminError('');
    setAdminAuthError('');
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setCatalogQuery((current) => ({ ...current, category, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((search) => {
    setCatalogQuery((current) => ({ ...current, search, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setCatalogQuery((current) => ({ ...current, page }));
  }, []);

  const handleAdminLogin = useCallback(async (email, password) => {
    setAdminAuthLoading(true);
    setAdminAuthError('');

    try {
      const response = await loginAdmin(email, password);
      setAdminToken(response.token);
    } catch (error) {
      setAdminAuthError(error.message || 'Не удалось войти в админку');
      throw error;
    } finally {
      setAdminAuthLoading(false);
    }
  }, []);

  const refreshCatalogs = useCallback(async () => {
    catalogCacheRef.current.clear();

    const [publicResponse, adminItems] = await Promise.all([
      loadPublicCatalog({ force: true }),
      adminToken ? fetchAllParfumes({ token: adminToken, pageSize: 100 }) : Promise.resolve([]),
    ]);

    if (adminToken) {
      setAdminCatalog(normalizeParfumeList(adminItems));
    }
    return publicResponse;
  }, [adminToken, loadPublicCatalog]);

  const handleCreateProduct = useCallback(async (payload) => {
    if (!adminToken) {
      throw new Error('Нужна авторизация');
    }

    await createParfume(payload, adminToken);
    await refreshCatalogs();
  }, [adminToken, refreshCatalogs]);

  const handleUpdateProduct = useCallback(async (id, payload) => {
    if (!adminToken) {
      throw new Error('Нужна авторизация');
    }

    await updateParfume(id, payload, adminToken);
    await refreshCatalogs();
  }, [adminToken, refreshCatalogs]);

  const handleDeleteProduct = useCallback(async (id) => {
    if (!adminToken) {
      throw new Error('Нужна авторизация');
    }

    await deleteParfume(id, adminToken);
    await refreshCatalogs();
  }, [adminToken, refreshCatalogs]);

  const handleLogout = useCallback(async () => {
    setAdminToken('');
    setAdminCatalog([]);
    closeAdmin();
  }, [closeAdmin]);

  const handleToggleMobileNav = useCallback(() => {
    setMobileNavOpen((value) => !value);
  }, []);

  const handleCloseMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const handleSelectProduct = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return (
    <div className="page">
      <Header
        mobileNavOpen={mobileNavOpen}
        navScrolled={navScrolled}
        onToggleMobileNav={handleToggleMobileNav}
        onOpenAdmin={openAdmin}
        onCloseMobileNav={handleCloseMobileNav}
      />

      <MobileNav open={mobileNavOpen} onClose={handleCloseMobileNav} />

      <main>
        <Hero />
        <Marquee brands={marqueeBrands} />
        <CatalogSection
          categories={categories}
          products={publicProducts}
          total={catalogState.total}
          page={catalogState.page}
          limit={catalogState.limit}
          search={catalogQuery.search}
          category={catalogQuery.category}
          loading={catalogState.loading}
          error={catalogState.error}
          onSelectProduct={handleSelectProduct}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
        />
        <HowSection />
        <AboutSection />
      </main>

      <Footer onOpenAdmin={openAdmin} />

      <ProductModal product={selectedProduct} onClose={handleCloseModal} />

      {adminOpen ? (
        <AdminPanel
          token={adminToken}
          loginDefaults={adminLoginDefaults}
          catalog={adminCatalog}
          categories={categories}
          loading={adminLoading}
          error={adminError}
          authLoading={adminAuthLoading}
          authError={adminAuthError}
          onClose={closeAdmin}
          onLogin={handleAdminLogin}
          onLogout={handleLogout}
          onCreateProduct={handleCreateProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      ) : null}
    </div>
  );
}

export default App;
