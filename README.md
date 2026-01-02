# DocuMind: Vibe Coding with Antigravity 🚀

Welcome to **DocuMind**, a state-of-the-art AI-powered document assistant. This project was developed as a comprehensive test of **Vibe Coding** using the **Antigravity** agentic AI.

DocuMind transforms static PDF documents into dynamic, multimodal experiences—offering executive summaries, visual infographics, and real-time voice conversations using the latest Gemini 2.x models.

---

## 🎯 Main Objective

The primary goal of this project is to demonstrate the power of **Vibe Coding** with **Antigravity**, building a professional, high-fidelity application with complex AI integrations (Text, Image, and Live Audio) through natural interaction and high-level architectural constraints.

---

## 👤 User Stories (HU)

### HU01: Multimodal Document Processing
* **As a user**, I want to upload PDF documents.
* **So that** the system can meticulously analyze the file and extract high-impact technical information with maximum precision.

### HU02: Intelligent Executive Summary
* **As a user**, I want to receive an executive summary in professional Markdown format.
* **So that** I can consume the most relevant information in seconds without reading the entire document.

### HU03: Technical Visual Infographics
* **As a user**, I want the AI to generate a high-fidelity visual infographic.
* **So that** I can understand complex architectures, hierarchies, and concepts through a modern and clean design.

### HU04: Gemini Live Voice Assistant
* **As a user**, I want to engage in a low-latency voice conversation with an AI about the document.
* **So that** I can ask questions and clear doubts naturally using live audio (Gemini Live).

---

## 🏗️ Architecture & Design Principles

The project follows a strict architectural pattern to ensure scalability, security, and maintainability:

### 1. Layer Isolation (UI ↔ Integration ↔ Logic)
* **Rule**: UI components are strictly prohibited from making direct fetch calls or using the Firebase SDK.
* **Implementation**: All external communications are routed through a dedicated **Integration Layer** (`src/integration/`) and **Logic Layer** (`src/logic/`).

### 2. Stateless Logic Orchestration
* **Rule**: The AI Logic layer does not persist session states in local memory.
* **Scalability**: It utilizes Auth Tokens and context retrieval on every request to guarantee support for 100+ concurrent users without state corruption.

### 3. Intent-Revealing Design
* **Naming**: Variable and function names follow domain-specific terminology (e.g., `generateDocumentSummary`, `startAudioConversation`).
* **Clean Code**: The codebase explains "what" it does through clarity, using comments only for "why" a non-obvious decision was made.

---

## 🛠️ Technology Stack

* **Core**: [Vite](https://vitejs.dev/) + Vanilla JavaScript.
* **Styling**: Modern CSS with **Glassmorphism**, vibrant gradients, and micro-animations.
* **AI Engine**: [Google Gemini 2.x](https://deepmind.google/technologies/gemini/) (Pro, Flash & Flash-Image).
* **Cloud Infrastructure**: [Firebase](https://firebase.google.com/) (Vertex AI for Firebase, Storage, Hosting).
* **Parsing**: `marked` for high-speed Markdown rendering.

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📄 License

This project was built during a Vibe Coding session. All rights reserved.

---
*Created with ❤️ by Antigravity for jggomez.*