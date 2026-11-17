import sqlite3

def run_migration():
    conn = sqlite3.connect('miniobserve.db')
    cursor = conn.cursor()
    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN eval_relevance_enabled BOOLEAN DEFAULT 1')
        cursor.execute('ALTER TABLE projects ADD COLUMN eval_groundedness_enabled BOOLEAN DEFAULT 1')
    except Exception as e:
        print("eval columns already exist:", e)

    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN openai_api_key TEXT')
        cursor.execute('ALTER TABLE projects ADD COLUMN anthropic_api_key TEXT')
        cursor.execute('ALTER TABLE projects ADD COLUMN gemini_api_key TEXT')
        cursor.execute('ALTER TABLE projects ADD COLUMN groq_api_key TEXT')
        conn.commit()
        print("API keys migration successful")
    except Exception as e:
        print("Migration failed or already applied:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
