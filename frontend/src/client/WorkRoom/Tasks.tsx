
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Badge, Alert, Spinner, Container } from "react-bootstrap";
import { getTasks, createTask, updateTaskStatus, approveTask } from "../../services/taskHandler";
import type { Task } from "../../services/taskHandler";
import TaskForm from "./TaskForm";

const Tasks = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    // Fetch Tasks
    const { data: tasks, isLoading, isError, error } = useQuery({
        queryKey: ["tasks", jobId],
        queryFn: () => getTasks(jobId!),
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

    // Approve Task Mutation
    const approveTaskMutation = useMutation({
        mutationFn: approveTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
        },
        onError: (err: any) => {
            alert(`Failed to approve task: ${err.message}`);
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

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (isError) return <Alert variant="danger">Error loading tasks: {(error as any).message}</Alert>;

    // Handle case where tasks might be undefined (e.g. jobId not yet available, though enabled check handles most cases)
    if (!tasks) return null;

    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Project Tasks</h2>
                <Button size="sm" variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "Create Task"}
                </Button>
            </div>

            {showForm && (
                <div className="mb-4">
                    <TaskForm jobId={jobId!} onSubmit={handleCreateTask} />
                </div>
            )}

            {!tasks.docs || tasks.docs.length === 0 ? (
                <Alert variant="info">No tasks created for this job yet.</Alert>
            ) : (
                <Table striped bordered hover responsive>
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
                                    {!task.is_approved && task.status === "Done" && (
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleApprove(task._id)}
                                                disabled={approveTaskMutation.isPending}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                onClick={() => handleRequestChanges(task._id)}
                                                disabled={submitTaskMutation.isPending}
                                            >
                                                Request Changes
                                            </Button>
                                        </div>
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

export default Tasks