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
      <Container className="m-4">
        <h3 className="mb-4">Freelancer Dashboard</h3>

        {/* SUMMARY CARDS */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Total Applications</Card.Title>
                <h2>{data?.totalApplications || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Active Jobs</Card.Title>
                <h2>{data?.activeJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Completed Jobs</Card.Title>
                <h2>{data?.completedJobsCount || 0}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Total Earnings</Card.Title>
                <h2>{data?.totalEarnings || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ACTIVE JOBS */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Active Jobs</Card.Title>

            <Table striped hover responsive>
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
                    <td>{job.title}</td>
                    <td>
                      <Badge
                        bg={job.status === "In Progress" ? "warning" : "info"}
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td>{job.deadline}</td>
                    <td>
                      <Button size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* QUICK ACTIONS */}
        <Row>
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Browse Jobs</Card.Title>
                <Card.Text>Find new projects to apply for</Card.Text>
                <Button as={Link as any} to="/freelancer/jobs" variant="primary">Browse</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>My Bids</Card.Title>
                <Card.Text>Track your submitted proposals</Card.Text>
                <Button as={Link as any} to="/freelancer/my-bids" variant="secondary">View Bids</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Profile</Card.Title>
                <Card.Text>Update your skills and bio</Card.Text>
                <Button variant="outline-primary">Edit Profile</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
