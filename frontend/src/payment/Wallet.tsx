import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Table, Badge, Button, Spinner, Modal, Form, Alert } from "react-bootstrap";
import { paymentHandler, type WalletResponse, type WalletTransaction } from "../services/paymentHandler";
import { useAuthStore } from "../store/useAuthStore"; // Assuming this is where the user role is

const Wallet = () => {
    const { user } = useAuthStore();
    const [walletData, setWalletData] = useState<WalletResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState("");
    const [withdrawSuccess, setWithdrawSuccess] = useState("");

    const fetchWallet = async () => {
        try {
            setLoading(true);
            const data = await paymentHandler.getWalletBalance();
            setWalletData(data);
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const handleWithdrawRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setWithdrawError("");
        setWithdrawSuccess("");

        if (!withdrawAmount || Number(withdrawAmount) <= 0) {
            setWithdrawError("Please enter a valid amount");
            return;
        }

        try {
            setWithdrawLoading(true);
            await paymentHandler.requestWithdrawal(Number(withdrawAmount));
            setWithdrawSuccess("Withdrawal request submitted successfully.");
            setShowWithdrawModal(false);
            setWithdrawAmount("");
            fetchWallet(); // refresh balance
        } catch (err: any) {
            setWithdrawError(err.response?.data?.message || err.message || "An error occurred");
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!walletData) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Failed to load wallet data.</Alert>
            </Container>
        );
    }

    const { wallet, transactions } = walletData;
    const isFreelancer = user?.role === "Freelancer";

    return (
        <Container className="mt-4">
            <h2 className="mb-4">My Wallet</h2>

            <Row className="mb-4 g-4">
                {isFreelancer ? (
                    <>
                        <Col md={4}>
                            <Card className="shadow-lg border-0 h-100 text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '15px' }}>
                                <Card.Body className="d-flex flex-column justify-content-between p-4">
                                    <Card.Subtitle className="mb-2 text-white-50" style={{ fontSize: '1rem', letterSpacing: '1px' }}>AVAILABLE BALANCE</Card.Subtitle>
                                    <Card.Title as="h1" className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
                                        ${wallet.availableBalance?.toFixed(2) || "0.00"}
                                    </Card.Title>
                                    <div className="mt-4">
                                        <Button
                                            variant="light"
                                            onClick={() => setShowWithdrawModal(true)}
                                            disabled={!wallet.availableBalance || wallet.availableBalance <= 0}
                                            style={{ fontWeight: '600', borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                                        >
                                            Request Withdrawal
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-lg border-0 h-100 text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '15px' }}>
                                <Card.Body className="p-4">
                                    <Card.Subtitle className="mb-2 text-white-50" style={{ fontSize: '1rem', letterSpacing: '1px' }}>IN ESCROW</Card.Subtitle>
                                    <Card.Title as="h1" className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
                                        ${wallet.escrowBalance?.toFixed(2) || "0.00"}
                                    </Card.Title>
                                    <Card.Text className="mt-4 text-white-50">
                                        Funds securely held until milestones are completed.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-lg border-0 h-100 text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '15px' }}>
                                <Card.Body className="p-4">
                                    <Card.Subtitle className="mb-2 text-white-50" style={{ fontSize: '1rem', letterSpacing: '1px' }}>LIFETIME EARNINGS</Card.Subtitle>
                                    <Card.Title as="h1" className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
                                        ${wallet.totalEarned?.toFixed(2) || "0.00"}
                                    </Card.Title>
                                    <Card.Text className="mt-4 text-white-50">
                                        Total earnings processed into available balance.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </>
                ) : (
                    <>
                        <Col md={6}>
                            <Card className="shadow-lg border-0 h-100 text-white" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '15px' }}>
                                <Card.Body className="p-4">
                                    <Card.Subtitle className="mb-2 text-white-50" style={{ fontSize: '1rem', letterSpacing: '1px' }}>TOTAL SPENT</Card.Subtitle>
                                    <Card.Title as="h1" className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
                                        ${wallet.totalSpent?.toFixed(2) || "0.00"}
                                    </Card.Title>
                                    <Card.Text className="mt-4 text-white-50">
                                        Total amount funded to freelancer escrows.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="shadow-lg border-0 h-100 text-white" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '15px' }}>
                                <Card.Body className="p-4">
                                    <Card.Subtitle className="mb-2 text-white-50" style={{ fontSize: '1rem', letterSpacing: '1px' }}>ACTIVE TRANSACTIONS</Card.Subtitle>
                                    <Card.Title as="h1" className="mb-0 fw-bold" style={{ fontSize: '2.5rem' }}>
                                        {transactions.length}
                                    </Card.Title>
                                    <Card.Text className="mt-4 text-white-50">
                                        Total registered financial operations.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </>
                )}
            </Row>

            {withdrawSuccess && <Alert variant="success" onClose={() => setWithdrawSuccess("")} dismissible>{withdrawSuccess}</Alert>}

            <Card className="shadow-sm border-0 mt-5" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                    <Card.Title className="mb-0 fw-bold" style={{ fontSize: '1.5rem', color: 'var(--text-color)' }}>Transaction History</Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                    {transactions && transactions.length > 0 ? (
                        <Table responsive hover className="align-middle border-top mt-3" style={{ color: 'var(--text-color)' }}>
                            <thead className="table-light text-muted">
                                <tr>
                                    <th className="fw-normal py-3 border-0 rounded-start">TYPE</th>
                                    <th className="fw-normal py-3 border-0">AMOUNT</th>
                                    <th className="fw-normal py-3 border-0">STATUS</th>
                                    <th className="fw-normal py-3 border-0">JOB / DETAILS</th>
                                    <th className="fw-normal py-3 border-0 rounded-end">DATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx: WalletTransaction) => (
                                    <tr key={tx._id}>
                                        <td>
                                            <Badge bg={tx.type === "deposit" || tx.type === "payment" ? "success" : "warning"} className="text-uppercase">
                                                {tx.type}
                                            </Badge>
                                        </td>
                                        <td className="fw-bold" style={{ fontSize: '1.1rem' }}>
                                            {tx.currency === "usd" ? "$" : ""}
                                            {tx.amount.toFixed(2)}
                                        </td>
                                        <td>
                                            <Badge
                                                pill
                                                bg={
                                                    tx.status === "completed" ? "success" :
                                                        tx.status === "pending" ? "warning" :
                                                            "danger"
                                                }
                                                className="px-3 py-2"
                                                style={{ fontWeight: 500 }}
                                            >
                                                {tx.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 500 }}>{tx.job ? tx.job.title : "N/A"}</span>
                                        </td>
                                        <td className="text-muted">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted p-4">
                            <p>No transactions found.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showWithdrawModal} onHide={() => !withdrawLoading && setShowWithdrawModal(false)} centered>
                <Modal.Header closeButton={!withdrawLoading}>
                    <Modal.Title>Request Withdrawal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {withdrawError && <Alert variant="danger">{withdrawError}</Alert>}
                    <Form onSubmit={handleWithdrawRequest}>
                        <Form.Group className="mb-3">
                            <Form.Label>Withdrawal Amount (USD)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                step="0.01"
                                max={wallet.availableBalance}
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value ? Number(e.target.value) : "")}
                                placeholder="Enter amount"
                                required
                                disabled={withdrawLoading}
                            />
                            <Form.Text className="text-muted">
                                Available to withdraw: ${wallet.availableBalance?.toFixed(2) || "0.00"}
                            </Form.Text>
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowWithdrawModal(false)} disabled={withdrawLoading}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={withdrawLoading}>
                                {withdrawLoading ? <Spinner size="sm" /> : "Submit Request"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Wallet;
