import { useState } from "react";
import { Button, Form } from "react-bootstrap";

interface TaskFormProps {
    jobId: string;
    onSubmit: (title: string, description: string) => void;
}

const TaskForm = ({ jobId, onSubmit }: TaskFormProps) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const formHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(title, description);
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-light">
            <h3 className="mb-3">Create New Task</h3>
            <Form onSubmit={formHandler}>
                <Form.Group className="mb-3" controlId="formBasicTitle">
                    <Form.Label>Task Title</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g. Design Database Schema"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Detailed description of the task..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>

                <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                        Add Task
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default TaskForm;