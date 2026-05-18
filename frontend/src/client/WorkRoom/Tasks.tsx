
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Badge, Alert, Spinner, Container } from "react-bootstrap";
import { getTasks, createTask, updateTaskStatus, approveTask, deleteTask } from "../../services/taskHandler";
import { ratingHandler } from "../../services/ratingHandler";
import { Modal, Form } from "react-bootstrap";
import { aiHandler } from "../../services/aiHandler";
import { jobHandler } from "../../services/jobHandler";
import type { Task } from "../../services/taskHandler";
import TaskForm from "./TaskForm";
import { useTheme } from "../../context/ThemeContext";
import "../../css/buttons.css";

const Tasks = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const [showForm, setShowForm] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    // Fetch Tasks
    const { data: tasks, isLoading, isError, error } = useQuery({
        queryKey: ["tasks", jobId],
        queryFn: () => getTasks(jobId!),
        staleTime: 5 * 60 * 1000, // 5 minutes caching
        enabled: !!jobId,
    });

    // Fetch Job to get status
    const { data: job, refetch: refetchJob } = useQuery({
        queryKey: ["job", jobId],
        queryFn: () => jobHandler.getJob(jobId!),
        staleTime: 5 * 60 * 1000, // 5 minutes caching
        enabled: !!jobId,
    });

    // Create Task Mutation
    const createTaskMutation = useMutation({
        mutationFn: (newTask: { title: string; description: string }) =>
            createTask(jobId!, newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
            setShowForm(false);
            alert("Task created successfully!");
        },
        onError: (err: any) => {
            alert(`Failed to create task: ${err.message}`);
        }
    });

    const approveTaskMutation = useMutation({
        mutationFn: approveTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
        },
        onError: (err: any) => {
            alert(`Failed to approve task: ${err.message}`);
        }
    });

    // Delete Task Mutation
    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
        },
        onError: (err: any) => {
            alert(`Failed to delete task: ${err.message}`);
        }
    });

    const submitTaskMutation = useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
            updateTaskStatus(taskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
        },
        onError: (err: any) => {
            alert(`Failed to update task: ${err.message}`);
        }
    });

    const submitRatingMutation = useMutation({
        mutationFn: () => ratingHandler.addRating(jobId!, { rating, comment }),
        onSuccess: () => {
            alert("Rating submitted successfully!");
            setShowRatingModal(false);
        },
        onError: (err: any) => {
            alert(`Failed to submit rating: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleRatingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitRatingMutation.mutate();
    };

    const handleCreateTask = (title: string, description: string) => {
        createTaskMutation.mutate({ title, description });
    };

    const handleRequestChanges = (taskId: string) => {
        if (window.confirm("Request changes for this task? It will be moved back to 'In Progress'.")) {
            submitTaskMutation.mutate({ taskId, status: "In Progress" });
        }
    };

    const handleApprove = (taskId: string) => {
        if (window.confirm("Approve this task?")) {
            approveTaskMutation.mutate(taskId);
        }
    };

    const handleDelete = (taskId: string) => {
        if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            deleteTaskMutation.mutate(taskId);
        }
    };

    const handleAIGenerate = async () => {
        if (!jobId) return;
        if (!window.confirm("This will overwrite/add AI generated tasks based on job description. Continue?")) return;
        
        setAiLoading(true);
        try {
            const job = await jobHandler.getJob(jobId);
            if (!job || !job.description) {
                alert("Could not fetch job description.");
                return;
            }
            const aiResponse = await aiHandler.generateTaskBreakdown(job.description);
            const generatedTasks = aiResponse.tasks;
            
            // Create them all in parallel or sequentially
            for (const t of generatedTasks) {
                await createTask(jobId, { title: t.title, description: t.description });
            }
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
            alert(`Successfully generated ${generatedTasks.length} tasks!`);
        } catch (err: any) {
            console.error("AI Generation Error", err);
            alert("Failed to generate task breakdown with AI.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleCompleteJob = async () => {
        if (!jobId) return;
        if (window.confirm("Are you sure you want to mark this project as completed? This will permanently release the escrow funds to the freelancer!")) {
            try {
                await jobHandler.updateJob(jobId, { status: "Completed" } as any);
                alert("Job marked as completed. Funds have been securely released from Escrow to the Freelancer!");
                refetchJob();
                setShowRatingModal(true); // Prompt them to rate immediately after completing
            } catch (err: any) {
                alert(`Failed to complete job: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (isError) return <Alert variant="danger">Error loading tasks: {(error as any).message}</Alert>;

    // Handle case where tasks might be undefined (e.g. jobId not yet available, though enabled check handles most cases)
    if (!tasks) return null;

    const totalTasks = tasks.docs?.length || 0;
    const allTasksApproved = totalTasks > 0 && tasks.docs.every((t: Task) => t.is_approved);

    return (
        <Container className="my-4">
            {/* Project Header */}
            <div className="mb-4 p-3 rounded" style={{
                background: theme === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(241, 245, 249, 0.8)",
                border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                borderRadius: "12px"
            }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: 800 }}>
                            {job?.title || "Project Tasks"}
                        </h2>
                        <div className="d-flex align-items-center gap-2 mt-2">
                            {job?.status && (
                                <Badge bg={
                                    job.status === "Open" ? "info" :
                                    job.status === "Assigned" ? "warning" :
                                    job.status === "Completed" ? "success" : "secondary"
                                }>
                                    {job.status}
                                </Badge>
                            )}
                            {job?.contract_status && (
                                <Badge bg={job.contract_status === "Active" ? "success" : "warning"}>
                                    Escrow: {job.contract_status}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {job?.freelancer && (
                            <div
                                className="d-flex align-items-center gap-2 p-2 rounded"
                                style={{
                                    background: theme === "dark" ? "#0f172a" : "#fff",
                                    border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    cursor: "pointer"
                                }}
                                onClick={() => navigate(`/profile/${job.freelancer!._id}`)}
                            >
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                    style={{
                                        width: "36px", height: "36px", fontSize: "0.9rem",
                                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                        overflow: "hidden"
                                    }}
                                >
                                    {job.freelancer.profileImage ? (
                                        <img src={job.freelancer.profileImage} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                                    ) : (
                                        job.freelancer.fullName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>ASSIGNED TO</small>
                                    <div style={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }}>
                                        {job.freelancer.fullName}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    {totalTasks > 0 && job?.status !== "Completed" && (
                        <small className="text-muted">
                            {tasks.docs.filter((t: Task) => t.is_approved).length}/{totalTasks} tasks approved
                            {!allTasksApproved && " — approve all tasks to release escrow"}
                        </small>
                    )}
                </div>
                <div className="d-flex gap-2">
                    {job?.status === "Completed" ? (
                        <Button
                            size="sm"
                            className="btn-modern warning sm"
                            onClick={() => setShowRatingModal(true)}
                        >
                            ⭐ Rate Freelancer
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className={allTasksApproved ? "btn-modern success sm" : "btn-modern neutral sm"}
                            onClick={handleCompleteJob}
                            disabled={!allTasksApproved}
                            title={!allTasksApproved ? "All tasks must be approved before you can release escrow" : "Mark project as complete and release escrow to freelancer"}
                        >
                            💰 Complete & Release Escrow
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="btn-modern purple sm"
                        onClick={handleAIGenerate}
                        disabled={aiLoading}
                    >
                        {aiLoading ? <Spinner size="sm" animation="border" /> : "✨ Auto-Generate Breakdown"}
                    </Button>
                    <Button
                        size="sm"
                        className={showForm ? "btn-modern neutral sm" : "btn-modern primary sm"}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "✕ Cancel" : "+ Create Task"}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="mb-4">
                    <TaskForm jobId={jobId!} onSubmit={handleCreateTask} />
                </div>
            )}

            {!tasks.docs || tasks.docs.length === 0 ? (
                <Alert variant="info">No tasks created for this job yet.</Alert>
            ) : (
                <Table striped bordered hover responsive variant={theme === "dark" ? "dark" : undefined}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Approval</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.docs.map((task: Task) => (
                            <tr key={task._id}>
                                <td>{task.title}</td>
                                <td>{task.description}</td>
                                <td>
                                    <Badge bg={
                                        task.status === "Done" ? "info" :
                                            task.status === "In Progress" ? "warning" : "secondary"
                                    }>
                                        {task.status === "Done" ? "Submitted" : task.status}
                                    </Badge>
                                </td>
                                <td>
                                    {task.is_approved ? (
                                        <Badge bg="success">Approved</Badge>
                                    ) : (
                                        <Badge bg="warning" text="dark">Pending</Badge>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        {!task.is_approved && task.status === "Done" && (
                                            <>
                                                <Button
                                                    className="btn-modern success sm"
                                                    onClick={() => handleApprove(task._id)}
                                                    disabled={approveTaskMutation.isPending}
                                                >
                                                    ✓ Approve
                                                </Button>
                                                <Button
                                                    className="btn-modern warning sm"
                                                    onClick={() => handleRequestChanges(task._id)}
                                                    disabled={submitTaskMutation.isPending}
                                                >
                                                    ↩ Request Changes
                                                </Button>
                                            </>
                                        )}
                                        {!task.is_approved && (
                                            <Button
                                                className="btn-modern danger sm"
                                                onClick={() => handleDelete(task._id)}
                                                disabled={deleteTaskMutation.isPending}
                                                title="Delete this task"
                                            >
                                                🗑
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Rate Freelancer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleRatingSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Experience Rating ({rating} Stars)</Form.Label>
                            <Form.Range 
                                min={1} 
                                max={5} 
                                step={1} 
                                value={rating} 
                                onChange={(e) => setRating(Number(e.target.value))} 
                            />
                            <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Feedback / Comments</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={4} 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)} 
                                placeholder="Describe your experience working with this freelancer..."
                                required
                                minLength={3}
                            />
                        </Form.Group>
                        <Button className="btn-modern primary md w-100" type="submit" disabled={submitRatingMutation.isPending}>
                            {submitRatingMutation.isPending ? "Submitting..." : "⭐ Submit Rating"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Tasks