import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from "react-bootstrap";
import  {  Link } from "react-router-dom";
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

const ClientDashboard = () => {

const [data ,setData] = useState<dashboarsData | null>(null);
const [loading ,setLoading] = useState(true);

useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/v1/dashboard/client", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
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
                <h2 className="summary-value">{data?.totalApplications || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Active Jobs</Card.Title>
                <h2 className="summary-value">{data?.activeJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Completed Projects</Card.Title>
                <h2 className="summary-value">{data?.completedJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="dashboard-card">
              <Card.Body>
                <Card.Title className="card-title">Total Spent</Card.Title>
                <h2 className="summary-value">Rs {data?.totalEarnings || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ACTIVE JOBS */}
        <div className="mb-4">
           <h4 className="section-title">Your Active Projects</h4>
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
                            bg=""
                        >
                            {job.status}
                        </Badge>
                        </td>
                        <td>{new Date(job.deadline).toLocaleDateString()}</td>
                        <td>
                        <Button size="sm" variant="light">View</Button>
                        </td>
                    </tr>
                    ))}
                    {(!data?.activeJobsList || data.activeJobsList.length === 0) && (
                        <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">No active projects</td>
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
                
                <Button as={Link as any} to="/client/postjob" className="btn-primary-custom w-100">Browse Projects</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="dashboard-card action-card">
              <Card.Body>
                <Card.Title>View Proposals</Card.Title>
                <Card.Text>Track proposals for your projects</Card.Text>
                <Button as={Link as any} to="/client/viewbids" className="btn-secondary-custom w-100">Review Proposals</Button>
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