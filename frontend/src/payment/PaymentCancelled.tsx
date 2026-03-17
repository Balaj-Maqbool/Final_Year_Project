import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const PaymentCancelled = () => {
    const navigate = useNavigate();

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="text-center shadow p-4" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    <div className="mb-4 text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                        </svg>
                    </div>
                    <Card.Title as="h2" className="mb-3">Payment Cancelled</Card.Title>
                    <Card.Text className="text-muted mb-4">
                        Your payment was cancelled. No charges were made.
                        If you experienced an error or changed your mind, you can try again anytime.
                    </Card.Text>
                    <Button variant="secondary" size="lg" onClick={() => navigate('/client/clientDashboard')}>
                        Return to Dashboard
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentCancelled;
