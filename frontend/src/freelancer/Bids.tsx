import { useRef, useState, type FormEvent } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useAuthStore } from "../store/useAuthStore";
import { aiHandler } from "../services/aiHandler";
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
    timeline?: {
      start_date: string;
      end_date: string;
    };
    status: "Pending" | "Accepted" | "Rejected";
  };
}

const BidForm = ({ jobId, jobDescription, onSubmit, existingBid }: Props) => {
  const { user } = useAuthStore();
  const amountRef = useRef<HTMLInputElement>(null);
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
      // Fetch freelancer's full profile to get bio/skills
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/profile/${user?._id}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      const profile = data.data;

      // Call AI Handler
      const aiResponse = await aiHandler.generateProposal(jobDescription, profile);
      if (proposalRef.current) {
        proposalRef.current.value = aiResponse.proposal_text;
      }
    } catch (err) {
      console.error("AI Generation Error", err);
      alert("Failed to generate proposal with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isEditable) return;

    console.log("Submitting bid as:", user?.role);

    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const amount = Number(amountRef.current!.value);
    if (!amount || amount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    const message = proposalRef.current!.value;
    if (!message.trim()) {
      alert("Please enter a proposal message");
      return;
    }

    onSubmit({
      job_id: jobId,
      bid_amount: amount,
      message: message,
      timeline: {
        start_date: startDate,
        end_date: endDate.toISOString(),
      },
    });
  };

  return (
    <div className="job-section">
      <h3>
        {isEditMode ? "Update Your Bid" : "Submit Your Proposal"}
      </h3>

      {!isEditable && (
        <p className="text-muted">
          This bid can no longer be edited because it is{" "}
          <strong>{existingBid?.status}</strong>.
        </p>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Bid Amount (PKR)</Form.Label>
          <Form.Control
            ref={amountRef}
            type="number"
            defaultValue={existingBid?.bid_amount}
            placeholder="Enter your bid"
            disabled={!isEditable}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="mb-0">Proposal Message</Form.Label>
            {isEditable && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                style={{ borderColor: '#8e44ad', color: '#8e44ad' }}
              >
                {aiLoading ? <Spinner size="sm" animation="border" /> : "✨ Write with AI"}
              </Button>
            )}
          </div>
          <Form.Control
            ref={proposalRef}
            as="textarea"
            rows={8}
            defaultValue={existingBid?.message}
            placeholder="Write your proposal..."
            disabled={!isEditable}
          />
        </Form.Group>

        {isEditable && (
          <Button variant="primary" type="submit">
            {isEditMode ? "Update Bid" : "Submit Proposal"}
          </Button>
        )}
      </Form>
    </div>
  );
};

export default BidForm;
