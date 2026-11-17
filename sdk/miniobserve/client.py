import os
import time
import requests
from functools import wraps
import uuid

class MiniObserveClient:
    def __init__(self, api_key=None, host="http://localhost:8000"):
        self.api_key = api_key or os.environ.get("MINIOBSERVE_API_KEY")
        self.host = host
        
        if not self.api_key:
            print("Warning: MINIOBSERVE_API_KEY not found. Traces will not be saved.")
    
    def log_trace(self, **kwargs):
        if not self.api_key:
            return
            
        url = f"{self.host}/traces/"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # We expect model, prompt, response, input_tokens, output_tokens, latency_ms, status
        try:
            # fire and forget in real world, but simple block here
            requests.post(url, json=kwargs, headers=headers, timeout=2.0)
        except Exception as e:
            print(f"Failed to log trace to MiniObserve: {e}")

_client = None

def init(api_key=None, host="http://localhost:8000"):
    global _client
    _client = MiniObserveClient(api_key=api_key, host=host)

def log_trace(**kwargs):
    if _client:
        _client.log_trace(**kwargs)

def observe(model_name="default-model"):
    """
    Decorator for wrapping LLM calls. 
    Assumes the decorated function takes `prompt` as kwarg or first arg,
    and returns a string (response) or dict containing info.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not _client:
                init()
                
            start_time = time.time()
            prompt = kwargs.get("prompt")
            if not prompt and args:
                prompt = str(args[0])
                
            status = "success"
            error_msg = None
            response = ""
            
            try:
                result = func(*args, **kwargs)
                if isinstance(result, str):
                    response = result
                elif hasattr(result, "choices"): # openai-like
                    response = result.choices[0].message.content
                else:
                    response = str(result)
            except Exception as e:
                status = "error"
                error_msg = str(e)
                raise e
            finally:
                latency = (time.time() - start_time) * 1000
                
                # mock token counting for now
                input_tokens = len(str(prompt).split()) * 1.3
                output_tokens = len(str(response).split()) * 1.3
                
                if _client:
                    _client.log_trace(
                        trace_id=str(uuid.uuid4()),
                        model=model_name,
                        prompt=prompt or "",
                        response=response,
                        input_tokens=int(input_tokens),
                        output_tokens=int(output_tokens),
                        latency_ms=latency,
                        status=status,
                        error_message=error_msg
                    )
                    
            return result
        return wrapper
    return decorator
