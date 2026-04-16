import { useRef, useState, type FormEvent } from "react";
import { Spinner } from "react-bootstrap";
import { useAuthStore } from "../store/useAuthStore";
import { aiHandler } from "../services/aiHandler";
import { BACKEND_URL } from "../config";
import "../css/forms.css";

export interface BidData {
  job_id: string;
  bid_amount: number;
  message: string;
  timeline: {
    start_date: string;
    end_date: string;
  };
}

interface Props {
  jobId: string;
  jobDescription?: string;
  onSubmit: (data: BidData) => void;
  existingBid?: {
    bid_amount: number;
    message: string;
    timeline?: { start_date: string; end_date: string };
    status: "Pending" | "Accepted" | "Rejected";
  };
}

const BidForm = ({ jobId, jobDescription, onSubmit, existingBid }: Props) => {
  const { user } = useAuthStore();
  const amountRef  = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLTextAreaElement>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const isEditMode = !!existingBid;
  const isEditable = existingBid?.status === "Pending" || !existingBid;

  const handleAIGenerate = async () => {
    if (!jobDescription) {
      alert("Job description is not available to generate a proposal.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/users/profile/${user?._id}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      const profile = data.data;
      const aiResponse = await aiHandler.generateProposal(jobDescription, profile);
      if (proposalRef.current) proposalRef.current.value = aiResponse.proposal_text;
    } catch (err) {
      alert("Failed to generate proposal with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;
    const amount = Number(amountRef.current!.value);
    if (!amount || amount <= 0) { alert("Please enter a valid bid amount"); return; }
    const message = proposalRef.current!.value;
    if (!message.trim()) { alert("Please enter a proposal message"); return; }
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    onSubmit({
      job_id: jobId,
      bid_amount: amount,
      message,
      timeline: { start_date: startDate, end_date: endDate.toISOString() },
    });
  };

  return (
    <div className="mf-card" style={{ maxWidth: "100%", borderRadius: "16px", margin: 0 }}>
      {/* Header */}
      <div className="mf-badge">{isEditMode ? "Update Bid" : "New Proposal"}</div>
      <h2 className="mf-heading" style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        {isEditMode ? "Update Your Bid" : "Submit Your Proposal"}
      </h2>

      {!isEditable && (
        <div className="mf-error" style={{ marginBottom: "1rem" }}>
          This bid can no longer be edited — it is <strong>{existingBid?.status}</strong>.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Bid Amount */}
        <div className="mf-group">
          <label className="mf-label">Bid Amount (PKR)</label>
          <div className="mf-input-wrap">
            <span className="mf-input-icon">₨</span>
            <input
              ref={amountRef}
              type="number"
              className="mf-input"
              defaultValue={existingBid?.bid_amount}
              placeholder="Enter your bid amount"
              disabled={!isEditable}
              required
            />
          </div>
        </div>

        {/* Proposal */}
        <div className="mf-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.55rem" }}>
            <label className="mf-label" style={{ margin: 0 }}>Proposal Message</label>
            {isEditable && (
              <button
                type="button"
                className="mf-ai-btn"
                style={{ padding: "0.38rem 0.9rem", fontSize: "0.78rem", borderRadius: "8px" }}
                onClick={handleAIGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? <Spinner size="sm" animation="border" /> : "✨ Write with AI"}
              </button>
            )}
          </div>
          <textarea
            ref={proposalRef}
            className="mf-input mf-textarea"
            rows={8}
            defaultValue={existingBid?.message}
            placeholder="Explain why you're the best fit for this project, your relevant experience, and your approach..."
            disabled={!isEditable}
          />
        </div>

        {isEditable && (
          <button type="submit" className="mf-submit">
            {isEditMode ? "Update Bid" : "🚀 Submit Proposal"}
          </button>
        )}
      </form>
    </div>
  );
};

export default BidForm;
