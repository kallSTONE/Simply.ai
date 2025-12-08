import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Tool, Category } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

type ToolFormProps = {
  tool: Tool | null;
  onClose: () => void;
};

export function ToolForm({ tool, onClose }: ToolFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: tool?.name || '',
    slug: tool?.slug || '',
    short_description: tool?.short_description || '',
    full_description: tool?.full_description || '',
    website: tool?.website || '',
    developer: tool?.developer || '',
    pricing_tag: tool?.pricing_tag || 'Free',
    platforms: tool?.platforms.join(', ') || '',
    tags: tool?.tags.join(', ') || '',
    screenshots: tool?.screenshots.join('\n') || '',
    logo: tool?.logo || '',
    rating: tool?.rating || 0,
  });

  useEffect(() => {
    loadCategories();
    if (tool) {
      loadToolCategories();
    }
  }, [tool]);

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*');
    if (data) {
      setCategories(data);
    }
  }

  async function loadToolCategories() {
    if (!tool) return;

    const { data } = await supabase
      .from('tool_categories')
      .select('category_id')
      .eq('tool_id', tool.id);

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
      name,
      slug: generateSlug(name),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const toolData = {
      ...formData,
      platforms: formData.platforms.split(',').map(p => p.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      screenshots: formData.screenshots.split('\n').map(s => s.trim()).filter(Boolean),
      logo: formData.logo || null,
      created_by: user?.id,
    };

    if (tool) {
      await supabase.from('tools').update(toolData).eq('id', tool.id);

      await supabase.from('tool_categories').delete().eq('tool_id', tool.id);

      if (selectedCategories.length > 0) {
        await supabase.from('tool_categories').insert(
          selectedCategories.map(catId => ({
            tool_id: tool.id,
            category_id: catId,
          }))
        );
      }
    } else {
      const { data: newTool } = await supabase
        .from('tools')
        .insert(toolData)
        .select()
        .single();

      if (newTool && selectedCategories.length > 0) {
        await supabase.from('tool_categories').insert(
          selectedCategories.map(catId => ({
            tool_id: newTool.id,
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
          {tool ? 'Edit Tool' : 'Add New Tool'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Short Description</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Full Description</label>
            <textarea
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Developer</label>
              <input
                type="text"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Pricing</label>
              <select
                value={formData.pricing_tag}
                onChange={(e) => setFormData({ ...formData, pricing_tag: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
              >
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300/85 mb-2">Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
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
                    className="w-4 h-4 rounded border-neutral-700/85 bg-neutral-800/85 text-green-600/90"
                  />
                  <span className="text-neutral-300/85">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Platforms (comma-separated)</label>
            <input
              type="text"
              value={formData.platforms}
              onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
              placeholder="Web, iOS, Android"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
              placeholder="AI, NLP, Image Generation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300/85 mb-2">Screenshots (one per line)</label>
            <textarea
              value={formData.screenshots}
              onChange={(e) => setFormData({ ...formData, screenshots: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/85 border border-neutral-700/85 rounded-xl text-white focus:outline-none focus:border-green-600/90"
              rows={3}
              placeholder="https://example.com/screenshot1.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600/90 text-white rounded-xl hover:bg-green-700/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : tool ? 'Update Tool' : 'Create Tool'}
          </button>
        </form>
      </div>
    </div>
  );
}
