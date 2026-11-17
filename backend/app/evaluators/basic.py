import httpx
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"

def _call_llm_judge(system_prompt: str, prompt: str, response: str) -> dict:
    full_prompt = f"{system_prompt}\n\nPrompt: {prompt}\nResponse: {response}"
    payload = {
        "model": MODEL,
        "prompt": full_prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        with httpx.Client() as client:
            res = client.post(OLLAMA_URL, json=payload, timeout=30.0)
            if res.status_code == 200:
                data = res.json()
                content = data.get("response", "{}")
                parsed = json.loads(content)
                score = float(parsed.get("score", 0.0))
                reason = str(parsed.get("reason", "No reason provided."))
                return {"score": score, "reason": reason}
    except Exception as e:
        print(f"LLM Judge failed: {e}")
        
    return {"score": 0.0, "reason": "Evaluation failed to run."}

def evaluate_relevance(prompt: str, response: str) -> dict:
    system = (
        "You are an expert AI evaluator. Evaluate the following response for RELEVANCE to the prompt. "
        "Output ONLY a JSON object with two keys: 'score' (a float from 0.0 to 1.0) and 'reason' (a short string explaining why)."
    )
    result = _call_llm_judge(system, prompt, response)
    result["evaluator"] = "relevance"
    return result

def evaluate_groundedness(prompt: str, response: str, context: str = None) -> dict:
    system = (
        "You are an expert AI evaluator. Evaluate the following response for GROUNDEDNESS (factuality and lack of hallucinations) based on general knowledge. "
        "Output ONLY a JSON object with two keys: 'score' (a float from 0.0 to 1.0) and 'reason' (a short string explaining why)."
    )
    result = _call_llm_judge(system, prompt, response)
    result["evaluator"] = "groundedness"
    return result
