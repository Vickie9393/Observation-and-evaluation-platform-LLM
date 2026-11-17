import sqlite3
import httpx
import uuid

# 1. Connect to DB and get a project
conn = sqlite3.connect('miniobserve.db')
cursor = conn.cursor()
cursor.execute('SELECT id, api_key FROM projects LIMIT 1')
project = cursor.fetchone()

if not project:
    print('No projects found')
else:
    project_id = project[0]
    api_key = project[1]
    
    # 2. Create an alert with threshold 0 so it always fires
    alert_id = str(uuid.uuid4())
    webhook = 'https://webhook.site/354178ff-ae8f-42a3-a3b6-d894ce825cd8'
    cursor.execute(
        """INSERT INTO alerts (id, project_id, name, condition, threshold, webhook_url, created_at) 
        VALUES (?, ?, 'Test Webhook Alert', 'latency_greater_than', 0, ?, datetime('now'))""",
        (alert_id, project_id, webhook)
    )
    conn.commit()
    conn.close()
    
    # 3. Fire a trace to trigger the alert
    print('Alert created. Sending test chat...')
    try:
        res = httpx.post(
            'http://localhost:8000/v1/chat/completions',
            json={'model': 'llama3.2', 'messages': [{'role': 'user', 'content': 'hello'}]},
            headers={'Authorization': f'Bearer {api_key}'},
            timeout=30.0
        )
        print('Chat sent. Background task is now evaluating the trace and should fire the webhook!')
    except Exception as e:
        print(f'Error sending chat: {e}')
