import { useEffect, useState } from 'react';
import { supabase, Toolkit, Tool } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { ArrowUpDown, Trash2 } from 'lucide-react';

export function AdminToolkitTools() {
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [selectedToolkit, setSelectedToolkit] = useState<Toolkit | null>(null);

  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [assignedTools, setAssignedTools] = useState<
    { tool: Tool; joinId: string; order_index: number }[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToolkits();
    loadAllTools();
  }, []);

  async function loadToolkits() {
    const { data } = await supabase.from('toolkits').select('*').order('name');
    if (data) setToolkits(data);
    setLoading(false);
  }

  async function loadAllTools() {
    const { data } = await supabase.from('tools').select('*').order('name');
    if (data) setAvailableTools(data);
  }

  async function loadAssignedTools(toolkitId: string) {
    const { data: joinRows } = await supabase
      .from('toolkit_tools')
      .select('id, tool_id, order_index')
      .eq('toolkit_id', toolkitId)
      .order('order_index');

    if (!joinRows) return setAssignedTools([]);

    const ids = joinRows.map((r) => r.tool_id);
    const { data: tools } = await supabase.from('tools').select('*').in('id', ids);

    const mapped = joinRows
      .map((row) => ({
        joinId: row.id,
        order_index: row.order_index,
        tool: tools?.find((t) => t.id === row.tool_id)!,
      }))
      .sort((a, b) => a.order_index - b.order_index);

    setAssignedTools(mapped);
  }

  function handleSelectToolkit(id: string) {
    const toolkit = toolkits.find((t) => t.id === id) || null;
    setSelectedToolkit(toolkit);
    if (toolkit) loadAssignedTools(toolkit.id);
  }

  async function addToolToToolkit(toolId: string) {
    if (!selectedToolkit) return;

    await supabase.from('toolkit_tools').insert({
      toolkit_id: selectedToolkit.id,
      tool_id: toolId,
      order_index: assignedTools.length,
    });

    loadAssignedTools(selectedToolkit.id);
  }

  async function removeTool(joinId: string) {
    if (!confirm('Remove this tool from the toolkit?')) return;

    await supabase.from('toolkit_tools').delete().eq('id', joinId);

    if (selectedToolkit) loadAssignedTools(selectedToolkit.id);
  }

  async function reorderTools() {
    if (!selectedToolkit) return;

    const updates = assignedTools.map((item, index) => ({
      id: item.joinId,
      order_index: index,
    }));

    await supabase.from('toolkit_tools').upsert(updates);

    loadAssignedTools(selectedToolkit.id);
  }

  // Drag-and-drop ability
  function moveTool(fromIndex: number, toIndex: number) {
    const newList = [...assignedTools];
    const [moved] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, moved);

    // Update state
    setAssignedTools(newList);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-400/60 py-12">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-white mb-6">Manage Toolkit Tools</h2>

      {/* Toolkit selector */}
      <div className="mb-6">
        <label className="text-neutral-300 font-medium">Select Toolkit</label>
        <select
          className="w-full mt-2 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
          onChange={(e) => handleSelectToolkit(e.target.value)}
          value={selectedToolkit?.id || ''}
        >
          <option value="">Select a toolkit...</option>
          {toolkits.map((tk) => (
            <option key={tk.id} value={tk.id}>
              {tk.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tools management */}
      {selectedToolkit && (
        <>
          <h3 className="text-xl font-bold text-white mb-4">
            Tools in {selectedToolkit.name}
          </h3>

          {assignedTools.length === 0 ? (
            <p className="text-neutral-400 mb-6">No tools added yet.</p>
          ) : (
            <div className="space-y-3 mb-6">
              {assignedTools.map((item, index) => (
                <div
                  key={item.joinId}
                  className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-400">{index + 1}.</span>
                    <img
                      src={
                        item.tool.logo ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.tool.name
                        )}&background=9333ea&color=fff&size=256&bold=true`
                      }
                      alt={item.tool.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />

                    <div>
                      <h4 className="text-white font-medium">{item.tool.name}</h4>
                      <p className="text-neutral-400 text-sm">
                        {item.tool.short_description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up */}
                    {index > 0 && (
                      <button
                        onClick={() => {
                          moveTool(index, index - 1);
                          reorderTools();
                        }}
                        className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-xl text-neutral-300"
                      >
                        <ArrowUpDown size={18} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => removeTool(item.joinId)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-xl text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new tool section */}
          <h3 className="text-xl font-bold text-white mb-3">Add Tool</h3>
          <div className="space-y-3">
            {availableTools
              .filter(
                (tool) => !assignedTools.some((t) => t.tool.id === tool.id)
              )
              .map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => addToolToToolkit(tool.id)}
                  className="w-full flex items-center gap-4 bg-neutral-800 border border-neutral-700 rounded-xl p-4 hover:border-green-600 transition"
                >
                  <img
                    src={
                      tool.logo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        tool.name
                      )}&background=9333ea&color=fff&size=256&bold=true`
                    }
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{tool.name}</h4>
                    <p className="text-neutral-400 text-sm">
                      {tool.short_description}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium">
                    Add
                  </span>
                </button>
              ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
