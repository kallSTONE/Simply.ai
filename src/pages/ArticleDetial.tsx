import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase, Article } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

export function ArticleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  async function loadArticle() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (data) {
      setArticle(data);
      loadRelatedArticles(data.tags);
    }

    setLoading(false);
  }

  async function loadRelatedArticles(tags: string[]) {
    if (!tags || tags.length === 0) return;

    const { data } = await supabase
      .from('articles')
      .select('*')
      .neq('slug', slug)
      .limit(3);

    if (data) {
      const filtered = data.filter((a) =>
        a.tags?.some((tag: string) => tags.includes(tag))
      );

      setRelatedArticles(filtered.length > 0 ? filtered : data);
    }
  }

  if (loading) {
    return <div className="text-center text-neutral-400 py-12">Loading...</div>;
  }

  if (!article) {
    return <div className="text-center text-neutral-400 py-12">Article not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Articles
      </Link>

      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-2">{article.title}</h1>

        <div className="text-neutral-400 mb-6">
          {article.author_id ? (
            <p className="text-sm mb-1">By {article.author_id}</p>
          ) : (
            <p className="text-sm mb-1">By Unknown Author</p>
          )}
          <p className="text-sm">
            Published on {new Date(article.created_at).toLocaleDateString()}
          </p>
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded-xl"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Article</h2>
          <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {article.body}
          </div>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                to={`/article/${related.slug}`}
                className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 hover:border-green-600 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-2">{related.title}</h3>
                <p className="text-neutral-300 text-sm line-clamp-3">{related.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
