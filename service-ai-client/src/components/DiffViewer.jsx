import { useEffect, useState } from "react";
import * as Diff2Html from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import api from "../services/api";

const V = (p) => `var(--${p})`;

export default function DiffViewer({ prId, hasAiChanges }) {
  const [diffText, setDiffText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiff = async () => {
      try {
        setLoading(true);
        // The backend returns raw text
        const response = await api.get(`/pr/${prId}/diff`);
        setDiffText(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load diff");
      } finally {
        setLoading(false);
      }
    };
    
    if (prId) fetchDiff();
  }, [prId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: V("db2"), borderRadius: "16px", border: `1px solid ${V("dborder")}` }}>
        <p style={{ color: V("dt2"), fontSize: "14px" }}>Loading code changes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "rgba(248,113,113,0.08)", borderRadius: "16px", border: "1px solid rgba(248,113,113,0.2)" }}>
        <p style={{ color: "var(--dred)", fontSize: "14px" }}>{error}</p>
      </div>
    );
  }

  if (!diffText || typeof diffText !== "string") {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: V("db2"), borderRadius: "16px", border: `1px solid ${V("dborder")}` }}>
        <p style={{ color: V("dt2"), fontSize: "14px" }}>No code changes found.</p>
      </div>
    );
  }

  const html = Diff2Html.html(diffText, {
    drawFileList: true,
    matching: "lines",
    outputFormat: "side-by-side",
    theme: "dark",
  });

  return (
    <div className="diff-viewer-container" style={{ marginTop: "24px", borderRadius: "16px", overflow: "hidden", border: `1px solid ${V("dborder")}` }}>
      {/* Split Header for Left/Right sides */}
      <div style={{ display: "flex", width: "100%", background: V("db3"), padding: "12px 16px", borderBottom: `1px solid ${V("dborder")}` }}>
        <div style={{ flex: 1, fontWeight: 600, color: V("dt2"), fontSize: "13px", paddingLeft: "16px" }}>
          {hasAiChanges ? "Your Original Code" : "Base Branch"}
        </div>
        <div style={{ flex: 1, fontWeight: 600, color: hasAiChanges ? "var(--dgreen)" : V("dt"), fontSize: "13px", paddingLeft: "16px" }}>
          {hasAiChanges ? "✨ AI Suggested Fixes" : "Your Code"}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .d2h-wrapper {
          background-color: var(--db2);
        }
        .d2h-file-header {
          background-color: var(--db3);
          border-bottom: 1px solid var(--dborder);
          color: var(--dt);
        }
        .d2h-file-list-wrapper {
          margin-bottom: 0;
          background-color: var(--db3);
          border: none;
        }
        .d2h-file-list-header {
          background-color: var(--dborder);
          color: var(--dt);
          border-bottom: none;
        }
        .d2h-file-name {
          color: var(--da);
        }
        .d2h-code-line {
          font-family: 'Fira Code', monospace;
          font-size: 12px;
        }
        .d2h-code-side-line {
          padding: 0 4px;
        }
        /* Make it fit nicely inside the dark theme */
        .d2h-diff-tbody {
          border-color: var(--dborder);
        }
        .d2h-code-side-linenumber {
          background-color: var(--db3);
          border-color: var(--dborder);
          color: var(--dt3);
        }
        .d2h-code-side-emptyplaceholder {
          background-color: var(--db2);
        }
      `}} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
