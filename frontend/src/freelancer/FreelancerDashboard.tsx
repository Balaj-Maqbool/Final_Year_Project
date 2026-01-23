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
  id: string;
  title: string;
  status: string;
  deadline: string;
}

interface dashboarsData {
  totalApplications: number;
  activeJobsCount: number;
  completedJobsCount: number;
  totalEarnings: number;
  activeJobsList: Job[];
}

const Dashboard = () => {
  const [data, setData] = useState<dashboarsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        // const token =localStorage.getItem('token')//no need for localstorage now that cookies are being used
      try {
        // console.log("TOKEN:", localStorage.getItem("token"));

      const response = await fetch(
          "http://localhost:8000/api/v1/dashboard/freelancer",
          {
            method: "GET",
            // This is the key for Cookies:
            credentials: "include", 
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  //show spinner animation while loading
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
                <h2 className="summary-value">{data?.totalApplications || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Active Projects</Card.Title>
                <h2 className="summary-value">{data?.activeJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Completed</Card.Title>
                <h2 className="summary-value">{data?.completedJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Total Earnings</Card.Title>
                <h2 className="summary-value">Rs {data?.totalEarnings || 0}</h2>
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
                    </tr>
                </thead>

                <tbody>
                    {data?.activeJobsList?.map((job) => (
                    <tr key={job.id}>
                        <td><strong>{job.title}</strong></td>
                        <td>
                        <Badge
                            className={`status-badge ${job.status === "In Progress" ? "warning" : "info"}`}
                            bg="" // removing default bg to use custom class
                        >
                            {job.status}
                        </Badge>
                        </td>
                        <td>{new Date(job.deadline).toLocaleDateString()}</td>
                        <td>
                        <Button size="sm" variant="light">View Details</Button>
                        </td>
                    </tr>
                    ))}
                    {(!data?.activeJobsList || data.activeJobsList.length === 0) && (
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
