# backend/api.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .workflow import WorkflowManager
import uuid

app = FastAPI()

# CORS middleware ekle (frontend için gerekli)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL'i
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global workflow instance'ı
workflows = {}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_input = data.get("message")
    thread_id = data.get("thread_id", "default")
    
    # Thread için workflow oluştur veya mevcut olanı kullan
    if thread_id not in workflows:
        workflows[thread_id] = WorkflowManager(thread_id=thread_id)
    
    workflow = workflows[thread_id]
    
    # Yanıtları topla
    responses = []
    for chunk in workflow.stream_updates(user_input):
        if chunk:
            responses.append(chunk)
    
    return {"response": "".join(responses), "thread_id": thread_id}

@app.get("/")
async def root():
    return {"message": "LangGraph Backend API"}
