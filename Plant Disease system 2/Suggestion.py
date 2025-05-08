import openai
import json

# Set your OpenAI API key here
openai.api_key = "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"


def get_disease_info_from_gpt(disease_name: str) -> dict:
    """
    Calls the OpenAI GPT API with a system prompt to generate a JSON response
    about a plant disease, including details for disease, treatment, and prevention.
    """
    # Define the system prompt with instructions on the response format.
    system_prompt = (
        "You are an AI assistant that provides structured information about plant diseases. "
        "For a given disease name, generate a JSON response with the following structure:\n\n"
        "{\n"
        "  \"disease\": {\n"
        "    \"name\": \"Disease Name\",\n"
        "    \"description\": \"A description of the disease.\"\n"
        "  },\n"
        "  \"treatment\": [\n"
        "    {\n"
        "      \"title\": \"Treatment Title\",\n"
        "      \"description\": \"Description of the treatment.\",\n"
        "      \"icon\": \"icon_name\"\n"
        "    }\n"
        "    // ... additional treatment items\n"
        "  ],\n"
        "  \"prevention\": [\n"
        "    {\n"
        "      \"title\": \"Prevention Title\",\n"
        "      \"description\": \"Description of the prevention method.\",\n"
        "      \"icon\": \"icon_name\"\n"
        "    }\n"
        "    // ... additional prevention items\n"
        "  ]\n"
        "}\n\n"
        "Use the disease name provided to generate realistic content for each section."
    )

    # Create the user prompt using the provided disease name.
    user_prompt = f"Generate response information for '{disease_name}'."

    # Call the OpenAI ChatCompletion API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # or another model if needed
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )

    # Extract the generated message from the response.
    generated_content = response.choices[0].message["content"]
    
    # Optionally, if the response is in JSON format, you might parse it:
    try:
        parsed_response = json.loads(generated_content)
    except json.JSONDecodeError:
        # If it's not valid JSON, you can return the raw text or handle the error as needed.
        parsed_response = generated_content

    return parsed_response


# Example usage:
if __name__ == '__main__':
    disease = "Powdery Mildew"
    result = get_disease_info_from_gpt(disease)
    # Print the GPT API response formatted as JSON.
    print(json.dumps(result, indent=2) if isinstance(result, dict) else result)