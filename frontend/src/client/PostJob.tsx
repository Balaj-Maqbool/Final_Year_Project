import { useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { jobHandler } from "../services/jobHandler";
import { aiHandler } from "../services/aiHandler";
import { useNavigate } from "react-router-dom";
import "../../src/css/forms.css";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError]         = useState("");
  const [aiPrompt, setAiPrompt]   = useState("");

  const titleRef       = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const budgetRef      = useRef<HTMLInputElement>(null);
  const deadlineRef    = useRef<HTMLInputElement>(null);
  const categoryRef    = useRef<HTMLInputElement>(null);
  const skillsRef      = useRef<HTMLInputElement>(null);

  const handleAIGenerate = async () => {
    if (!aiPrompt || aiPrompt.length < 10) {
      setError("Please enter at least 10 characters for the AI prompt.");
      return;
    }
    setError("");
    setAiLoading(true);
    try {
      const aiResponse = await aiHandler.generateJobDetails(aiPrompt);
      const { title, description, budget_estimate, category, required_skills } = aiResponse;
      if (titleRef.current)       titleRef.current.value = title || "";
      if (descriptionRef.current) descriptionRef.current.value = description || "";
      const budgetMatch = budget_estimate?.toString().match(/\d+/g);
      if (budgetRef.current && budgetMatch)
        budgetRef.current.value = budgetMatch[budgetMatch.length - 1];
      if (categoryRef.current) categoryRef.current.value = category || "";
      if (skillsRef.current && Array.isArray(required_skills))
        skillsRef.current.value = required_skills.join(", ");
    } catch (err: any) {
      setError("Failed to generate details with AI. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const skillsString = skillsRef.current?.value || "";
    const data = {
      title:           titleRef.current?.value || "",
      description:     descriptionRef.current?.value || "",
      budget:          Number(budgetRef.current?.value || 0),
      deadline:        deadlineRef.current?.value || "",
      category:        categoryRef.current?.value || "",
      required_skills: skillsString.split(",").map(s => s.trim()).filter(s => s.length > 0),
    };
    if (!data.title || !data.description || !data.budget || !data.deadline) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    try {
      await jobHandler.createJob(data);
      navigate("/client/clientDashboard");
    } catch (err: any) {
      setError(err.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mf-page" style={{ alignItems: "flex-start", paddingTop: "3rem" }}>
      <div className="mf-card mf-card-wide">
        {/* Badge + heading */}
        <div className="mf-badge">Post a Job</div>
        <h1 className="mf-heading">Create a new<br />project listing</h1>
        <p className="mf-subheading">Describe your project and find the perfect freelancer.</p>

        {/* Error */}
        {error && <div className="mf-error">{error}</div>}

        {/* AI Card */}
        <div className="mf-ai-card">
          <div className="mf-ai-title">🤖 AI Job Architect</div>
          <div className="mf-ai-text">Briefly describe what you need — AI will write the full job posting for you.</div>
          <div className="mf-ai-row">
            <input
              className="mf-input mf-ai-input"
              placeholder="E.g., I need a React developer to build a portfolio site..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <button className="mf-ai-btn" onClick={handleAIGenerate} disabled={aiLoading}>
              {aiLoading ? <Spinner animation="border" size="sm" /> : "✨ Generate"}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mf-group">
            <label className="mf-label">Job Title *</label>
            <input
              ref={titleRef}
              type="text"
              className="mf-input"
              placeholder="e.g. Full Stack Developer for E-commerce Site"
              required
            />
          </div>

          <div className="mf-group">
            <label className="mf-label">Job Description *</label>
            <textarea
              ref={descriptionRef}
              className="mf-input mf-textarea"
              placeholder="Describe the project details, requirements, and deliverables..."
              rows={5}
              required
            />
          </div>

          <div className="mf-row">
            <div className="mf-group">
              <label className="mf-label">Budget (PKR) *</label>
              <div className="mf-input-wrap">
                <span className="mf-input-icon">₨</span>
                <input
                  ref={budgetRef}
                  type="number"
                  className="mf-input"
                  placeholder="e.g. 50000"
                  required
                  min={0}
                />
              </div>
            </div>
            <div className="mf-group">
              <label className="mf-label">Deadline *</label>
              <div className="mf-input-wrap">
                <span className="mf-input-icon">📅</span>
                <input
                  ref={deadlineRef}
                  type="date"
                  className="mf-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mf-row">
            <div className="mf-group">
              <label className="mf-label">Category</label>
              <input
                ref={categoryRef}
                type="text"
                className="mf-input"
                placeholder="e.g. Web Development"
              />
            </div>
            <div className="mf-group">
              <label className="mf-label">Required Skills</label>
              <input
                ref={skillsRef}
                type="text"
                className="mf-input"
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>

          <button type="submit" className="mf-submit" disabled={loading}>
            {loading
              ? <Spinner as="span" animation="border" size="sm" role="status" />
              : "🚀 Post Job Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;