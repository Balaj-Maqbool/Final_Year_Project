import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import "./css/bids.css";
import BidForm from "./Bids";
import { bidHandler } from "./services/bidHandler";

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
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [myBid, setMyBid] = useState<Bid | undefined>(undefined);

  // Fetch job
  useEffect(() => {              
    const fetchJob = async () => {
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`, {
        method: "GET",  
        headers: { "Content-Type": "application/json" },
      credentials: "include",
      });
      const data = await res.json();
      setJob(data.data);
    };

    fetchJob();
  }, [jobId]);

  // Fetch my bid for this job
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

  if (!job) return <p>Loading...</p>;

  return (
    <div className="job-details-container">
      {/* HEADER */}
      <div className="job-header">
        <h1>{job.title}</h1>
                            
        <div className="job-meta">
          <span>Posted recently</span>
          <Badge bg="secondary">{job.category}</Badge>
        </div>
      </div>

      {/* INFO */}
      <div className="job-info">
        <div className="info-box">
          <span className="icon">💰</span>
          <div>
            <p>Budget</p>
            <strong>PKR {job.budget.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="job-section">
        <h3>Job Description</h3>
        <p>{job.description}</p>
      </div>

      {/* BID FORM */}
      <BidForm
        jobId={job._id}
        existingBid={myBid}
        onSubmit={async (data) => {
          if (myBid) {
            const updated = await bidHandler.updateBid(myBid._id, data);
            setMyBid(updated);
          } else {
            const created = await bidHandler.createBid(data);
            setMyBid(created);
          }
        }}
      />
    </div>
  );
};

export default JobDetails;
