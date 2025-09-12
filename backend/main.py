import os
import logging
import shutil
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import faiss
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    Settings,
    load_index_from_storage,
)
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.faiss import FaissVectorStore

# Load environment variables
load_dotenv()

# Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "llama2")
DATA_DIR = "data"
PERSIST_DIR = "./storage"

# Initialize FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class Query(BaseModel):
    query: str

query_engine = None

def build_index_from_data():
    global query_engine
    documents = SimpleDirectoryReader(DATA_DIR).load_data()
    
    if not documents:
        logging.info("No documents to index.")
        query_engine = None
        return
    
    logging.info("Building new index...")
    d = 384  # Dimensions of BAAI/bge-small-en-v1.5
    faiss_index = faiss.IndexFlatL2(d)
    vector_store = FaissVectorStore(faiss_index=faiss_index)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
    index.storage_context.persist(persist_dir=PERSIST_DIR)
    query_engine = index.as_query_engine()
    logging.info("Finished building and saving new index.")

@app.on_event("startup")
async def startup_event():
    global query_engine
    if not os.path.exists(PERSIST_DIR):
        os.makedirs(PERSIST_DIR)
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    # Initialize the embedding model
    Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
    # Initialize the LLM
    Settings.llm = Ollama(model=MODEL_NAME, request_timeout=120.0)

    try:
        logging.info("Attempting to load index from storage...")
        vector_store = FaissVectorStore.from_persist_dir(PERSIST_DIR)
        storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR, vector_store=vector_store)
        index = load_index_from_storage(storage_context)
        query_engine = index.as_query_engine()
        logging.info("Successfully loaded index from storage.")
    except Exception as e:
        logging.info(f"Failed to load from storage: {e}. Checking for data to build a new index.")
        data_files = [f for f in os.listdir(DATA_DIR) if not f.startswith('.') and f != 'placeholder.txt']
        if data_files:
            build_index_from_data()
        else:
            logging.info("No data found to build index. Please upload a document.")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    # Clear existing data and storage
    for path in [DATA_DIR, PERSIST_DIR]:
        if os.path.exists(path):
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                try:
                    if os.path.isfile(item_path) or os.path.islink(item_path):
                        os.unlink(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                except Exception as e:
                    logging.error(f'Failed to delete {item_path}. Reason: {e}')
    
    # Save the new file
    file_path = os.path.join(DATA_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    build_index_from_data()
    
    return {"message": f"Successfully uploaded {file.filename} and built a new index."}


@app.get("/")
async def root():
    return {"status": "online"}

@app.post("/api/query_stream")
async def query_endpoint(query: Query):
    if query_engine is None:
        return {"error": "Query engine not initialized. Please upload a document."}, 503
    response = query_engine.query(query.query)
    return {"response": str(response)}
