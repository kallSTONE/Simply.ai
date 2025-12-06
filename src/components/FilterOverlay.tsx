import { X } from 'lucide-react';
import { useFilterStore } from '../lib/store';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function FilterOverlay() {
  const {
    isFilterOpen,
    categories,
    pricing,
    platforms,
    rating,
    setCategories,
    setPricing,
    setPlatforms,
    setRating,
    toggleFilter,
    clearFilters,
  } = useFilterStore();

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  async function loadFilterOptions() {
    const { data: cats } = await supabase.from('categories').select('name');
    if (cats) {
      setAvailableCategories(cats.map(c => c.name));
    }

    const { data: tools } = await supabase.from('tools').select('platforms');
    if (tools) {
      const platformSet = new Set<string>();
      tools.forEach(tool => {
        tool.platforms.forEach((p: string) => platformSet.add(p));
      });
      setAvailablePlatforms(Array.from(platformSet));
    }
  }

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const togglePricing = (price: string) => {
    if (pricing.includes(price)) {
      setPricing(pricing.filter(p => p !== price));
    } else {
      setPricing([...pricing, price]);
    }
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  if (!isFilterOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleFilter}
      />
      <div className="fixed right-0 top-0 h-screen w-96 bg-neutral-900 border-l border-neutral-800 z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Filters</h2>
            <button
              onClick={toggleFilter}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Category</h3>
              <div className="space-y-2">
                {availableCategories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-neutral-300">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Pricing</h3>
              <div className="space-y-2">
                {['Free', 'Freemium', 'Paid'].map(price => (
                  <label key={price} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.includes(price)}
                      onChange={() => togglePricing(price)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-neutral-300">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Platform</h3>
              <div className="space-y-2">
                {availablePlatforms.map(platform => (
                  <label key={platform} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-neutral-300">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Minimum Rating</h3>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-purple-400 font-medium mt-2">
                {rating} stars
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={toggleFilter}
              className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                clearFilters();
                toggleFilter();
              }}
              className="w-full py-3 bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
