from google import genai

client = genai.Client(api_key="AQ.Ab8RN6Ll462kuvDHKlnNBtNR9q3KgpYKvaMQGNOnCKl9T1ltWQ")

for model in client.models.list():
    print(model.name)