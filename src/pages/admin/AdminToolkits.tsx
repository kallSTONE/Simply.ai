import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { supabase, Toolkit } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { ToolkitForm } from '../../components/admin/ToolkitForm.tsx';

export function AdminToolkits() {
  const [showForm, setShowForm] = useState(false);
  const [editingToolkit, setEditingToolkit] = useState<Toolkit | null>(null);
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToolkits();
  }, []);

  async function loadToolkits() {
    const { data } = await supabase
      .from('toolkits')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setToolkits(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center text-gray-400/60 py-12">Loading...</div>;
  }

  async function deleteToolkit(id: string) {
    if (!confirm('Are you sure you want to delete this toolkit?')) return;

    await supabase.from('toolkits').delete().eq('id', id);
    loadToolkits();
  }

  function handleEdit(toolkit: Toolkit) {
    setEditingToolkit(toolkit);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingToolkit(null);
    loadToolkits();
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Toolkits</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Toolkit
        </button>
      </div>

      <div className="space-y-4">
        {toolkits.map((toolkit) => (
          <div
            key={toolkit.id}
            className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {toolkit.icon ? (
                <img
                  src={toolkit.icon}
                  alt={toolkit.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {toolkit.name[0]}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{toolkit.name}</h3>
                <p className="text-neutral-400">{toolkit.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">
                    {toolkit.created_at.split('T')[0]}
                  </span>
                  <span className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-lg text-sm">
                    {toolkit.created_by || 'Unknown Creator'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(toolkit)}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit size={20} />
              </button>

              <button
                onClick={() => deleteToolkit(toolkit.id)}
                className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ToolkitForm
          toolkit={editingToolkit}
          onClose={handleClose}
        />
      )}
    </AdminLayout>
  );
}
