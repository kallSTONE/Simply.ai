import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { supabase, Article } from '../lib/supabase';
import DAI from '../public/images/defaultArticle.jpg'

export function Articles() {
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

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Articles</h1>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-600/60 mb-4" size={64} />
          <p className="text-xl text-gray-400/60">No articles published yet</p>
        </div>
      ) : (
        <div className="border border-gray-700/60 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="block h-64 overflow-hidden bg-gray-800/60 border border-gray-700/60 rounded-2xl p-6 hover:border-green-600 transition-colors"
            >              
              <img src={DAI} alt="article" className='h-12 w-full object-cover rounded-lg mb-4' />
              <h2 className="text-2xl font-bold text-white mb-2">{article.title}</h2>
              {/* <img src={`../../${article.image}`} alt="article" className="w-full h-auto" /> */}
              <p className="text-gray-300/60 mb-4">{article.summary}</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-700/60 text-gray-300/60 rounded-lg text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
