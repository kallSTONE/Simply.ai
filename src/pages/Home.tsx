import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { useFilterStore } from '../lib/store';
import { supabase, Tool } from '../lib/supabase';
import { ToolCard } from '../components/ToolCard';

export function Home() {
  const { searchQuery, setSearchQuery, toggleFilter, categories, pricing, platforms, rating } = useFilterStore();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'new' | 'trending'>('new');

  useEffect(() => {
    loadTools();
  }, [searchQuery, categories, pricing, platforms, rating, sortBy]);

  async function loadTools() {
    setLoading(true);
    let query = supabase
      .from('tools')
      .select('*');

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
    }

    if (pricing.length > 0) {
      query = query.in('pricing_tag', pricing);
    }

    if (rating > 0) {
      query = query.gte('rating', rating);
    }

    if (categories.length > 0) {
      const { data: toolIds } = await supabase
        .from('tool_categories')
        .select('tool_id, categories!inner(name)')
        .in('categories.name', categories);

      if (toolIds && toolIds.length > 0) {
        const ids = toolIds.map(t => t.tool_id);
        query = query.in('id', ids);
      } else {
        setTools([]);
        setLoading(false);
        return;
      }
    }

    if (sortBy === 'new') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('rating', { ascending: false });
    }

    const { data } = await query;

    if (data) {
      let filteredData = data;

      if (platforms.length > 0) {
        filteredData = filteredData.filter(tool =>
          platforms.some(platform => tool.platforms.includes(platform))
        );
      }

      setTools(filteredData);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          With AI I want to...
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Discover the perfect AI tools for your needs
        </p>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI tools..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-600 transition-colors"
            />
          </div>
          <button
            onClick={toggleFilter}
            className="px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSortBy('new')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              sortBy === 'new'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Sparkles size={18} />
            New Tools
          </button>
          <button
            onClick={() => setSortBy('trending')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              sortBy === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <TrendingUp size={18} />
            Trending
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : tools.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No tools found. Try adjusting your filters.
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
