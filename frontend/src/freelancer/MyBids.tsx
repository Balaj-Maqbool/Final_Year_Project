import { useEffect, useState } from "react";
import { bidHandler } from "./services/bidHandler";
import "./css/MyBids.css";
import { Link } from "react-router-dom";

interface Bid {
  _id: string;
  job_id: string;
  bid_amount: number;
  message: string;
  timeline: {
      start_date: string;
      end_date: string;
  };
  status: "Pending" | "Accepted" | "Rejected";
  job: {
      title: string;
      budget: number;
      deadline: string;
  };
}

const MyBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await bidHandler.getAllMyBids();
        setBids(data);
      } catch (error) {
        console.error("Failed to load bids", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (loading) return <div className="my-bids-container">Loading...</div>;

  return (
    <div className="my-bids-container">
      <h1 className="my-bids-header">My Bids</h1>
      
      {bids.length === 0 ? (
        <div className="no-bids">
          <p>You haven't placed any bids yet.</p>
        </div>
      ) : (
        <div className="bids-grid">
          {bids.map((bid) => (
            <div key={bid._id} className="bid-card">
              <div className="bid-card-header">
                <h3 className="job-title">{bid.job.title}</h3>
                <span className={`status-badge status-${bid.status.toLowerCase()}`}>
                  {bid.status}
                </span>
              </div>
              
              <div className="bid-details">
                <div className="bid-info-row">
                  <span>Job Budget:</span>
                  <span className="bid-info-value">PKR {bid.job.budget.toLocaleString()}</span>
                </div>
                <div className="bid-info-row">
                  <span>My Bid:</span>
                  <span className="bid-info-value">PKR {bid.bid_amount.toLocaleString()}</span>
                </div>
                <div className="bid-info-row">
                  <span>Deadline:</span>
                  <span className="bid-info-value">
                    {new Date(bid.job.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link to={`/freelancer/jobs/${bid.job_id}`} className="view-job-btn">
                View Job & Bid
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
