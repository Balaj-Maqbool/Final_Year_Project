import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Row,
  
  Container,
  Spinner,
  Badge,
  Stack,
} from "react-bootstrap";
import {  useNavigate } from "react-router-dom";

export interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
}

const BrowseJobs = () => {
                  

    const navigate=useNavigate()

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/jobs", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const result = await response.json();
        setJobs(result);
      } catch (error) {
        console.error("Error fetching jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  return (
    <Container className="mt-4">
      <h1 className="mb-4">Browse Jobs</h1>
      <h3>Browse and Apply to Opportunities</h3>

      <Stack direction="horizontal">
        <Row>
          {jobs.map((job) => (
         
            <Card key={job._id} className="h-100 shadow-sm m-2">
              <Card.Body>
                <Card.Title>{job.title}</Card.Title>
              
                <Badge bg="secondary" className="mb-2">
                  {job.category}
                </Badge>

                <Card.Text className="mt-2">
                  {job.description.substring(0, 100)}...
                </Card.Text>

                <p>
                  <strong>Budget:</strong> PKR {job.budget}
                </p>
                <p>
                  <strong>Deadline:</strong> {job.deadline}
                </p>
                 
                 
                <Button onClick={()=>navigate(`/freelancer/jobs/${job._id}`)} variant="primary" size="sm">
                  Apply / Bid
                </Button>

                <Button onClick={()=>console.log(job)}  className="m-2" variant="secondary" size="sm">
                  Details
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Stack>
    </Container>
  );
};

export default BrowseJobs;
