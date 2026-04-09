try:
    from openai.resources.beta import realtime
    print("Found! openai.resources.beta.realtime")
except ImportError:
    print("NOT found! openai.resources.beta.realtime")

try:
    import openai
    print(f"OpenAI Version: {openai.__version__}")
except:
    pass
