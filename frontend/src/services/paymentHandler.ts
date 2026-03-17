import { apiRequest } from "./apiClient";

const API = "/payments";

export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

export interface WalletTransaction {
    _id: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    createdAt: string;
    job?: {
        _id: string;
        title: string;
        status: string;
        poster_id?: {
            _id: string;
            fullName: string;
            avatar?: string;
        };
    };
}

export interface WalletData {
    availableBalance: number;
    escrowBalance: number;
    totalSpent: number;
}

export interface WalletResponse {
    wallet: WalletData;
    transactions: WalletTransaction[];
}

export const paymentHandler = {
    createCheckoutSession: async (jobId: string): Promise<CheckoutSessionResponse> => {
        return await apiRequest<CheckoutSessionResponse>(`${API}/checkout/session/${jobId}`, "POST");
    },

    getWalletBalance: async (): Promise<WalletResponse> => {
        return await apiRequest<WalletResponse>(`${API}/wallet`, "GET");
    },

    requestWithdrawal: async (amount: number): Promise<any> => {
        return await apiRequest(`${API}/withdraw`, "POST", { amount });
    }
};
