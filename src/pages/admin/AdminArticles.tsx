import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase, Article } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { ArticleForm } from '../../components/admin/ArticleForm.tsx';
import Lg from '../../public/images/logo.png'

export function AdminArticles() {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
    
    
 useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (data) setArticles(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center text-gray-400/60 py-12">Loading...</div>;
  }


  async function deleteArticles(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    await supabase.from('articles').delete().eq('id', id);
    loadArticles();
  }

  function handleEdit(article: Article) {
    setEditingArticle(article);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingArticle(null);
    loadArticles();
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Articles</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Article
        </button>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {article.id ? (
                <img src={Lg} alt={article.title} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{article.title[0]}</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{article.title}</h3>
                <p className="text-neutral-400">{article.summary}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">
                    {article.created_at.split('T')[0]}
                  </span>
                  <span className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-lg text-sm">
                    {article.author_id || 'Unknown Author'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(article)}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => deleteArticles(article.id)}
                className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ArticleForm
          article={editingArticle}
          onClose={handleClose}
        />
      )}
    </AdminLayout>
  );
}
