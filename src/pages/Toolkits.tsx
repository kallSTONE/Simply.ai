import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { supabase, Toolkit } from '../lib/supabase';

export function Toolkits() {
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
    return <div className="text-center text-neutral-400 py-12">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Toolkits</h1>

      {toolkits.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-neutral-600 mb-4" size={64} />
          <p className="text-xl text-neutral-400">No toolkits available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolkits.map((toolkit) => (
            <Link
              key={toolkit.id}
              to={`/toolkit/${toolkit.slug}`}
              className="block bg-gray-800/60 border border-neutral-700 rounded-2xl p-6 hover:border-green-600 transition-colors"
            >
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:border-green-600 transition-colors">{toolkit.name}</h2>
              <p className="text-neutral-300">{toolkit.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
