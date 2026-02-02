import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Badge,
  Container,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../dashboard.css";

interface Job {
  _id: string; // Backend uses _id
  title: string;
  status: string;
  deadline: string;
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
  // pendingTasks: any[]; // define if needed
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/dashboard/freelancer",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        // Backend returns { statusCode, data: { stats: ..., activeJobs: ..., pendingTasks: ... }, message, success }
        setData(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="mt-5 text-center">
        <Spinner animation="border" />
      </div>
    );

  return (
    <>
      <Container className="dashboard-container">
        <div className="dashboard-header">
          <h3>Freelancer Dashboard</h3>
          <p>Welcome back! Here's an overview of your activity.</p>
        </div>

        {/* SUMMARY CARDS */}
        <Row className="mb-4 g-4">
          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">My Applications</Card.Title>
                <h2 className="summary-value">{data?.stats?.totalBids || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Active Projects</Card.Title>
                <h2 className="summary-value">{data?.stats?.activeJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Completed</Card.Title>
                <h2 className="summary-value">{data?.stats?.completedJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Total Earnings</Card.Title>
                <h2 className="summary-value">Rs {data?.stats?.totalEarnings?.toLocaleString() || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ACTIVE JOBS */}
        <div className="mb-4">
          <h4 className="section-title">Current Active Jobs</h4>
          <Card className="table-card">
            <Card.Body className="p-0">
              <Table responsive className="custom-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Action</th>
                    <th>Tasks</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.activeJobs?.map((job) => (
                    <tr key={job._id}>
                      <td><strong>{job.title}</strong></td>
                      <td>
                        <Badge
                          className={`status-badge ${job.status === "Assigned" ? "success" : job.status === "Open" ? "info" : "secondary"}`}
                          bg=""
                        >
                          {job.status === "Assigned" ? "In Progress" : job.status}
                        </Badge>
                      </td>
                      <td>{new Date(job.deadline).toLocaleDateString()}</td>
                      <td>
                        <Button size="sm" variant="light" as={Link as any} to={`/freelancer/jobs/${job._id}`}>View Details</Button>
                      </td>
                      <td>
                        <Button size="sm" variant="light" as={Link as any} to={`/freelancer/jobs/${job._id}/tasks`}>View Tasks</Button>
                      </td>
                    </tr>
                  ))}
                  {(!data?.activeJobs || data.activeJobs.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">No active jobs found</td>
                    </tr>
                    
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        {/* QUICK ACTIONS */}
        <h4 className="section-title">Quick Actions</h4>
        <Row className="g-4">
          <Col md={4}>
            <Card className="dashboard-card action-card">
              <Card.Body>
                <Card.Title>Find Work</Card.Title>
                <Card.Text>Browse new projects to apply for</Card.Text>
                <Button as={Link as any} to="/freelancer/jobs" className="btn-primary-custom w-100">Browse Jobs</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="dashboard-card action-card">
              <Card.Body>
                <Card.Title>My Proposals</Card.Title>
                <Card.Text>Track status of your bids</Card.Text>
                <Button as={Link as any} to="/freelancer/my-bids" className="btn-secondary-custom w-100">View Bids</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="dashboard-card action-card">
              <Card.Body>
                <Card.Title>My Profile</Card.Title>
                <Card.Text>Update skills and portfolio</Card.Text>
                <Button as={Link as any} to="/profile" className="btn-outline-custom w-100">Edit Profile</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
