import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase, Tool } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { ToolCard } from '../components/ToolCard';

export function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadFavorites();
  }, [user, navigate]);

  async function loadFavorites() {
    if (!user) return;

    const { data: favorites } = await supabase
      .from('favorites')
      .select('tool_id')
      .eq('user_id', user.id);

    if (favorites && favorites.length > 0) {
      const toolIds = favorites.map(f => f.tool_id);
      const { data: toolsData } = await supabase
        .from('tools')
        .select('*')
        .in('id', toolIds);

      if (toolsData) {
        setTools(toolsData);
      }
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-red-500" size={32} />
        <h1 className="text-4xl font-bold text-white">My Favorites</h1>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto text-gray-600 mb-4" size={64} />
          <p className="text-xl text-gray-400">No favorites yet</p>
          <p className="text-gray-500 mt-2">Start exploring and save your favorite AI tools</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
