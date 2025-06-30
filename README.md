
# 🤖 RAGBot: Your Personal AI Knowledge Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js Version">
  <img src="https://img.shields.io/badge/Framework-FastAPI-05998b.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB.svg" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

RAGBot is a full-stack application that combines a sleek React frontend with a powerful Python backend to create a Retrieval-Augmented Generation (RAG) chatbot. It leverages local language models through **Ollama**, allowing you to chat with your own documents and get context-aware answers without relying on external APIs.

The backend is built with **FastAPI** and **LlamaIndex**, using a **FAISS** vector store for efficient similarity searches. The frontend is a modern **React** application built with **Vite** and styled with **Tailwind CSS**.

## ✨ Features

- **Interactive Chat Interface**: A clean and simple UI to interact with the RAG pipeline.
- **Local First**: Powered entirely by local LLMs via Ollama, ensuring privacy and offline capability.
- **Bring Your Own Data**: Ingests and indexes your own documents (PDFs, TXT, etc.) as the knowledge base.
- **Persistent Vector Storage**: Uses FAISS to create and persist a vector index, ensuring fast retrieval on subsequent runs.
- **Asynchronous Backend**: Built with FastAPI for high performance.
- **Hot-Reloading**: Enabled for both frontend and backend for a smooth development experience.

## 🛠️ Tech Stack

| Area      | Technology                                                              |
|-----------|-------------------------------------------------------------------------|
| **Backend**   | Python, FastAPI, LlamaIndex, Ollama, FAISS                              |
| **Frontend**  | React, Vite, Tailwind CSS                                               |
| **Embeddings**| Hugging Face `BAAI/bge-small-en-v1.5`                                   |
| **LLM**       | Any Ollama-compatible model (e.g., `llama2`, `mistral`, `gemma`)        |


## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Python](https://www.python.org/downloads/) (v3.10+ recommended)
- [Node.js](https://nodejs.org/en/download/) (v18+ recommended)
- [Ollama](https://ollama.com/) installed and running.

### Installation & Setup

**1. Clone the Repository**
```bash
git clone https://github.com/your-username/RAGBot.git
cd RAGBot
```

**2. Backend Setup**
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Pull your desired LLM from Ollama (e.g., llama2)
ollama pull llama2

# Create a .env file in the `backend` directory
touch .env

# Add your model name to the .env file
echo 'MODEL_NAME="llama2"' > .env

# Add your knowledge base files (PDFs, .txt, etc.)
# to the `backend/data` directory. A placeholder is included.
```

**3. Frontend Setup**
```bash
# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
npm install
```

### Running the Application

You'll need to run the backend and frontend servers in separate terminals.

**Terminal 1: Start the Backend Server**
```bash
# From the `backend` directory (with venv activated)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be available at `http://localhost:8000`. The first time you run it, it will take a few moments to build the vector index.

**Terminal 2: Start the Frontend Development Server**
```bash
# From the `frontend` directory
npm run dev
```
The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

## ⚙️ How It Works

The application follows a standard RAG pipeline:

1.  **Data Loading**: On the first startup, the `SimpleDirectoryReader` from LlamaIndex loads all documents from the `backend/data` directory.
2.  **Indexing**: The documents are parsed, and embeddings are generated using the `bge-small-en-v1.5` model. These embeddings are stored in a `faiss` vector index.
3.  **Persistence**: The generated index is persisted to the `backend/storage` directory. On subsequent startups, the application loads the index directly from storage, skipping the need to re-process the documents.
4.  **Querying**: When you send a message from the frontend, it hits the `/api/query_stream` endpoint. The query is converted into an embedding, which is used to search the FAISS index for the most relevant document chunks.
5.  **Generation**: The retrieved context and your original query are passed to the Ollama LLM, which generates a context-aware response that is streamed back to the UI.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
