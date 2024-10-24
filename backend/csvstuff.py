import csv

def maps_associated_with_team(team_name):
    maps = []
    with open('backend/datascrape/maps.csv', newline='') as file:
        reader = csv.reader(file)
        next(reader)
        for row in reader:
            if row[2] == team_name or row[3] == team_name:
                maps.append(row)
    
    return maps

if __name__ == "__main__":
    maps_associated_with_team("Sentinels")