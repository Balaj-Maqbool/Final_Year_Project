
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Badge, Alert, Spinner, Container } from "react-bootstrap";
import { getTasks, updateTaskStatus, } from "../../services/taskHandler";
import { jobHandler } from "../../services/jobHandler";
import type { Task } from "../../services/taskHandler";
import { useTheme } from "../../context/ThemeContext";
import toast from 'react-hot-toast';


const FreelancerTasks = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { theme } = useTheme();


    // Fetch Tasks
    const { data: tasks, isLoading, isError, error } = useQuery({
        queryKey: ["tasks", jobId],
        queryFn: () => getTasks(jobId!),
        enabled: !!jobId,
    });

    // Fetch Job to get project details and client info
    const { data: job } = useQuery({
        queryKey: ["job", jobId],
        queryFn: () => jobHandler.getJob(jobId!),
        enabled: !!jobId,
    });


    // Update Task Status Mutation
    const submitTaskMutation = useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
            updateTaskStatus(taskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
        },
        onError: (err: any) => {
            toast.error(`Failed to update task: ${err.message}`);
        }
    });

    const handleStatusUpdate = (taskId: string, newStatus: string) => {
        if (window.confirm(`Mark this task as ${newStatus}?`)) {
            submitTaskMutation.mutate({ taskId, status: newStatus });
        }
    };

    const requestPaymentMutation = useMutation({
        mutationFn: () => jobHandler.requestPaymentRelease(jobId!),
        onSuccess: () => {
            toast.success("Payment release request successfully sent to the Client!");
        },
        onError: (err: any) => {
            toast.error(`Failed to request payment: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleRequestPayment = () => {
        if (window.confirm("Are you sure you want to request the final payment release? Please ensure all tasks are completed before requesting.")) {
            requestPaymentMutation.mutate();
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (isError) return <Alert variant="danger">Error loading tasks: {(error as any).message}</Alert>;
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
                        {job?.poster && (
                            <div
                                className="d-flex align-items-center gap-2 p-2 rounded"
                                style={{
                                    background: theme === "dark" ? "#0f172a" : "#fff",
                                    border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    cursor: "pointer"
                                }}
                                onClick={() => navigate(`/profile/${job.poster!._id}`)}
                            >
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                    style={{
                                        width: "36px", height: "36px", fontSize: "0.9rem",
                                        background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                                        overflow: "hidden"
                                    }}
                                >
                                    {job.poster.profileImage ? (
                                        <img src={job.poster.profileImage} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                                    ) : (
                                        job.poster.fullName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>CLIENT</small>
                                    <div style={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }}>
                                        {job.poster.fullName}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div></div>
                {allTasksApproved && (
                    <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={handleRequestPayment}
                        disabled={requestPaymentMutation.isPending}
                        style={{ fontWeight: "bold" }}
                    >
                        {requestPaymentMutation.isPending ? <Spinner size="sm" animation="border" /> : "💸 Request Escrow Release"}
                    </Button>
                )}
            </div>
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
                                        task.status === "Done" ? "success" :
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
                                    {(task.status === "Pending" || task.status === "To Do") && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleStatusUpdate(task._id, "In Progress")}
                                            disabled={submitTaskMutation.isPending}
                                        >
                                            Start Task
                                        </Button>
                                    )}
                                    {task.status === "In Progress" && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleStatusUpdate(task._id, "Done")}
                                            disabled={submitTaskMutation.isPending}
                                        >
                                            Submit Task
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default FreelancerTasks