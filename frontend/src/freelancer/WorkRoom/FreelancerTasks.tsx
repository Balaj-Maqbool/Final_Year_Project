
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Badge, Alert, Spinner, Container } from "react-bootstrap";
import { getTasks, updateTaskStatus, } from "../../services/taskHandler";
import type { Task } from "../../services/taskHandler";


const FreelancerTasks = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const queryClient = useQueryClient();


    // Fetch Tasks
    const { data: tasks, isLoading, isError, error } = useQuery({
        queryKey: ["tasks", jobId],
        queryFn: () => getTasks(jobId!),
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
            alert(`Failed to update task: ${err.message}`);
        }
    });

    const handleStatusUpdate = (taskId: string, newStatus: string) => {
        if (window.confirm(`Mark this task as ${newStatus}?`)) {
            submitTaskMutation.mutate({ taskId, status: newStatus });
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (isError) return <Alert variant="danger">Error loading tasks: {(error as any).message}</Alert>;
    if (!tasks) return null;
    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Project Tasks</h2>
            </div>


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