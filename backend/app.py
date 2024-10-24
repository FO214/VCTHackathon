import json
from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from bson.json_util import dumps
import os
import csv
import boto3
from csvstuff import maps_associated_with_team

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

load_dotenv()
uri = os.getenv("uri")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['vcthackathon']
collection = db['user-team']
player_collection = db['players']
teams_collection = db['teams']

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
        
        # Convert the cursor to a list of dictionaries
        players = list(result)
        
        if players:
            # Create a custom JSONEncoder to handle ObjectId serialization
            class MongoJSONEncoder(json.JSONEncoder):
                def default(self, obj):
                    if isinstance(obj, ObjectId):
                        return str(obj)
                    return json.JSONEncoder.default(self, obj)
            
            # Use the custom encoder to serialize the players
            serialized_players = json.dumps(players, cls=MongoJSONEncoder)
            
            return jsonify(json.loads(serialized_players))
        else:
            return jsonify({'message': 'No data found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-teams', methods=['GET'])
def get_teams():
    try:
        result = teams_collection.find()
        
        # Convert the cursor to a list of dictionaries
        teams = list(result)
        
        if teams:
            # Create a custom JSONEncoder to handle ObjectId serialization
            class MongoJSONEncoder(json.JSONEncoder):
                def default(self, obj):
                    if isinstance(obj, ObjectId):
                        return str(obj)
                    return json.JSONEncoder.default(self, obj)
            
            # Use the custom encoder to serialize the teams
            serialized_teams = json.dumps(teams, cls=MongoJSONEncoder)
            
            return jsonify(json.loads(serialized_teams))
        else:
            return jsonify({'message': 'No data found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/eval-winner', methods=['POST'])
def query_llama():
    print("Received request")

    # Parse the incoming JSON data
    data = request.data.decode('utf-8')
    print(data)

    team1 = data.split(",")[0].strip()
    team2 = data.split(",")[1].strip()

    team1_info = maps_associated_with_team(team1)
    team2_info = maps_associated_with_team(team2)

    if (team1 == "Your Team"):
        team1_info = collection.find()
    if (team2 == "Your Team"):
        team2_info = collection.find()

    prompt = f"""
    Who will win between {team1} and {team2}?
    Here is information about team 1:
    {team1_info}

    Here is information about team 2:
    {team2_info}
    Although there is very little information, please provide me with a response only with the name of one team prediction for the winner.
    """
    
    input_payload = {
        "message": prompt
    }

    bedrock_runtime = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1',
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
        return jsonify({'winner': parsed_response['text']})  # Ensure JSON response
    
    except Exception as e:
        print(f"Error querying LLaMA model: {e}")
        return "Sorry, I couldn't process your request."

context = []
with open("backend/datascrape/players.csv", "r") as file:
    reader = csv.reader(file)
    i = 0
    for row in reader:
        if (i == 40):
            break
        context.append(row)
        i += 1

@app.route('/chat', methods=['POST'])
def WEBRINGTHEBOOM():
    print("Received request")

    # Parse the incoming JSON data
    data = request.data.decode('utf-8')

    prompt = f"""
    Given this data about the players: {context}

    answer this question to the best of your knowledge, but keep it short and concise for the user: {data}
    """
    
    input_payload = {
        "message": prompt
    }

    bedrock_runtime = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1',
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
        print(parsed_response['text'])
        return jsonify({'response': parsed_response['text']})  # Ensure JSON response
    
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

# Add every team to database
# teams_data = []
# with open('backend/datascrape/teams.csv', newline='') as file:
#     reader = csv.reader(file)
#     next(reader)
#     for row in reader:
#         teams_data.append(row)

# for team in teams_data:
#     teams_collection.insert_one({
#         "Team" : team[0],
#         "Players" : team[1]
#     })


if __name__ == '__main__':
    app.run(debug=True)
