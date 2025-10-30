import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase, Category } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('categories').insert({ name, slug });
    setName('');
    loadCategories();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-white mb-6">Manage Categories</h2>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-600"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add
        </button>
      </form>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
            <span className="text-white font-medium">{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
