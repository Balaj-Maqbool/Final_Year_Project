# Frontend Media Guide 📸

This guide explains how to handle file uploads in the application using the **Media Module**.

## Overview

We use a **Hybrid Approach**:

1.  **Chat Attachments**: **Client-Side Signed Uploads** (Direct to Cloudinary).
2.  **Profile/Cover Images**: **Server-Side Uploads** (Standard Form Data).

---

## 1. Chat Attachments (The New Way) 🚀

**Speed is priority**. The Frontend uploads directly to Cloudinary to avoid server bottlenecks.

### Step A: Get a Signature

Ask the backend for permission to upload to a specific thread.

**Endpoint**: `GET /api/v1/media/config`
**Query Params**:

- `folderType`: "chat"
- `threadId`: "12345..." (The ID of the chat thread)

**Request:**

```javascript
const res = await axiosClient.get("/media/config", {
    params: {
        folderType: "chat",
        threadId: activeThreadId
    }
});
const { signature, timestamp, apiKey, cloudName, folder } = res.data.data;
```

### Step B: Upload to Cloudinary

Use the data from Step A to upload the file.

**Code Example:**

```javascript
const formData = new FormData();
formData.append("file", fileObject); // From <input type="file">
formData.append("api_key", apiKey);
formData.append("timestamp", timestamp);
formData.append("signature", signature);
formData.append("folder", folder);

const uploadRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, // 'auto' handles images/videos/pdfs
    formData
);

const { secure_url, public_id, resource_type } = uploadRes.data;
```

### Step C: Send Message via Socket

Send the metadata to the Chat Server.

```javascript
socket.emit("send_message", {
    threadId: activeThreadId,
    content: "Here is the file",
    attachments: [
        {
            url: secure_url, // Use HTTPS
            publicId: public_id, // Vital for deletion
            resourceType: resource_type // "image", "video", "raw"
        }
    ]
});
```

---

## 2. Profile & Cover Images (The Classic Way) 🖼️

**Simplicity is priority**. Just send the file to the backend.

### Profile Picture

**Endpoint**: `PATCH /api/v1/users/update-profile-image`
**Method**: `multipart/form-data`
**Field Name**: `profileImage`

### Cover Image

**Endpoint**: `PATCH /api/v1/users/update-cover-image`
**Method**: `multipart/form-data`
**Field Name**: `coverImage`

---

## 3. Attachment Object Structure

When you receive messages via Socket (`new_message`) or API (`/messages`), attachments will look like this:

```javascript
attachments: [
    {
        _id: "6789...",
        url: "https://res.cloudinary.com/.../img.jpg",
        publicId: "FreelanceMarketplace/Chat/thread_123/img",
        resourceType: "image" // or "video", "raw"
    }
];
```

**Use `resourceType` to decide how to render:**

- `image` -> `<img src={url} />`
- `video` -> `<video src={url} />`
- `raw` -> `<a href={url} download>Download File</a>`
