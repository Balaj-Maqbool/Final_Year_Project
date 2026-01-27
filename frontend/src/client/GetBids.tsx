import { useEffect, useState } from "react"
import { bidHandler } from "../freelancer/services/bidHandler"
import { Card, Badge, Alert, Spinner } from "react-bootstrap";

interface Bid {
    _id: string;
    bid_amount: number;
    message: string;
    timeline: {
        start_date: string;
        end_date: string;
    };
    freelancer: {
        _id: string;
        fullName: string;
        email: string;
        profileImage?: string;
        rating?: number;
    };
    createdAt: string;
}

interface GetBidsProps {
    jobId?: string;
}

const GetBids = ({ jobId }: GetBidsProps) => {

    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) return
        const fetchBids = async () => {
            try {
                setLoading(true);
                const result = await bidHandler.getJobBids(jobId)
                setBids(result);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to fetch bids");
            } finally {
                setLoading(false);
            }
        }
        fetchBids()

    }, [jobId])

    if (loading) return <div className="text-center py-4"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (bids.length === 0) return <Alert variant="info">No bids placed on this job yet.</Alert>;

    return (
        <div className="bids-list">
            {bids.map((bid) => (
                <Card key={bid._id} className="mb-3 shadow-sm">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                    style={{ width: "50px", height: "50px", fontSize: "1.2rem" }}
                                >
                                    {bid.freelancer.profileImage ? (
                                        <img
                                            src={bid.freelancer.profileImage}
                                            alt={bid.freelancer.fullName}
                                            className="rounded-circle w-100 h-100 object-fit-cover"
                                        />
                                    ) : (
                                        bid.freelancer.fullName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h5 className="mb-0">{bid.freelancer.fullName}</h5>
                                    <small className="text-muted">
                                        {bid.freelancer.rating ? `⭐ ${bid.freelancer.rating.toFixed(1)}` : "New Freelancer"}
                                    </small>
                                </div>
                            </div>
                            <div className="text-end">
                                <h4 className="text-success mb-1">PKR {bid.bid_amount.toLocaleString()}</h4>
                                <small className="text-muted">Bid Amount</small>
                            </div>
                        </div>

                        <Card.Text className="bg-light p-3 rounded">
                            {bid.message}
                        </Card.Text>

                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                            <div className="timeline-info">
                                <strong>Timeline: </strong>
                                <span className="text-muted">
                                    {new Date(bid.timeline.start_date).toLocaleDateString()} - {new Date(bid.timeline.end_date).toLocaleDateString()}
                                </span>
                            </div>
                            <small className="text-muted">
                                Placed on {new Date(bid.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </div>
    )
}

export default GetBids
