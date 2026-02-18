import { useRef, useState } from "react";
import { Container, Form, Alert, Spinner } from "react-bootstrap";
import { jobHandler } from "../services/jobHandler";
import { useNavigate } from "react-router-dom";
import "./css/PostJob.css";

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const budgetRef = useRef<HTMLInputElement>(null);
    const deadlineRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLInputElement>(null);
    const skillsRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const skillsString = skillsRef.current?.value || '';
        const data = {
            title: titleRef.current?.value || '',
            description: descriptionRef.current?.value || '',
            budget: Number(budgetRef.current?.value || 0),
            deadline: deadlineRef.current?.value || '',
            category: categoryRef.current?.value || '',
            required_skills: skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0)
        };

        // Basic validation
        if (!data.title || !data.description || !data.budget || !data.deadline) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        try {
            await jobHandler.createJob(data);
            navigate("/client/clientDashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to post job.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <div className="post-job-container">
                <div className="post-job-header">
                    <h2>Post a New Job</h2>
                    <p>Describe your project and find the perfect freelancer.</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">Job Title</Form.Label>
                        <Form.Control ref={titleRef} type="text" placeholder="e.g. Full Stack Developer for E-commerce Site" className="form-control-custom" required />
                    </Form.Group>

                    <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">Job Description</Form.Label>
                        <Form.Control ref={descriptionRef} as="textarea" rows={5} placeholder="Describe the project details, requirements, and deliverables..." className="form-control-custom" required />
                    </Form.Group>

                    <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">Budget (PKR)</Form.Label>
                        <Form.Control ref={budgetRef} type="number" placeholder="e.g. 50000" className="form-control-custom" required min={0} />
                    </Form.Group>

                    <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">Deadline</Form.Label>
                        <Form.Control ref={deadlineRef} type="date" className="form-control-custom" required />
                    </Form.Group>

                    <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">Category</Form.Label>
                        <Form.Control ref={categoryRef} type="text" placeholder="e.g. Web Development" className="form-control-custom" />
                    </Form.Group>

                    <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">Required Skills</Form.Label>
                        <Form.Control ref={skillsRef} type="text" placeholder="e.g. React, Node.js, MongoDB" className="form-control-custom" />
                    </Form.Group>

                    <div className="submit-btn-container">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "🚀 Post Job Now"}
                        </button>
                    </div>
                </Form>
            </div>
        </Container>
    );
}

export default PostJob;