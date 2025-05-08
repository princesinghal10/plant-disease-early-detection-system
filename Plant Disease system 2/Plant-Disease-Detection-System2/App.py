from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import os
import numpy as np
from PIL import Image
from tensorflow import keras
from keras.models import model_from_json
import openai
import json

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

diseaseName = ""

# Path for the model directory
baseDirectory = "C:\\Users\\princ\\OneDrive\\Desktop\\Plant Disease system 2\\Plant-Disease-Detection-System\\Model"

# Load model from JSON file and weights
with open(os.path.join(baseDirectory, 'trainedModel.json'), 'r') as jsonFile:
    plantModelJson = jsonFile.read()
plantModel = model_from_json(plantModelJson)
plantModel.load_weights(os.path.join(baseDirectory, 'modelweight.h5'))

# Define plantDiseaseClasses - update this list according to your model's classes
plantDiseaseClasses = [
    ('Apple', 'Apple Scab'),
    ('Apple', 'Black Rot'),
    ('Apple', 'Cedar Apple Rust'),
    ('Apple', 'Healthy'),
    ('Blueberry', 'Healthy'),
    ('Cherry(including sour)', 'Powdery Mildew'),
    ('Cherry(including sour)', 'Healthy'),
    ('Corn(Maize)', 'Cercospora Leaf Spot Gray Leaf Spot'),
    ('Corn(Maize)', 'Common Rust '),
    ('Corn(Maize)', 'Northern Leaf Blight'),
    ('Corn(Maize)', 'Healthy'),
    ('Grape', 'Black rot'),
    ('Grape', 'Esca(Black Measles)'),
    ('Grape', 'Leaf Blight(Isariopsis Leaf Spot)'),
    ('Grape', 'Healthy'),
    ('Orange', 'Haunglongbing(Citrus Greening)'),
    ('Peach', 'Bacterial Spot'),
    ('Peach', 'Healthy'),
    ('Pepper Bell', 'Bacterial Spot'),
    ('Pepper Bell', 'Healthy'),
    ('Potato', 'Early Blight'),
    ('Potato', 'Late Blight'),
    ('Potato', 'Healthy'),
    ('Raspberry', 'Healthy'),
    ('Soybean', 'Healthy'),
    ('Squash', 'Powdery Mildew'),
    ('Strawberry', 'Leaf Scorch'),
    ('Strawberry', 'Healthy'),
    ('Tomato', 'Bacterial Spot'),
    ('Tomato', 'Early Blight'),
    ('Tomato', 'Late Blight'),
    ('Tomato', 'Leaf Mold'),
    ('Tomato', 'Septoria leaf Spot'),
    ('Tomato', 'Spider Mites Two-spotted Spider Bite'),
    ('Tomato', 'Target Spot'),
    ('Tomato', 'Tomato Yellow Leaf Curl Virus'),
    ('Tomato', 'Tomato Mosaic Virus'),
    ('Tomato', 'Healthy'),    
]

def predictDisease(postImage):
    """
    Save and preprocess the image, predict using the model, and return a disease object.
    """
    # Save the incoming image temporarily
    imagePath = os.path.join(baseDirectory, 'localImage.jpg')
    postImage.save(imagePath)
    
    # Preprocess the image: resize and normalize
    newImg = keras.utils.load_img(imagePath, target_size=(256, 256))
    os.remove(imagePath)
    testImage = keras.utils.img_to_array(newImg)
    testImage = np.expand_dims(testImage, axis=0)
    testImage = testImage / 255.0
    
    # Make prediction
    prediction = plantModel.predict(testImage)
    index = prediction.argmax(axis=-1)[0]
    className = plantDiseaseClasses[index]
    diseaseName = className[1]
    
    # Format the disease output with a dummy severity value
    output = {
        "PlantDisease": {
            "name": className[0],
            "description": className[1]
        }
    }
    return output


openai.api_key = "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"

def get_disease_info_from_gpt(disease_name: str) -> dict:
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
        "  ],\n"
        "  \"prevention\": [\n"
        "    {\n"
        "      \"title\": \"Prevention Title\",\n"
        "      \"description\": \"Description of the prevention method.\",\n"
        "      \"icon\": \"icon_name\"\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Ensure the response is always valid JSON."
    )

    user_prompt = f"Generate response information for '{disease_name}' in JSON format. Ensure it's valid and well-structured."

    print("Sending request to GPT:", user_prompt)

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",  
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=1000,  # Increase token limit to prevent truncation
        temperature=0.7
    )
    print(response)

    generated_content = response.choices[0].message["content"]
    
    print("Raw GPT Response:")
    print(generated_content)  # Debugging

    # Ensure it's valid JSON
    try:
        parsed_response = json.loads(generated_content)
    except json.JSONDecodeError:
        print("Error: GPT returned malformed JSON.")
        parsed_response = {}  # Return an empty dictionary instead of invalid JSON

    return parsed_response

@app.route('/', methods=['GET', 'POST', 'PUT', 'DELETE'])
def greet():
    return jsonify({"message": "Hello! Welcome to our API."})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    print("Inside analyze")
    data = request.get_json()
    #if not data or 'image' not in data:
    #    return jsonify({"error": "No image provided"}), 400
    
    # static_image_path = "C:\\Users\\princ\\OneDrive\\Desktop\\Plant Disease system 2\\Plant-Disease-Detection-System\\Client\\static\\logo.jpeg"
    # image = Image.open(static_image_path)
    # prediction_output_1 = predictDisease(image)
    # print("After prediciton output is ")
    # print(prediction_output_1)

    try:
        # Remove data URL prefix if present
        print("Inside try")
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
            
        # Decode the base64 string and open the image using PIL
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
       
        prediction_output = predictDisease(image)
        print(prediction_output.get("PlantDisease").get("description"))
        treatmentAndPrevention = get_disease_info_from_gpt(prediction_output.get("PlantDisease").get("description"))
        if isinstance(treatmentAndPrevention, str):
            try:
                treatmentAndPrevention = json.loads(treatmentAndPrevention)  # Convert JSON string to dict
            except json.JSONDecodeError:
                print("Error: Received a string but it's not valid JSON.")
                treatmentAndPrevention = {} 
        response = prediction_output.copy()
        print("Responses : ")
        print(response)
        if isinstance(treatmentAndPrevention, dict):
            response.update(treatmentAndPrevention)
        print(response)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4005, debug=True)
