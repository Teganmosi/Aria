from openai import OpenAI
import os

try:
    client = OpenAI(api_key="sk-test") # dummy key
    print("OpenAI client initialized")
    print(f"Chat: {client.chat}")
    print(f"Completions: {client.chat.completions}")
except Exception as e:
    print(f"Error: {e}")
