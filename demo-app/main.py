import os
import sys
import time
import random

# Add SDK to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sdk")))

from miniobserve import init, observe

# Set up MiniObserve client
API_KEY = os.environ.get("MINIOBSERVE_API_KEY", "your_project_api_key_here")
init(api_key=API_KEY, host="http://localhost:8000")

# Simulate a simple mock LLM client
class MockLLMClient:
    @observe(model_name="gpt-4o-mini")
    def chat_completion(self, prompt: str):
        # Simulate network latency
        time.sleep(random.uniform(0.5, 2.0))
        
        # Simulate occasional hallucinations or poor responses
        if "secret" in prompt.lower():
            return "I am just an AI, I don't know the secret. Or maybe I do but I forgot."
        elif "error" in prompt.lower():
            raise Exception("Simulated LLM API Error: Request Timeout")
        else:
            return f"This is a simulated helpful response to: {prompt}"

if __name__ == "__main__":
    print(f"Starting Demo App with API Key: {API_KEY}")
    client = MockLLMClient()
    
    prompts = [
        "How do I reset my password?",
        "What is the secret to life?",
        "Please trigger an error for me.",
        "Can you explain the billing process?",
        "Tell me about the new features.",
        "I don't know what to do next."
    ]
    
    for i in range(10):
        prompt = random.choice(prompts)
        print(f"\n--- Request {i+1} ---")
        print(f"Prompt: {prompt}")
        try:
            response = client.chat_completion(prompt=prompt)
            print(f"Response: {response}")
        except Exception as e:
            print(f"Error: {e}")
            
        time.sleep(1)
    
    print("\nDemo completed. Check the MiniObserve dashboard for traces!")
