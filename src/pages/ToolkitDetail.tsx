import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase, Toolkit, Tool } from '../lib/supabase';
import { ToolCard } from '../components/ToolCard';

export function ToolkitDetail() {
  const { slug } = useParams();

  const [toolkit, setToolkit] = useState<Toolkit | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadToolkit();
    }
  }, [slug]);

  async function loadToolkit() {
    // 1. Get the toolkit
    const { data: toolkitData } = await supabase
      .from('toolkits')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (toolkitData) {
      setToolkit(toolkitData);
      await loadToolkitTools(toolkitData.id);
    }

    setLoading(false);
  }

  async function loadToolkitTools(toolkitId: string) {
    // 2. Get the related tools through the join table
    const { data: joinRows } = await supabase
      .from('toolkit_tools')
      .select('tool_id, order_index')
      .eq('toolkit_id', toolkitId)
      .order('order_index', { ascending: true });

    if (!joinRows || joinRows.length === 0) {
      setTools([]);
      return;
    }

    const toolIds = joinRows.map((row) => row.tool_id);

    // 3. Fetch the full tool objects
    const { data: toolData } = await supabase
      .from('tools')
      .select('*')
      .in('id', toolIds);

    if (!toolData) {
      setTools([]);
      return;
    }

    // 4. Sort tools by join table's order_index
    const ordered = joinRows
      .map((row) => ({
        order: row.order_index,
        tool: toolData.find((t) => t.id === row.tool_id),
      }))
      .filter((x) => x.tool)
      .sort((a, b) => a.order - b.order)
      .map((x) => x.tool as Tool);

    setTools(ordered);
  }

  // Loading UI
  if (loading) {
    return <div className="text-center text-neutral-400 py-12">Loading...</div>;
  }

  if (!toolkit) {
    return <div className="text-center text-neutral-400 py-12">Toolkit not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/toolkits"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Toolkits
      </Link>

      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-8">
        <div className="flex items-start gap-6 mb-6">
          {toolkit.icon ? (
            <img
              src={toolkit.icon}
              alt={toolkit.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {toolkit.name[0]}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              {toolkit.name}
            </h1>
            <p className="text-neutral-300">{toolkit.description}</p>
          </div>
        </div>

        <hr className="border-neutral-700 my-6" />

        <h2 className="text-2xl font-bold text-white mb-4">
          Tools in This Toolkit
        </h2>

        {tools.length === 0 ? (
          <p className="text-neutral-400">This toolkit has no tools yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
