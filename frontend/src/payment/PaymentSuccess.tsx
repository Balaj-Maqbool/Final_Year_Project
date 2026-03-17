import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
        }
    }, [sessionId, navigate]);

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="text-center shadow p-4" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    <div className="mb-4 text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </svg>
                    </div>
                    <Card.Title as="h2" className="mb-3">Payment Successful!</Card.Title>
                    <Card.Text className="text-muted mb-4">
                        Your payment has been processed successfully. The funds have been securely placed in escrow.
                    </Card.Text>
                    <Button variant="primary" size="lg" onClick={() => navigate('/client/clientDashboard')}>
                        Return to Dashboard
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentSuccess;
