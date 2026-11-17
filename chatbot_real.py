import os
from openai import OpenAI

print("=======================================")
print("🤖 Real AI Chatbot powered by MiniObserve")
print("=======================================\n")

# Normally, you would use api_key="sk-...", but because MiniObserve is
# intercepting the request, we pass your MiniObserve Project Key!
API_KEY = input("Enter your MiniObserve Project API Key: ").strip()

# Initialize the OFFICIAL OpenAI client, but trick it into talking to our backend!
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key=API_KEY,
)

print("\n(Note: Ensure Ollama is running on your machine and you have pulled a model like llama3.2)")
print("Type 'quit' or 'exit' to stop.")

while True:
    try:
        user_input = input("\nYou: ")
        if user_input.lower() in ["quit", "exit"]:
            print("Goodbye! Check your MiniObserve dashboard to see the traces.")
            break
            
        print("Waiting for AI...")
        
        # This looks exactly like a normal OpenAI API call!
        response = client.chat.completions.create(
            model="llama3.2",
            messages=[
                {"role": "system", "content": "You are a helpful and concise assistant."},
                {"role": "user", "content": user_input}
            ]
        )
        
        print(f"Bot: {response.choices[0].message.content}")
        
    except Exception as e:
        print(f"\n[ERROR] Failed to connect. Is Ollama running?")
        print(f"Details: {e}")
