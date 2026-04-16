import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jobHandler, type Job } from "../services/jobHandler";
import "../css/buttons.css";
import "./css/BrowseJobs.css";

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobHandler.getAllJobs().then((data) => {
      setJobs(data.docs);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="browse-jobs-container">
      <Container>
        <h1 className="browse-title">Browse Jobs</h1>
        <p className="browse-sub">Find the perfect opportunity and place your bid.</p>

        <div className="browse-grid">
          {jobs.map((job) => (
            <div key={job._id} className="browse-card">
              {/* Category Badge */}
              {job.category && (
                <span className="browse-badge">{job.category}</span>
              )}

              <h3 className="browse-card-title">{job.title}</h3>

              <p className="browse-card-desc">
                {job.description.substring(0, 120)}...
              </p>

              <div className="browse-meta">
                <div className="browse-meta-item">
                  <span className="browse-meta-label">Budget</span>
                  <span className="browse-meta-value budget-green">PKR {job.budget?.toLocaleString()}</span>
                </div>
                <div className="browse-meta-item">
                  <span className="browse-meta-label">Deadline</span>
                  <span className="browse-meta-value">{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="browse-actions">
                <button
                  className="btn-modern primary sm browse-btn"
                  onClick={() => navigate(`/freelancer/jobs/${job._id}`)}
                >
                  🚀 Apply / Bid
                </button>
                <button
                  className="btn-modern ghost sm browse-btn"
                  onClick={() => navigate(`/freelancer/jobs/${job._id}`)}
                >
                  Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--secondary-color)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <p>No jobs available right now. Check back soon!</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrowseJobs;
