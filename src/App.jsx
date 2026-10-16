import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import { BagProvider } from "./context/BagContext.jsx";
import Home from "./pages/home/home.jsx";
import About from "./pages/about/about.jsx"
import Shop from "./pages/shop/shop.jsx";
import RecipesPage from "./pages/recipes/RecipesPage.jsx";
import RecipeDetailPage from "./pages/recipes/RecipeDetailPage.jsx";
import BlogsPage from "./pages/blogs/BlogsPage.jsx";
import BlogDetailPage from "./pages/blogs/BlogDetailPage.jsx";
import CsrPage from "./pages/csr/CsrPage.jsx";
import NotFoundPage from "./pages/notFound/NotFoundPage.jsx";
import BagPage from "./pages/bag/BagPage.jsx";
import SearchPage from "./pages/search/SearchPage.jsx";
import ProductDetailPage from "./pages/products/ProductDetailPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import AdminPage from "./admin-tool/AdminPage.jsx";

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  return (
    <BagProvider>
      <ScrollToTop />
      {!isAdminPage && <Navbar />}
      <main className={isAdminPage ? "app-main--admin" : ""}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/:section" element={<AdminPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About/>}/>
          <Route path="/shop" element={<Shop/>}/>
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/bag" element={<BagPage />} />
          <Route path="/cart" element={<Navigate to="/bag" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/blogs/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/p" element={<BlogsPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/csr" element={<CsrPage />} />
          <Route path="/pages/csr" element={<CsrPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </BagProvider>
  );
}

export default App;
