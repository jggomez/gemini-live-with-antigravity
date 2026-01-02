# DocuMind: Vibe Coding with Antigravity 🚀

Welcome to **DocuMind**, a state-of-the-art AI-powered document assistant. This project was developed as a comprehensive test of **Vibe Coding** using the **Antigravity** agentic AI.

DocuMind transforms static PDF documents into dynamic, multimodal experiences—offering executive summaries, visual infographics, and real-time voice conversations using the latest Gemini 2.x models.

---

## 🎯 Main Objective

The primary goal of this project is to demonstrate the power of **Vibe Coding** with **Antigravity**, building a professional, high-fidelity application with complex AI integrations (Text, Image, and Live Audio) through natural interaction and high-level architectural constraints.

---

## 👤 User Stories (HU) & Acceptance Criteria

### HU01: Document Upload
* **Description**: As a user, I want to upload a PDF so that the system can process its content.
* **Acceptance Criteria (CA)**:
    - Support for files up to 20MB.
    - PDF format validation.
    - Success notification upon indexing.

### HU02: Executive Summary
* **Description**: As a user, I want an automatic summary after uploading to understand the file quickly.
* **Acceptance Criteria (CA)**:
    - Generation in < 10 seconds.
    - Structure: Title, Context, and Key Points.
    - Persistent availability in the UI.

### HU03: Q&A Queries
* **Description**: As a user, I want to ask text questions to get answers from the document.
* **Acceptance Criteria (CA)**:
    - Responses based strictly on the PDF content.
    - Inclusion of citations or page references.
    - Conversation history management.

### HU04: Voice Interaction (Gemini Live)
* **Description**: As a user, I want to talk to the document using Gemini Live for a natural interaction.
* **Acceptance Criteria (CA)**:
    - Microphone activation button.
    - Real-time transcription.
    - Audible response (Native Multimodal Audio).

### HU05: Visual Infographic
* **Description**: As a user, I want a graphical representation of the content to understand hierarchies.
* **Acceptance Criteria (CA)**:
    - Extraction of key concepts.
    - Generation of a downloadable visual schema.
    - Option to regenerate with a different focus.

---

## ✨ Quality Attributes

- **Performance**: Q&A and Voice responses delivered in under 5 seconds to maintain conversational flow.
- **Scalability**: Serverless architecture capable of supporting 100+ concurrent users via Firebase infrastructure.
- **Portability**: Built with Vanilla JavaScript, ensuring compatibility across all modern browsers and devices (Desktop/Mobile).
- **Availability**: 99.9% uptime guaranteed by Google Cloud and Firebase SLAs.

---

## 🏗️ Architectural Decisions

### 1. AI Model Selection
- **Model**: `gemini-2.0-flash-native-audio-preview` (and Gemini 2.x Flash variants).
- **Rationale**: Chosen for its native ability to process audio without heavy STT/TTS intermediaries, significantly reducing latency and improving the user experience.

### 2. Frontend Technology
- **Stack**: HTML5, CSS3, and Vanilla JavaScript.
- **Rationale**: Maximizes load speed and strictly adheres to portability requirements without framework overhead.

### 3. Backend & Logic
- **Engine**: Firebase AI Logic.
- **Rationale**: Centralizes security (API Keys), manages authentication, and serves as a robust bridge to the Gemini API.

### 4. Design Pattern: Layered Architecture
- **UI Layer**: Handles DOM manipulation and user events.
- **Logic Layer**: Orchestrates audio controllers, PDF processing, and visualization logic.
- **Integration Layer**: Manages all communication with external services (Firebase/Gemini).

---

## 🏗️ Design Principles

- **Layer Isolation**: UI components never communicate directly with Firebase or external APIs.
- **Stateless Orchestration**: The logic layer does not persist session states in local memory, using tokens for context retrieval to ensure scalability.
- **Intent-Revealing Names**: Focus on domain-specific terminology for maximum code clarity.

---

## 🛠️ Technology Stack

* **Core**: [Vite](https://vitejs.dev/) + Vanilla JavaScript.
* **Styling**: Modern CSS with **Glassmorphism**, vibrant gradients, and micro-animations.
* **AI Engine**: [Google Gemini 2.x](https://deepmind.google/technologies/gemini/).
* **Cloud Infrastructure**: [Firebase](https://firebase.google.com/) (Vertex AI, Storage, Hosting).

---

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Run the development server**: `npm run dev`
3. **Open the app**: Navigate to `http://localhost:3000`

---

## 📄 License

This project was built during a Vibe Coding session. All rights reserved.

---
*Created with ❤️ by Antigravity for jggomez.*