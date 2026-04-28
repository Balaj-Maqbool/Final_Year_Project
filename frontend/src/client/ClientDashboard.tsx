import { useQuery } from "@tanstack/react-query";
import { Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { jobHandler } from "../services/jobHandler";
import { motion } from "framer-motion";
import { apiRequest } from "../services/apiClient";
import { getJobVisual, getStatusPillClass, getStatusLabel } from "../utils/jobVisuals";
import "../dashboard.css";
import "../css/buttons.css";
import { FaClipboardList, FaBriefcase, FaCheckCircle, FaMoneyBillWave, FaRocket, FaInbox, FaFolderOpen } from "react-icons/fa";

interface Job {
  _id: string;
  title: string;
  status: string;
  deadline: string;
  budget?: number;
  contract_status?: string;
}

interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  assignedJobs: number;
  completedJobs: number;
  totalBudgetSpent: number;
  totalBidsReceived: number;
  pendingBids: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentJobs: Job[];
}


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ClientDashboard = () => {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["clientDashboard"],
    queryFn: async () => apiRequest<DashboardData>("/dashboard/client"),
    staleTime: 5000,
  });

  if (isLoading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  const stats = [
    { label: "TOTAL\nAPPLICATIONS", value: data?.stats?.totalBidsReceived ?? 0, color: "blue",   icon: <FaClipboardList /> },
    { label: "ACTIVE\nJOBS",        value: data?.stats?.assignedJobs ?? 0,       color: "teal",   icon: <FaBriefcase /> },
    { label: "COMPLETED\nPROJECTS", value: data?.stats?.completedJobs ?? 0,      color: "purple", icon: <FaCheckCircle /> },
    { label: "TOTAL\nSPENT",        value: `Rs ${(data?.stats?.totalBudgetSpent ?? 0).toLocaleString()}`, color: "orange", icon: <FaMoneyBillWave /> },
  ];

  return (
    <div className="dashboard-container">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* ---- Header ---- */}
        <motion.div variants={item} className="dashboard-header">
          <h3>Client Dashboard</h3>
          <p>Here is what is happening with your projects today.</p>
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
                  {/* Decorative circle behind */}
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

        {/* ---- Recent Projects ---- */}
        <motion.div variants={item} className="mb-4">
          <div className="section-header">
            <h4 className="section-title">Recent Projects</h4>
            <Link to="/client/alljobs" className="section-view-all">View All &rsaquo;</Link>
          </div>

          {(!data?.recentJobs || data.recentJobs.length === 0) ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}><FaFolderOpen /></div>
              <p>No recent projects yet. Post a job to get started!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {data.recentJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  className="project-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Top: icon + title + budget */}
                  <div className="project-card-top">
                    <div className={`project-icon-circle ${getJobVisual(job).color}`}>
                      {getJobVisual(job).icon}
                    </div>
                    <div className="project-info">
                      <p className="project-title">{job.title}</p>
                      <span className="project-id">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    {job.budget && (
                      <span className="project-amount">Rs {job.budget.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Middle: status badge + primary CTA */}
                  <div className="project-card-mid">
                    <span className={`job-status-pill ${getStatusPillClass(job.status)}`}>
                      {getStatusLabel(job)}
                    </span>
                    <Link
                      to={`/client/view-bids/${job._id}`}
                      className="btn-view-details-card"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Bottom actions */}
                  <div className="project-card-actions">
                    <Link to={`/client/tasks/${job._id}`} className="btn-pc tasks">Tasks</Link>
                    <Link to={`/client/chat/${job._id}`}  className="btn-pc chat">Chat</Link>
                    <button
                      className="btn-pc delete"
                      onClick={() => jobHandler.deleteJob(job._id)}
                    >
                      Delete
                    </button>
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
            <Col md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}><FaRocket /></p>
                  <div className="card-title">Post a Job</div>
                  <p className="card-text">Find new freelancers to hire</p>
                  <Link to="/client/postjob" className="btn-modern primary md w-100">Post New Project</Link>
                </div>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}><FaInbox /></p>
                  <div className="card-title">View Proposals</div>
                  <p className="card-text">Track proposals for your projects</p>
                  <Link to="/client/alljobs" className="btn-modern ghost md w-100">Review Proposals</Link>
                </div>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ height: "100%" }}>
                <div className="action-card">
                  <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}><FaFolderOpen /></p>
                  <div className="card-title">View Projects</div>
                  <p className="card-text">View all your posted projects</p>
                  <Link to="/client/alljobs" className="btn-modern success md w-100">View Projects</Link>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;