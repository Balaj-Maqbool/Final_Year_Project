import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jobHandler, type Job } from "../services/jobHandler";
import "./css/AllJobs.css";

const AllJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobHandler.getAllMyJobs();
        setJobs(data.docs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

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
                  disabled={job.status !== "Assigned"}
                  onClick={() => navigate(`/client/tasks/${job._id}`)}
                >
                  View Tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};


export default AllJobs