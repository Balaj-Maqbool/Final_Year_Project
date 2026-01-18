import { useRef, type FormEvent } from "react";
import { Button, Form } from "react-bootstrap";
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

const BidForm = ({ jobId, onSubmit, existingBid }: Props) => {
  const amountRef = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!existingBid;
  const isEditable = existingBid?.status === "Pending" || !existingBid;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;

    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    onSubmit({
      job_id: jobId,
      bid_amount: Number(amountRef.current!.value),
      message: proposalRef.current!.value,
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
          <Form.Label>Proposal Message</Form.Label>
          <Form.Control
            ref={proposalRef}
            as="textarea"
            rows={4}
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
