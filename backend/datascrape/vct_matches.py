from bs4 import BeautifulSoup
import csv
import os
import requests

def change_name(name):
  if (name == "LEVIATÁN"):
    return "LEVIATAN"
  if (name == "KRÜ Esports"):
    return "KRU Esports"
  return name

# Set up bs4 for matches
matches_url = 'https://www.vlr.gg/event/matches/2097/valorant-champions-2024/?series_id=all'
page = requests.get(matches_url)
soup = BeautifulSoup(page.text, 'html.parser')
matches = soup.find_all(attrs={'class' : 'match-item'})

# Get every match and result
match_links = []
match_results = []
for match_game in matches:
  match_url = match_game.get('href')
  match_id = match_url.split('/')[1]
  match_url = f"https://www.vlr.gg{match_url}"
  match_links.append(match_url)

  teams = match_game.find_all(attrs={'class' : 'match-item-vs-team'})
  team1_name = teams[0].find('div', class_='text-of').get_text(strip=True)
  team2_name = teams[1].find('div', class_='text-of').get_text(strip=True)
  
  team1_name = change_name(team1_name)
  team2_name = change_name(team2_name)

  team1_score = teams[0].find('div', class_='match-item-vs-team-score').get_text(strip=True)
  team2_score = teams[1].find('div', class_='match-item-vs-team-score').get_text(strip=True)

  winner = match_game.find(attrs={'class' : 'match-item-vs-team mod-winner'})
  winner = winner.find('div', class_='text-of').get_text(strip=True)

  winner = change_name(winner)
  
  print(f"href: {match_url}")
  print(f"Match ID: {match_id}")
  print(f"Team A: {team1_name}")
  print(f"Team B: {team2_name}")
  print(f"Winner: {winner}")
  print(f"Score {team1_score}-{team2_score}")
  print("")
  match_results.append([match_id, team1_name, team2_name, winner, team1_score, team2_score])
print(match_results)


match_maps = {}
global_map_urls = []
for link in match_links:
  print(link)
  page = requests.get(link)
  soup = BeautifulSoup(page.text, 'html.parser')

  team1 = soup.find(attrs={'class' : "match-header-link wf-link-hover mod-1"}).get_text(strip=True).split("[")[0]
  team2 = soup.find(attrs={'class' : "match-header-link wf-link-hover mod-2"}).get_text(strip=True).split("[")[0]

  team1 = change_name(team1)
  team2 = change_name(team2)

  score = soup.find(attrs={'class' : 'match-header-vs-score'})

  index = 0
  while (not score.get_text(strip=True)[index].isnumeric()):
    index += 1
  score = score.get_text(strip=True)[index:index+3].split(":")
  score1 = score[0]
  score2 = score[1]
  print(score1)
  print(score2)

  winner = ""
  if (score1 > score2):
    winner = team1
  elif (score1 < score2):
    winner = team2
  print(winner)
  
  map_urls = []
  href_link = link.replace("https://www.vlr.gg","")

  map = 1
  for map in range(1,6):
    map_href = f"{href_link}/?map={map}"

    href = soup.find(attrs={'data-href' : map_href})
    if (href is None):
      break
    map_id = href.get('data-game-id')
    print(map_id)

    map_url = f"{link}/?game={map_id}&tab=overview"
    map_urls.append(map_id)
    global_map_urls.append(map_url)
  
  match_id = link.replace("https://www.vlr.gg/","").split("/")[0]
  match_maps[match_id] = [team1, team2, score1, score2, winner, map_urls]
print(match_maps)
print(map_urls)

