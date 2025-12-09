import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase, Tool } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { ToolForm } from '../../components/admin/ToolForm';

export function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  async function loadTools() {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTools(data);
    }
  }

  async function deleteTool(id: string) {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    await supabase.from('tools').delete().eq('id', id);
    loadTools();
  }

  function handleEdit(tool: Tool) {
    setEditingTool(tool);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingTool(null);
    loadTools();
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Tools</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Tool
        </button>
      </div>

      <div className="space-y-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {tool.logo ? (
                <img src={tool.logo} alt={tool.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{tool.name[0]}</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{tool.name}</h3>
                <p className="text-neutral-400">{tool.short_description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">
                    {tool.pricing_tag}
                  </span>
                  <span className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-lg text-sm">
                    {tool.slug}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(tool)}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => deleteTool(tool.id)}
                className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ToolForm
          tool={editingTool}
          onClose={handleClose}
        />
      )}
    </AdminLayout>
  );
}
