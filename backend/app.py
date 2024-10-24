import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from bson.json_util import dumps
import os
import boto3
from csvstuff import maps_associated_with_team

app = Flask(__name__)
CORS(app)

load_dotenv()
uri = os.getenv("uri")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['vcthackathon']
collection = db['user-team']
player_collection = db['players']

@app.route('/upload-user-team', methods=['POST'])
def upload_user_team():
    # Get data from request
    data = request.json
    
    # Insert data into MongoDB
    result = collection.find_one_and_update (
        {"_id" : 0},
        {"$set" : data},
        upsert=True,
        return_document=False
    )
    
    # Return confirmation
    if result is None:
        print(f"Document with ID 0 was inserted.")
    else:
        print(f"Document with ID 0 was updated.")
    
    return jsonify({'message': 'Data uploaded successfully'}), 200

@app.route('/get-player', methods=['GET'])
def get_player():
    print(request.args)
    ign = request.args.get('ign')

    if not ign:
        return jsonify({'error': 'Missing ign'}), 400

    try:
        result = player_collection.find_one({"IGN": ign})
        
        if result:
            result_str = dumps(result)
            return jsonify(result_str)
        else:
            return jsonify({'message': f"No data found for key '{ign}'"}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-all-players', methods=['GET'])
def get_all_players():
    try:
        result = player_collection.find()
        
        if result:
            result_str = dumps(result)
            return jsonify(result_str)
        else:
            return jsonify({'message': 'No data found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/eval-winner', methods=['POST'])
def query_llama():
    data = request.json['prompt']
    
    team1 = data.split(",")[0].strip()
    team2 = data.split(",")[1].strip()

    prompt = f"""
    Who will win between {team1} and {team2}?
    Here is information about team 1:
    {maps_associated_with_team(team1)}

    Here is information about team 2:
    {maps_associated_with_team(team2)}
    Although there is very little information, please provide me with a one word prediction for the winner.
    """
    
    input_payload = {
        "message": prompt
    }

    bedrock_runtime = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1',  # Update to your preferred region
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

    try:
        response = bedrock_runtime.invoke_model(
            body=json.dumps(input_payload),
            modelId="cohere.command-r-plus-v1:0", 
            accept="application/json", 
            contentType="application/json"
        )

        parsed_response = json.loads(response['body'].read())
        return parsed_response['text']  # Assuming 'text' is the field containing the model's response
    
    except Exception as e:
        print(f"Error querying LLaMA model: {e}")
        return "Sorry, I couldn't process your request."


# Add every player to database
# players_data = []
# with open('VCTHackathon/backend/datascrape/players.csv', newline='') as file:
#     reader = csv.reader(file)
#     next(reader)
#     for row in reader:
#         players_data.append(row)

# for player in players_data:
#     player_collection.insert_one({
#         "IGN" : player[0],
#         "Name" : player[1],
#         "Agent 1" : player[2],
#         "Agent 2" : player[3],
#         "Agent 3" : player[4]
#     })

if __name__ == '__main__':
    app.run(debug=True)