all_map_stats = {}
for url in global_map_urls:
  page = requests.get(url)
  soup = BeautifulSoup(page.text, 'html.parser')

  maps = soup.find_all(attrs={'class' : 'vm-stats-game'})

  for map in maps:
    map_name = map.find(attrs={'class' : 'map'})
    if map_name is None:
      continue

    map_name = map.find(attrs={'class' : 'map'}).get_text(strip=True)
    if "PICK" in map_name:
      map_name = map_name.split("PICK")[0]
    else:
      count = 0
      while not map_name[count].isnumeric():
        count += 1
      map_name = map_name[:count]
    map_id = map.get('data-game-id')
    if map_id in all_map_stats.keys():
      continue

    teams = map.find_all(attrs={'class' : 'team'})
    
    team1 = teams[0].find(attrs={'class' : 'team-name'}).get_text(strip=True)
    team1_ct = teams[0].find(attrs={'class' : 'mod-ct'}).get_text(strip=True)
    team1_t = teams[0].find(attrs={'class' : 'mod-t'}).get_text(strip=True)

    team1 = change_name(team1)
    # print(team1.get_text(strip=True))
    # print(f"{team1_ct}/{team1_t}")

    team2 = teams[1].find(attrs={'class' : 'team-name'}).get_text(strip=True)
    team2_ct = teams[1].find(attrs={'class' : 'mod-ct'}).get_text(strip=True)
    team2_t = teams[1].find(attrs={'class' : 'mod-t'}).get_text(strip=True)

    team2 = change_name(team2)
    # print(team2.get_text(strip=True))
    # print(f"{team2_ct}/{team2_t}")
    
    winner = ""
    if (int(team1_ct) + int(team1_t) > int(team2_ct) + int(team2_t)):
      winner = team1
    else:
      winner = team2
    # print(winner)

    players_table = map.find_all(attrs={"class" : "wf-table-inset mod-overview"})
    team1_player_table = players_table[0]
    team2_player_table = players_table[1]
    
    team1_player_rows = team1_player_table.find_all('tr')
    team1_players_stats = []
    skip = False
    for row in team1_player_rows:
      player_stats = []
      if not skip:
        skip = True
        continue
      # Player name
      player_stats.append(row.find(attrs={'class' : 'text-of'}).get_text(strip=True))
      
      # Player agent
      player_stats.append(row.find(attrs={'class' : 'mod-agent'}).find(attrs={'title' : True})['title'])
      
      # Stats
      # Rating, ACS, Kills, Deaths, Assists, K-D, KAST, ADR, HS%, FK, FD, FK-FD
      stats = row.find_all(attrs={'class' : 'mod-stat'})
      for stat in stats:
        player_stats.append(stat.find(attrs={'class' : 'mod-both'}).get_text(strip=True))
      team1_players_stats.append(player_stats)
    # print(team1_players_stats)

    team2_player_rows = team2_player_table.find_all('tr')
    team2_players_stats = []
    skip = False
    for row in team2_player_rows:
      player_stats = []
      if not skip:
        skip = True
        continue
      # Player name
      player_stats.append(row.find(attrs={'class' : 'text-of'}).get_text(strip=True))
      
      # Player agent
      player_stats.append(row.find(attrs={'class' : 'mod-agent'}).find(attrs={'title' : True})['title'])
      
      # Stats
      # Rating, ACS, Kills, Deaths, Assists, K-D, KAST, ADR, HS%, FK, FD, FK-FD
      stats = row.find_all(attrs={'class' : 'mod-stat'})
      for stat in stats:
        player_stats.append(stat.find(attrs={'class' : 'mod-both'}).get_text(strip=True))
      team2_players_stats.append(player_stats)
    # print(team2_players_stats)

    map_info = []
    # Add everything into a list
    map_info.append(map_name)
    map_info.append(team1)
    map_info.append(team2)
    map_info.append(team1_ct)
    map_info.append(team1_t)
    map_info.append(team2_ct)
    map_info.append(team2_t)
    map_info.append(winner)
    map_info.append(team1_players_stats)
    map_info.append(team2_players_stats)

    print(map_id)
    print(map_info)
    print("---------------")
    # Then add it to a dictionary with the match id associated
    all_map_stats[map_id] = map_info
print(all_map_stats)

# with open("VCTHackathon/backend/datascrape/matches.csv", 'w', newline='') as file:
#   writer = csv.writer(file)
#   writer.writerow(["Match ID", "Team 1", "Team 2", "Score 1", "Score 2", "Winner", "Map IDs"])
#   for k,v in match_maps.items():
#     writer.writerow([k] + v)

with open("VCTHackathon/backend/datascrape/maps.csv", 'w', newline='') as file:
  writer = csv.writer(file)
  writer.writerow(["Map ID", "Map Name", "Team 1", "Team 2", "Team 1 CT Score", "Team 1 T Score", "Team 2 CT Score", "Team 2 T Score", "Winner", "Team 1 Players", "Team 2 Players"])
  for k,v in all_map_stats.items():
    writer.writerow([k] + v)
