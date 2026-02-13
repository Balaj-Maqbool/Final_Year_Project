import { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from "react-bootstrap";
import { data, Link } from "react-router-dom";
import { jobHandler } from "../client/services/jobHandler";
import "../dashboard.css";

interface Job {
  _id: string;
  title: string;
  status: string;
  deadline: string;
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

const ClientDashboard = () => {

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiRequest<DashboardData>("/dashboard/client");
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [data]);


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
          <h3>Client Dashboard</h3>
          <p>Here is what is happening with your projects today.</p>
        </div>

        {/* SUMMARY CARDS */}
        <Row className="mb-4 g-4">
          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Total Applications</Card.Title>
                <h2 className="summary-value">{data?.stats?.totalBidsReceived || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Active Jobs</Card.Title>
                <h2 className="summary-value">{data?.stats?.assignedJobs || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Completed Projects</Card.Title>
                <h2 className="summary-value">{data?.stats?.completedJobs || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Total Spent</Card.Title>
                <h2 className="summary-value">Rs {data?.stats?.totalBudgetSpent?.toLocaleString() || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ACTIVE / RECENT JOBS */}
        <div className="mb-4">
          <h4 className="section-title">Recent Projects</h4>
          <Card className="table-card">
            <Card.Body className="p-0">
              <Table responsive className="custom-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.recentJobs?.map((job) => (
                    <tr key={job._id}>
                      <td><strong>{job.title}</strong></td>
                      <td>
                        <Badge
                          className={`status-badge ${job.status === "Assigned" ? "success" : job.status === "Open" ? "info" : "secondary"}`}
                          bg=""
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td>{new Date(job.deadline).toLocaleDateString()}</td>
                      <td>
                        <Button size="sm" variant="light" as={Link as any} to={`/client/viewbids/${job._id}`}>View</Button>
                      </td>
                      <td>
                        <Button size="sm" variant="light" onClick={() => jobHandler.deleteJob(job._id)} >Delete </Button>
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentJobs || data.recentJobs.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">No recent projects</td>
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
                <Card.Title>Post a Job</Card.Title>
                <Card.Text>Find new freelancers to hire</Card.Text>

                <Button as={Link as any} to="/client/postjob" className="btn-primary-custom w-100">Post New Project</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="dashboard-card action-card">
              <Card.Body>
                <Card.Title>View Proposals</Card.Title>
                <Card.Text>Track proposals for your projects</Card.Text>
                <Button as={Link as any} to="/client/alljobs" className="btn-secondary-custom w-100">Review Proposals</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="dashboard-card action-card">
              <Card.Body>
                <Card.Title>View Projects</Card.Title>
                <Card.Text>View all your projects</Card.Text>
                <Button as={Link as any} to="/client/alljobs" className="btn-outline-custom w-100">View Projects</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ClientDashboard;