import { useRef, useState } from "react";
import { Container, Form, Alert, Spinner, Button, InputGroup, Card } from "react-bootstrap";
import { jobHandler } from "../services/jobHandler";
import { aiHandler } from "../services/aiHandler";
import { useNavigate } from "react-router-dom";
import "./css/PostJob.css";

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");

    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const budgetRef = useRef<HTMLInputElement>(null);
    const deadlineRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLInputElement>(null);
    const skillsRef = useRef<HTMLInputElement>(null);

    const handleAIGenerate = async () => {
        if (!aiPrompt || aiPrompt.length < 10) {
            setError("Please enter at least 10 characters for AI prompt.");
            return;
        }
        setError("");
        setAiLoading(true);
        try {
            const aiResponse = await aiHandler.generateJobDetails(aiPrompt);
            const { title, description, budget_estimate, category, required_skills } = aiResponse;
            
            if (titleRef.current) titleRef.current.value = title || "";
            if (descriptionRef.current) descriptionRef.current.value = description || "";
            // Extract numeric budget from 'budget_estimate' string if possible, or just keep it default/rough.
            const budgetMatch = budget_estimate?.toString().match(/\d+/g);
            if (budgetRef.current && budgetMatch) {
                // Take the average of the range or the main number
                budgetRef.current.value = budgetMatch[budgetMatch.length - 1]; 
            }
            if (categoryRef.current) categoryRef.current.value = category || "";
            if (skillsRef.current && Array.isArray(required_skills)) {
                skillsRef.current.value = required_skills.join(", ");
            }
        } catch (err: any) {
            console.error("AI Generation Error", err);
            setError("Failed to generate details with AI. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

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

                <Card className="mb-4 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderLeft: "4px solid #8e44ad" }}>
                    <Card.Body>
                        <Card.Title className="d-flex align-items-center" style={{ color: "var(--text-primary)" }}>
                            <span className="me-2 fs-4">🤖</span> AI Job Architect
                        </Card.Title>
                        <Card.Text style={{ color: "var(--text-secondary)" }}>
                            Too busy to write a detailed description? Briefly describe what you need, and our AI will generate a professional job posting for you!
                        </Card.Text>
                        <InputGroup>
                            <Form.Control
                                placeholder="E.g., I need a react developer to build a portfolio website for me..."
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)", borderColor: "var(--border-color)" }}
                            />
                            <Button variant="primary" onClick={handleAIGenerate} disabled={aiLoading} style={{ backgroundColor: "#8e44ad", borderColor: "#8e44ad" }}>
                                {aiLoading ? <Spinner animation="border" size="sm" /> : "✨ Generate"}
                            </Button>
                        </InputGroup>
                    </Card.Body>
                </Card>

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
                        <Form.Label className="form-label-custom">Required Skills (comma separated)</Form.Label>
                        <Form.Control ref={skillsRef} type="text" placeholder="e.g. React, Node.js, MongoDB" className="form-control-custom" />
                    </Form.Group>

                    <div className="submit-btn-container mt-4">
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