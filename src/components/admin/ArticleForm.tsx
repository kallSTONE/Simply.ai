import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Article, Category } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

type ArticleFormProps = {
  article: Article | null;
  onClose: () => void;
};

export function ArticleForm({ article, onClose }: ArticleFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    summary: article?.summary || '',
    body: article?.body || '',
    author_id: article?.author_id || '',
    updated_at: article?.updated_at || 'null',
    tags: article?.tags.join(', ') || '',
  });

  useEffect(() => {
    loadCategories();
    if (article) {
      loadArticleCategories();
    }
  }, [article]);

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*');
    if (data) {
      setCategories(data);
    }
  }

  async function loadArticleCategories() {
    if (!article) return;

    const { data } = await supabase
      .from('article_categories')
      .select('category_id')
      .eq('article_id', article.id);

    if (data) {
      setSelectedCategories(data.map(tc => tc.category_id));
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      title: name,
      slug: generateSlug(name),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const articleData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      author_id: user?.id,
    };

    if (article) {
      await supabase.from('articles').update(articleData).eq('id', article.id);
      await supabase.from('article_categories').delete().eq('article_id', article.id);

      if (selectedCategories.length > 0) {
        await supabase.from('article_categories').insert(
          selectedCategories.map(catId => ({
            article_id: article.id,
            category_id: catId,
          }))
        );
      }
    } else {
      const { data: newArticle } = await supabase
        .from('articles')
        .insert(articleData)
        .select()
        .single();

      if (newArticle && selectedCategories.length > 0) {
        await supabase.from('article_categories').insert(
          selectedCategories.map(catId => ({
            article_id: newArticle.id,
            category_id: catId,
          }))
        );
      }
    }

    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-neutral-900/85 rounded-2xl p-8 w-full max-w-3xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400/85 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {article ? 'Edit Article' : 'Add New Article'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Summary</label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Author ID</label>
              <input
                type="text"
                value={formData.author_id}
                onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, cat.id]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-neutral-700/85 bg-neutral-800/85 text-green-600"
                  />
                  <span className="text-neutral-300/85">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
              placeholder="AI, NLP, Image Generation"
            />
          </div>


          {/* <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Screenshots (one per line)</label>
            <textarea
              value={formData.screenshots}
              onChange={(e) => setFormData({ ...formData, screenshots: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600"
              rows={3}
              placeholder="https://example.com/screenshot1.jpg"
            />
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
          </button>
        </form>
      </div>
    </div>
  );
}
