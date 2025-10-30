import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ToolDetail } from './pages/ToolDetail';
import { Favorites } from './pages/Favorites';
import { Articles } from './pages/Articles';
import { Toolkits } from './pages/Toolkits';
import { AdminTools } from './pages/admin/AdminTools';
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
            <Route path="/admin" element={<AdminTools />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
