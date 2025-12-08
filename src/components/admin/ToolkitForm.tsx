import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Toolkit } from '../../lib/supabase';

type ToolkitFormProps = {
  toolkit: Toolkit | null;  // If null → creating new
  onClose: () => void;
};

export function ToolkitForm({ toolkit, onClose }: ToolkitFormProps) {
  const [name, setName] = useState(toolkit?.name || '');
  const [slug, setSlug] = useState(toolkit?.slug || '');
  const [description, setDescription] = useState(toolkit?.description || '');
  const [icon, setIcon] = useState(toolkit?.icon || '');

  const [saving, setSaving] = useState(false);

  // Auto-generate slug from name when creating new
  useEffect(() => {
    if (!toolkit) {
      setSlug(name.toLowerCase().trim().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      slug,
      description,
      icon: icon || null,
    };

    if (toolkit) {
      // Update
      await supabase.from('toolkits').update(payload).eq('id', toolkit.id);
    } else {
      // Create
      await supabase.from('toolkits').insert(payload);
    }

    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {toolkit ? 'Edit Toolkit' : 'Create Toolkit'}
          </h2>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-neutral-300 font-medium">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-green-600 outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-neutral-300 font-medium">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-green-600 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-neutral-300 font-medium">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full mt-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-green-600 outline-none"
            />
          </div>

          {/* Icon URL */}
          <div>
            <label className="text-neutral-300 font-medium">Icon URL (optional)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:border-green-600 outline-none"
              placeholder="https://example.com/icon.png"
            />
          </div>

          {/* Preview */}
          {icon && (
            <div className="mt-2">
              <p className="text-neutral-400 text-sm mb-2">Icon Preview:</p>
              <img
                src={icon}
                alt="Icon preview"
                className="w-20 h-20 rounded-xl object-cover border border-neutral-700"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : toolkit ? 'Save Changes' : 'Create Toolkit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
