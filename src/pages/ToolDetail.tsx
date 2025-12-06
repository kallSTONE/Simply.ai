import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Heart, ArrowLeft } from 'lucide-react';
import { supabase, Tool } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

export function ToolDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadTool();
    }
  }, [slug]);

  async function loadTool() {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (data) {
      setTool(data);
      checkFavorite(data.id);
      loadRelatedTools(data.tags);
    }
    setLoading(false);
  }

  async function checkFavorite(toolId: string) {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    setIsFavorite(!!data);
  }

  async function loadRelatedTools(tags: string[]) {
    if (!tags || tags.length === 0) return;

    const { data } = await supabase
      .from('tools')
      .select('*')
      .neq('slug', slug)
      .limit(3);

    if (data) {
      const filtered = data.filter(t =>
        t.tags.some((tag : string) => tags.includes(tag))
      );
      setRelatedTools(filtered.length > 0 ? filtered : data);
    }
  }

  async function toggleFavorite() {
    if (!user || !tool) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', tool.id);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, tool_id: tool.id });
      setIsFavorite(true);
    }
  }

  if (loading) {
    return <div className="text-center text-neutral-400 py-12">Loading...</div>;
  }

  if (!tool) {
    return <div className="text-center text-neutral-400 py-12">Tool not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Tools
      </Link>

      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8">
        <div className="flex items-start gap-6 mb-8">
          {tool.logo ? (
            <img 
              src={tool.logo_display || tool.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=9333ea&color=fff&size=256&bold=true`}
              alt={tool.name} 
              className="w-12 h-12 rounded-xl object-cover" 
            />
          ) : (
            <div className="w-24 h-24 bg-green-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">{tool.name[0]}</span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{tool.name}</h1>
            <p className="text-xl text-neutral-400 mb-4">{tool.developer}</p>

            <div className="flex items-center gap-3">
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                Visit Website
                <ExternalLink size={18} />
              </a>

              {user && (
                <button
                  onClick={toggleFavorite}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2 ${
                    isFavorite
                      ? 'bg-neutral-500 text-white hover:bg-neutral-600'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-xl font-medium">
            {tool.pricing_tag}
          </span>
          {tool.rating > 0 && (
            <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-medium">
              ★ {tool.rating}
            </span>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">About</h2>
          <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{tool.full_description}</p>
        </div>

        {tool.platforms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Platforms</h2>
            <div className="flex flex-wrap gap-2">
              {tool.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded-xl"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}

        {tool.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-neutral-700 text-neutral-300 rounded-xl"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {tool.screenshots.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tool.screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot}
                  alt={`${tool.name} screenshot ${index + 1}`}
                  className="w-full h-64 object-cover rounded-xl"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {relatedTools.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.id}
                to={`/tool/${relatedTool.slug}`}
                className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 hover:border-green-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {relatedTool.logo ? (
                    <img
                      src={relatedTool.logo}
                      alt={relatedTool.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{relatedTool.name[0]}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white">{relatedTool.name}</h3>
                </div>
                <p className="text-neutral-300 text-sm line-clamp-2">{relatedTool.short_description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
