import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ToolDetail } from './pages/ToolDetail';

import { ArticleDetail } from './pages/ArticleDetial';
import { Favorites } from './pages/Favorites';
import { Articles } from './pages/Articles';

import { Toolkits } from './pages/Toolkits';
import { ToolkitDetail } from './pages/ToolkitDetail';
import { AdminToolkits } from './pages/admin/AdminToolkits';
import { AdminToolkitTools } from './pages/admin/AdminToolkitTools';

import { AdminTools } from './pages/admin/AdminTools';
import { AdminArticles } from './pages/admin/AdminArticles';
import { AdminCategories } from './pages/admin/AdminCategories';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tool/:slug" element={<ToolDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/toolkits" element={<Toolkits />} />
            <Route path="/toolkit/:slug" element={<ToolkitDetail />} />
            <Route path="/admin/toolkits" element={<AdminToolkits />} />
            <Route path="/admin/toolkittools" element={<AdminToolkitTools />} />
            <Route path="/admin" element={<AdminTools />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
