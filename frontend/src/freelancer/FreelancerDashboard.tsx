import { useQuery } from "@tanstack/react-query";
import { Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiRequest } from "../services/apiClient";
import { getJobVisual, getStatusPillClass } from "../utils/jobVisuals";
import "../dashboard.css";
import "../css/buttons.css";
import { FaClipboardList, FaBriefcase, FaCheckCircle, FaMoneyBillWave, FaSearch, FaInbox, FaUserAlt, FaComments } from "react-icons/fa";

interface Job {
  _id: string;
  title: string;
  status: string;
  deadline: string;
  budget?: number;
}

interface DashboardStats {
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
  totalEarnings: number;
  completedJobsCount: number;
  activeJobsCount: number;
}

interface DashboardData {
  stats: DashboardStats;
  activeJobs: Job[];
}


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FreelancerDashboard = () => {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["freelancerDashboard"],
    queryFn: async () => apiRequest<DashboardData>("/dashboard/freelancer"),
    staleTime: 5000,
  });

  if (isLoading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  const stats = [
    { label: "MY\nAPPLICATIONS",  value: data?.stats?.totalBids ?? 0,              color: "blue",   icon: <FaClipboardList /> },
    { label: "ACTIVE\nPROJECTS",  value: data?.stats?.activeJobsCount ?? 0,         color: "teal",   icon: <FaBriefcase /> },
    { label: "COMPLETED",         value: data?.stats?.completedJobsCount ?? 0,      color: "purple", icon: <FaCheckCircle /> },
    { label: "TOTAL\nEARNINGS",   value: `Rs ${(data?.stats?.totalEarnings ?? 0).toLocaleString()}`, color: "orange", icon: <FaMoneyBillWave /> },
  ];

  return (
    <div className="dashboard-container">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* ---- Header ---- */}
        <motion.div variants={item} className="dashboard-header">
          <h3>Freelancer Dashboard</h3>
          <p>Welcome back! Here's an overview of your activity.</p>
        </motion.div>

        {/* ---- Gradient Stat Cards ---- */}
        <motion.div variants={item}>
          <Row className="g-3 mb-4">
            {stats.map((s) => (
              <Col key={s.label} xs={12} sm={6} lg={3}>
                <motion.div
                  className={`stat-card-wrap ${s.color}`}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="stat-wave" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="20"  r="60" fill="white" />
                    <circle cx="80"  cy="100" r="40" fill="white" />
                  </svg>
                  <div className="stat-icon-circle">{s.icon}</div>
                  <div className="stat-content">
                    {s.label.split("\n").map((line, i) => (
                      <span key={i} className="stat-label-top">{line}</span>
                    ))}
                    <div className="stat-value">{s.value}</div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* ---- Active Jobs ---- */}
        <motion.div variants={item} className="mb-4">
          <div className="section-header">
            <h4 className="section-title">Current Active Jobs</h4>
            <Link to="/freelancer/jobs" className="section-view-all">Browse More &rsaquo;</Link>
          </div>

          {(!data?.activeJobs || data.activeJobs.length === 0) ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}><FaSearch /></div>
              <p>No active jobs yet. Browse open projects and place your bid!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {data.activeJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  className="project-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Top row */}
                  <div className="project-card-top">
                    <div className={`project-icon-circle ${getJobVisual(job).color}`}>
                      {getJobVisual(job).icon}
                    </div>
                    <div className="project-info">
                      <p className="project-title">{job.title}</p>
                      <span className="project-id">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    {job.budget && (
                      <span className="project-amount">Rs {job.budget.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Mid: status + CTA */}
                  <div className="project-card-mid">
                    <span className={`job-status-pill ${getStatusPillClass(job.status)}`}>
                      {job.status === "Assigned" ? "In Progress" : job.status}
                    </span>
                    <Link to={`/freelancer/jobs/${job._id}`} className="btn-view-details-card">
                      View Details
                    </Link>
                  </div>

                  {/* Bottom actions */}
                  <div className="project-card-actions">
                    <Link to={`/freelancer/jobs/${job._id}/tasks`} className="btn-pc tasks">Tasks</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ---- Quick Actions ---- */}
        <motion.div variants={item}>
          <div className="section-header">
            <h4 className="section-title">Quick Actions</h4>
          </div>
          <Row className="g-3">
            <Col md={3}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "#6366f1" }}><FaSearch /></p>
                  <div className="card-title">Find Work</div>
                  <p className="card-text">Browse new projects to apply for</p>
                  <Link to="/freelancer/jobs" className="btn-modern primary md w-100">Browse Jobs</Link>
                </div>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "#10b981" }}><FaInbox /></p>
                  <div className="card-title">My Proposals</div>
                  <p className="card-text">Track status of your bids</p>
                  <Link to="/freelancer/my-bids" className="btn-modern ghost md w-100">View Bids</Link>
                </div>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "#f59e0b" }}><FaUserAlt /></p>
                  <div className="card-title">My Profile</div>
                  <p className="card-text">Update skills and portfolio</p>
                  <Link to="/profile" className="btn-modern success md w-100">Edit Profile</Link>
                </div>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "#8b5cf6" }}><FaComments /></p>
                  <div className="card-title">Messages</div>
                  <p className="card-text">Chat with your clients</p>
                  <Link to="/freelancer/chat" className="btn-modern purple md w-100">Open Chat</Link>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FreelancerDashboard;
