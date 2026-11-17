from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    language: str
    version: str
    code: str

JUDGE0_API_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true"

LANGUAGE_MAP = {
    'python': 71,
    'java': 62,
    'c': 50,
    'cpp': 54,
    'javascript': 93
}

@router.post("/execute")
async def execute_code(request: CodeExecutionRequest):
    if request.language not in LANGUAGE_MAP:
        raise HTTPException(status_code=400, detail="Unsupported language")
        
    try:
        payload = {
            "source_code": request.code,
            "language_id": LANGUAGE_MAP[request.language]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(JUDGE0_API_URL, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Combine stdout, stderr, compile_output into a single string for the frontend
            output_parts = []
            if data.get('compile_output'):
                output_parts.append(data['compile_output'])
            if data.get('stdout'):
                output_parts.append(data['stdout'])
            if data.get('stderr'):
                output_parts.append(data['stderr'])
                
            final_output = "\n".join(output_parts) if output_parts else ""
            
            # Format response to match what the frontend expects
            return {
                "run": {
                    "output": final_output
                }
            }
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Execution engine error: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Could not connect to execution engine: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
