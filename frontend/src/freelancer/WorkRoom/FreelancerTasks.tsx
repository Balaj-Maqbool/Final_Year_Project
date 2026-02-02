

import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Badge, Alert, Spinner, Container } from "react-bootstrap";
import { getTasks,  updateTaskStatus,  } from "../../client/WorkRoom/taskHandler";
import type { Task } from "../../client/WorkRoom/taskHandler";


const FreelancerTasks = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const queryClient = useQueryClient();
  

    // Fetch Tasks
    const { data: tasks = [], isLoading, isError, error } = useQuery({
        queryKey: ["tasks", jobId],
        queryFn: () => getTasks(jobId!),
        enabled: !!jobId,
    });

    
 
    // Approve Task Mutation
    const submitTaskMutation = useMutation({
        mutationFn: updateTaskStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", jobId] });
        },
        onError: (err: any) => {
            alert(`Failed to approve task: ${err.message}`);
        }
    });


    const handleApprove = (taskId: string) => {
        if (window.confirm("Approve this task?")) {
            submitTaskMutation.mutate(taskId);
        }
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    if (isError) return <Alert variant="danger">Error loading tasks: {(error as any).message}</Alert>;

    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Project Tasks</h2>
              
            </div>


            {tasks.length === 0 ? (
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
                        {tasks.map((task: Task) => (
                            <tr key={task._id}>
                                <td>{task.title}</td>
                                <td>{task.description}</td>
                                <td>
                                    <Badge bg={
                                        task.status === "Completed" ? "success" :
                                            task.status === "In Progress" ? "warning" : "secondary"
                                    }>
                                        {task.status}
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
                                    {!task.is_approved && task.status === "Completed" && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleApprove(task._id)}
                                            disabled={approveTaskMutation.isPending}
                                        >
                                            Approve
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