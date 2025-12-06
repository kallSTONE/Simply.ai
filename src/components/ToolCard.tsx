import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';
import { Tool } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, tool.id]);

  async function checkFavorite() {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', tool.id)
      .maybeSingle();

    setIsFavorite(!!data);
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);

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

    setLoading(false);
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Freemium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Paid':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  };

  return (
    <Link
      to={`/tool/${tool.slug}`}
      className="block max-h-max bg-neutral-800 border border-neutral-700 rounded-2xl p-4 hover:border-green-600 transition-all group"
    >
     <div className="flex flex-wrap items-start justify-between mb-4">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {tool.logo ? (
          <img
            src={tool.logo_display || tool.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=9333ea&color=fff&size=256&bold=true`}
            alt={`${tool.name} logo`}
            width={48}
            height={48}
            className="w-8 h-8 rounded-xl object-contain bg-white/5 flex-shrink-0"
            loading="lazy"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{tool.name[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors truncate">
            {tool.name}
          </h3>
          <p className="text-sm text-neutral-400 truncate">{tool.developer}</p>
        </div>
      </div>
      {user && (
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className="p-2 hover:bg-neutral-700 rounded-lg transition-colors flex-shrink-0"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-600 text-red-500' : 'text-neutral-400'}
          />
        </button>
      )}
    </div>


      <p className="text-neutral-300 mb-4 line-clamp-2">{tool.short_description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getPricingColor(tool.pricing_tag)}`}>
          {tool.pricing_tag}
        </span>
        {tool.rating > 0 && (
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-medium">
            ★ {tool.rating}
          </span>
        )}
      </div>

      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-lg text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
