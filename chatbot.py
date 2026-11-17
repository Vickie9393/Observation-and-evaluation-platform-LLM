import os
import sys
import time

# Ensure we can find the local SDK
sys.path.append(os.path.abspath("sdk"))
from miniobserve import init, observe

print("Welcome to the MiniObserve Test Chatbot!")
print("Please go to your dashboard (http://localhost:5173), create a project, and copy its API Key.")
API_KEY = input("\nEnter your Project API Key: ").strip()

# Initialize the MiniObserve SDK with the provided API key
init(api_key=API_KEY, host="http://localhost:8000")

class MockChatbot:
    # The @observe decorator automatically logs inputs, outputs, and latency!
    @observe(model_name="mock-chat-v1")
    def chat(self, prompt: str):
        # Simulate some processing time
        time.sleep(0.5)
        
        # Simple rule-based responses
        lower_prompt = prompt.lower()
        if "hello" in lower_prompt or "hi" in lower_prompt:
            return "Hello there! I am a simple bot hooked up to MiniObserve. How can I help you?"
        elif "error" in lower_prompt:
            raise ValueError("You asked me to simulate an error, so here it is!")
        elif "secret" in lower_prompt:
            return "I can't tell you the secret, but MiniObserve is securely logging this attempt!"
        elif "bye" in lower_prompt:
            return "Goodbye! Check your dashboard to see our conversation logged."
        else:
            return f"I heard you say: '{prompt}'. This interaction is being recorded as a trace."

bot = MockChatbot()
print("\n--- Chat Session Started ---")
print("Type 'quit' or 'exit' to stop.")

while True:
    try:
        user_input = input("\nYou: ")
        if user_input.lower() in ["quit", "exit"]:
            print("Stopping chatbot. Have a look at your MiniObserve dashboard!")
            break
            
        response = bot.chat(prompt=user_input)
        print(f"Bot: {response}")
        
    except Exception as e:
        print(f"Bot Error: {e}")
