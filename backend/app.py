import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from bson.json_util import dumps
import os
# import csv

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
    result = collection.insert_one({"_id":0, **data})
    
    # Return confirmation
    return jsonify({'message': 'Data uploaded successfully', 'inserted_id': str(result.inserted_id)}), 200

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
