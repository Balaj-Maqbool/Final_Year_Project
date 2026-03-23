import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./css/bids.css"; // Keeping this if needed for BidForm
import "./css/JobDetails.css"; // New custom CSS
import BidForm from "./Bids";
import { bidHandler } from "../services/bidHandler";

interface Job {
  _id: string;
  title: string;
  
  description: string;
  budget: number;
  deadline: string;
  category: string;
}

interface Bid {
  _id: string;
  bid_amount: number;
  message: string;
  timeline?: {
    start_date: string;
    end_date: string;
  };
  status: "Pending" | "Accepted" | "Rejected";
}

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [myBid, setMyBid] = useState<Bid | undefined>(undefined);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        setJob(data.data);
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
    const fetchMyBid = async () => {
      if (!jobId) return;
      try {
        const bid = await bidHandler.getMyBidForJob(jobId);
        setMyBid(bid || undefined);
      } catch {
        setMyBid(undefined);
      }
    };

    fetchMyBid();
  }, [jobId]);


  if (!job) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;


  const confirmedJobId = job._id;

  return (
    <div className="job-details-container">
      {/* Header Section */}
      <div className="job-header-card">
        <div className="job-meta-row mb-3">
          <span className="job-category-badge">{job.category}</span>
          <span className="job-posted-date">Posted recently</span>
        </div>
        <h1 className="job-title-large">{job.title}</h1>
      </div>

      {/* Highlights Grid */}
      <div className="job-highlights-grid">
        <div className="highlight-card">
          <div className="highlight-icon">💰</div>
          <div className="highlight-content">
            <label>Budget</label>
            <span>PKR {job.budget.toLocaleString()}</span>
          </div>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon deadline-icon">📅</div>
          <div className="highlight-content">
            <label>Deadline</label>
            <span>{new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="job-description-section">
        <h3 className="section-heading">Project Description</h3>
        <p className="description-text">{job.description}</p>
      </div>

      {/* Bid Form Section */}
      <div className="bid-section-wrapper">
        <BidForm
          jobId={confirmedJobId}
          jobDescription={job.description}
          existingBid={myBid}
          onSubmit={async (data) => {
            try {
              if (myBid) {
                const updated = await bidHandler.updateBid(myBid._id, data);
                setMyBid(updated);
              } else {
                const created = await bidHandler.createBid(data, confirmedJobId);
                setMyBid(created);
              }
            } catch (error) {
              console.error("Submission failed:", error);
              alert("Failed to save bid. Please try again.");
            }
          }}
        />
      </div>
    </div>
  );
};

export default JobDetails;