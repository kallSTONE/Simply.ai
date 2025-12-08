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
    <>
      <div className="max-w-auto mx-auto hidden md:block ">
        <div className="mb-12 ">
          <h1 className="text-2xl font-bold text-white mb-4">
            With AI I want to...
          </h1>
          <p className="text-lg text-neutral-400 mb-8">
            Discover the perfect AI tools for your needs
          </p>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI tools..."
                className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-700 rounded-2xl text-white placeholder-neutral-400 focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <button
              onClick={toggleFilter}
              className="px-6 py-4 bg-neutral-800/50 border border-neutral-700 rounded-2xl text-white hover:bg-neutral-700 transition-colors flex items-center gap-2"
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
                  ? 'bg-green-900/90 text-white'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <Sparkles size={18} />
              New Tools
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                sortBy === 'trending'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <TrendingUp size={18} />
              Trending
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-neutral-400 py-12">Loading...</div>
        ) : tools.length === 0 ? (
          <div className="text-center text-neutral-400 py-12">
            No tools found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

  <div className="fixed bottom-0 w-full pointer-events-none">

    <div className="w-full h-[1.2px] backdrop-blur-[0px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[0.51px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[1.03px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[1.54px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[2.05px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[2.56px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[3.08px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[3.59px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[4.10px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[4.62px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[5.13px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[5.64px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[6.15px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[6.67px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[7.18px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[7.69px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[8.21px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[8.72px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[9.23px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[9.74px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[10.26px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[10.77px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[11.28px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[11.79px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[12.31px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[12.82px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[13.33px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[13.85px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[14.36px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[14.87px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[15.38px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[15.90px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[16.41px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[16.92px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[17.44px] bg-transparent"></div>

    <div className="w-full h-[1.2px] backdrop-blur-[17.95px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[18.46px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[18.97px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[19.49px] bg-transparent"></div>
    <div className="w-full h-[1.2px] backdrop-blur-[20px] bg-transparent"></div>

  </div>



      </div>

      <div className="fixed inset-0 flex items-center justify-center text-red-900 md:hidden font-bold text-2xl z-99 ">
        <p className="w-full text-center p-24">
          Please Open website on Larger Screen or Rotate your Device
        </p>
      </div>
    </>
  );
}
