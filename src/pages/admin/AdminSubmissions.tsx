import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AdminLayout } from "./AdminLayout";
import { CheckCircle, XCircle } from "lucide-react";
import { Article } from "../../lib/supabase";

export function AdminSubmissions() {
  const [submittedArticles, setSubmittedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordAccepted, setPasswordAccepted] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const REVIEW_PASSWORD = import.meta.env.VITE_SUBMISSION_REVIEW_PASSWORD;

  // Password check
  function handleAuth() {
    if (enteredPassword === REVIEW_PASSWORD) {
      setPasswordAccepted(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password.");
    }
  }

  // Load unpublished submissions
  useEffect(() => {
    if (passwordAccepted) {
      loadSubmissions();
    }
  }, [passwordAccepted]);

  async function loadSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("published", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubmittedArticles(data);
    }

    setLoading(false);
  }

  // Publish article
  async function publishArticle(id: string) {
    if (!confirm("Publish this article?")) return;

    const { error } = await supabase
      .from("articles")
      .update({ published: true })
      .eq("id", id);

    if (error) {
      alert("Failed to publish article.");
      return;
    }

    loadSubmissions(); // refresh list
  }

  // Delete submission
  async function deleteSubmission(id: string) {
    if (!confirm("Delete this submitted article?")) return;

    await supabase.from("articles").delete().eq("id", id);
    loadSubmissions();
  }

  // UI for password gate
  if (!passwordAccepted) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto mt-24 bg-neutral-800 p-8 rounded-2xl border border-neutral-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Enter Review Password
          </h2>

          <input
            type="password"
            placeholder="Enter admin review password"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 text-white border border-neutral-700 rounded-xl mb-4"
          />

          {authError && (
            <p className="text-red-500 mb-4">{authError}</p>
          )}

          <button
            onClick={handleAuth}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium"
          >
            Unlock Submissions
          </button>
        </div>
      </AdminLayout>
    );
  }


  // Main UI after password is correct
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-white mb-6">
        Unpublished Article Submissions
      </h2>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : submittedArticles.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No pending submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {submittedArticles.map((article) => (
            <div
              key={article.id}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 flex justify-between items-start"
            >
              <div>
                <h3 className="text-xl font-bold text-white">{article.title}</h3>
                <p className="text-neutral-400">{article.summary}</p>
                <p className="text-neutral-500 mt-2 text-sm">
                  Submitted on: {article.created_at.split("T")[0]}
                </p>
              </div>

              <div className="flex gap-2">
                {/* Publish */}
                <button
                  onClick={() => publishArticle(article.id)}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  <CheckCircle size={20} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteSubmission(article.id)}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
