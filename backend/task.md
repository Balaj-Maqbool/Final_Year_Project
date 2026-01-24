# Project Roadmap

- [x] **Implement Notification System** <!-- id: 1 -->
- [x] **Refactoring & Cleanup** <!-- id: 2 -->
    - [x] Remove verbose comments from controllers <!-- id: 3 -->
    - [x] Split `user.routes.js` into `auth` and `profile` routes <!-- id: 4 -->
    - [x] Optimize imports and folder structure <!-- id: 5 -->
- [x] **Security Hardening** <!-- id: 6 -->
    - [x] Implement Global Error Handler in `app.js` <!-- id: 7 -->
    - [x] Enforce "Cookie-Only" token policy (Remove tokens from JSON body) <!-- id: 8 -->
    - [x] Fix JWT expiration handling (Returns 401 instead of 500) <!-- id: 9 -->
    - [x] Fix Refresh Token logic bugs <!-- id: 10 -->

## Future Features (Pending)

- [ ] **Forgot Password Flow** <!-- id: 11 -->
    - [ ] Reset Link via Email + Token Validation

- [ ] **AI Integration (Smart Marketplace)** <!-- id: 12 -->
    - **Goal**: Integrate LLM (OpenAI/Gemini) to assist users.

    - [ ] **1. Client: "The Job Architect"**
        - Input: Client describes problem in natural language (e.g., "I need a flower shop website").
        - AI Output: Suggests professional Job Title, Description, Required Skills, and Budget Range.
        - Tech: Prompt Engineering to structured JSON.

    - [ ] **2. Freelancer: "The Profile Polisher"**
        - Input: Freelancer provides raw skills/details.
        - AI Output: Generates a professional Bio and extracts optimal Skill Tags.
    
    - [ ] **3. Platform Assistant (Chatbot)**
        - Input: User asks about platform rules/features.
        - AI Output: RAG (Retrieval Augmented Generation) or Context-aware answers about Admins, Fees, and Policies.
