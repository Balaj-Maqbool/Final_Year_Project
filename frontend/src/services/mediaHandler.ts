import { apiRequest } from "./apiClient";

export interface UploadSignatureResponse {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
}

export interface Attachment {
    url: string;
    publicId: string;
    resourceType: string;
    originalName?: string;
}

export const mediaHandler = {
    getUploadSignature: async (folderType: "chat" | "profile" | "job" | "cover", threadId?: string): Promise<UploadSignatureResponse> => {
        let endpoint = `/media/config?folderType=${folderType}`;
        if (threadId) {
            endpoint += `&threadId=${threadId}`;
        }
        return await apiRequest<UploadSignatureResponse>(endpoint, "GET");
    },

    uploadFileToCloudinary: async (file: File, config: UploadSignatureResponse): Promise<Attachment> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", config.apiKey);
        formData.append("timestamp", config.timestamp.toString());
        formData.append("signature", config.signature);
        formData.append("folder", config.folder);

        // Standard Cloudinary upload endpoint
        const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`;

        const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload file to Cloudinary: ${errorText}`);
        }

        const data = await response.json();
        
        return {
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            originalName: file.name
        };
    }
};
