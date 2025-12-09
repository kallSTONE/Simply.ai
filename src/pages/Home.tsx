import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { useFilterStore } from '../lib/store';
import { supabase, Tool } from '../lib/supabase';
import { ToolCard } from '../components/ToolCard';

export function Home() {
  const { searchQuery, setSearchQuery, toggleFilter, categories, pricing, platforms, rating } = useFilterStore();

  const LIMIT = 50;

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'new' | 'trending'>('new');

  // Reload tools when filters/sorting/search change
  useEffect(() => {
    setPage(1);
    fetchTools(true);
  }, [searchQuery, categories, pricing, platforms, rating, sortBy]);

  // Load tools from server
  async function fetchTools(reset = false) {
    setLoading(true);

    const from = 0;
    const to = page * LIMIT - 1;

    // Base query with count
    let query = supabase
      .from('tools')
      .select('*', { count: 'exact' });

    // SEARCH
    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`
      );
    }

    // PRICING FILTER
    if (pricing.length > 0) {
      query = query.in('pricing_tag', pricing);
    }

    // RATING FILTER
    if (rating > 0) {
      query = query.gte('rating', rating);
    }

    // CATEGORY FILTER
    if (categories.length > 0) {
      const { data: toolIds } = await supabase
        .from('tool_categories')
        .select('tool_id, categories!inner(name)')
        .in('categories.name', categories);

      if (!toolIds || toolIds.length === 0) {
        setTools([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      query = query.in('id', toolIds.map((t) => t.tool_id));
    }

    // SORT
    if (sortBy === 'new') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('rating', { ascending: false });
    }

    // SERVER PAGINATION
    query = query.range(from, to);

    const { data, count } = await query;

    // APPLY PLATFORM FILTER LOCALLY (DB can’t filter arrays easily)
    let filtered = data ?? [];
    if (platforms.length > 0) {
      filtered = filtered.filter(tool =>
        platforms.some(p => tool.platforms.includes(p))
      );
    }

    if (reset) {
      setTools(filtered);
    } else {
      setTools(prev => [...prev, ...filtered]);
    }

    // Check if more results exist
    if (!data || data.length < LIMIT || (count && tools.length >= count)) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }

    setLoading(false);
  }

  function loadMore() {
    setPage(prev => prev + 1);
    fetchTools();
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
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${sortBy === 'new'
                  ? 'bg-green-900/90 text-white'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700'
                }`}
            >
              <Sparkles size={18} />
              New Tools
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${sortBy === 'trending'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700'
                }`}
            >
              <TrendingUp size={18} />
              Trending
            </button>
          </div>
        </div>

        {loading && tools.length === 0 ? (
          <div className="text-center text-neutral-400 py-12">Loading...</div>
        ) : tools.length === 0 ? (
          <div className="text-center text-neutral-400 py-12">
            No tools found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  className="
                    px-12 py-3 
                    bg-gray-800/60 
                    border border-neutral-700 
                    text-white 
                    rounded-xl 
                    hover:bg-gray-900/60 
                    hover:border-green-600
                    transition-all 
                    duration-300 
                    shadow-lg 
                    shadow-black/20
                    backdrop-blur-sm
                    flex items-center gap-2
                  "
                >
                  <span>View More</span>
                  <svg
                    className="w-4 h-4 animate-pulse text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            {loading && tools.length > 0 && (
              <div className="flex justify-center py-8 text-neutral-400">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></div>
                  <span className="ml-2">Loading more...</span>
                </div>
              </div>
            )}

          </>
        )}

        {/* Your blur effects */}
        <div className="fixed bottom-0 w-full pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`w-full h-[1.2px] backdrop-blur-[${(i * 0.51).toFixed(2)}px] bg-transparent`}
            ></div>
          ))}
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
