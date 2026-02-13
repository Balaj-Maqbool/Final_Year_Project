import { useEffect, useState } from "react";
import { Badge, Container } from "react-bootstrap";
import { jobHandler, type Job } from "./services/jobHandler";
import { useParams } from "react-router-dom";
import GetBids from "./GetBids";


const ViewBids = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [job, setJob] = useState<Job | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                const res = await jobHandler.getJob(jobId);
                setJob(res);
            } catch (error) {
                console.error("Error fetching job:", error);
            }
        };

        fetchJob();
    }, [jobId]);

    return (
        <Container>
            <div className="job-details-container my-4">
                <div className="job-header mb-4">
                    <h1>{job?.title}</h1>
                    <div className="job-meta">
                        <span>Posted recently</span>
                        <Badge bg="secondary">{job?.category}</Badge>
                    </div>
                </div>

                <div className="job-info mb-4">
                    <div className="info-box">
                        <span className="icon">💰</span>
                        <div>
                            <p>Budget</p>
                            <strong>PKR {job?.budget.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div className="job-section">
                    <h3>Job Description</h3>
                    <p>{job?.description}</p>
                </div>

                {/* Bids section will go here */}
                <div className="mt-5">
                    <h3>Bids</h3>
                    <GetBids jobId={jobId} />
                </div>
            </div>
        </Container>
    );
};
export default ViewBids;