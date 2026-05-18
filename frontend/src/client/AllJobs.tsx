import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container, Spinner, Modal, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jobHandler, type Job } from "../services/jobHandler";
import { paymentHandler } from "../services/paymentHandler";
import "./css/AllJobs.css";

const AllJobs = () => {
  const navigate = useNavigate();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["allMyJobs"],
    queryFn: () => jobHandler.getAllMyJobs(),
    staleTime: 5 * 60 * 1000, // 5 minutes caching
  });

  const jobs = data?.docs || [];

  const [fundingJobId, setFundingJobId] = useState<string | null>(null);

  // Escrow modal state
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [escrowAmount, setEscrowAmount] = useState<number>(0);

  const openEscrowModal = (job: Job) => {
    setSelectedJob(job);
    // Default to the agreed price (bid amount) or budget
    setEscrowAmount(job.agreed_price && job.agreed_price > 0 ? job.agreed_price : job.budget);
    setShowEscrowModal(true);
  };

  const handleFundJob = async () => {
    if (!selectedJob) return;
    if (escrowAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setFundingJobId(selectedJob._id);
      setShowEscrowModal(false);
      const res = await paymentHandler.createCheckoutSession(selectedJob._id, escrowAmount);
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setFundingJobId(null);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="all-jobs-container">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="page-title">Your Projects</h1>
        </div>

        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="card-content">
                <span className="job-category-badge">{job.category}</span>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-description">
                  {job.description}
                </p>

                <div className="job-meta">
                  <div className="meta-item">
                    <span className="meta-label">Budget</span>
                    <span className="meta-value budget-highlight">PKR {job.budget}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Deadline</span>
                    <span className="meta-value">{new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className={`meta-value ${
                      job.status === "Open" ? "text-info" :
                      job.status === "Assigned" ? "text-warning" :
                      job.status === "Completed" ? "text-success" : "text-muted"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  {job.status === "Assigned" && job.contract_status && (
                    <div className="meta-item">
                      <span className="meta-label">Contract Status</span>
                      <span className={`meta-value ${job.contract_status === "Pending" ? "text-warning" : "text-success"}`}>
                        {job.contract_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-view-bids"
                  onClick={() => navigate(`/client/view-bids/${job._id}`)}
                >
                  View Bids
                </button>
                <button
                  className="btn-view-tasks"
                  disabled={job.status !== "Assigned" || job.contract_status === "Pending"}
                  onClick={() => navigate(`/client/tasks/${job._id}`)}
                >
                  View Tasks
                </button>
                {job.status === "Assigned" && (!job.contract_status || job.contract_status === "Pending") && (
                  <button
                    className="btn-fund-escrow"
                    disabled={fundingJobId === job._id}
                    onClick={() => openEscrowModal(job)}
                  >
                    {fundingJobId === job._id ? <Spinner size="sm" animation="border" /> : "Fund Escrow"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Fund Escrow Modal */}
      <Modal
        show={showEscrowModal}
        onHide={() => setShowEscrowModal(false)}
        centered
        className="escrow-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Fund Escrow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <p className="text-muted mb-3">
                You are funding escrow for: <strong>{selectedJob.title}</strong>
              </p>
              <div className="escrow-info-row mb-3">
                <div>
                  <small className="text-muted">Original Budget</small>
                  <div className="fw-bold text-success">PKR {selectedJob.budget.toLocaleString()}</div>
                </div>
                {selectedJob.agreed_price && selectedJob.agreed_price > 0 && selectedJob.agreed_price !== selectedJob.budget && (
                  <div>
                    <small className="text-muted">Bid Amount</small>
                    <div className="fw-bold text-primary">PKR {selectedJob.agreed_price.toLocaleString()}</div>
                  </div>
                )}
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Agreed Amount (PKR)</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(Number(e.target.value))}
                  placeholder="Enter the agreed amount"
                  className="escrow-amount-input"
                />
                <Form.Text className="text-muted">
                  You can adjust this if you and the freelancer agreed on a different price.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEscrowModal(false)}>
            Cancel
          </Button>
          <Button
            className="btn-confirm-escrow"
            onClick={handleFundJob}
            disabled={escrowAmount <= 0}
          >
            Proceed to Payment — PKR {escrowAmount.toLocaleString()}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};


export default AllJobs