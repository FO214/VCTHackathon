from bs4 import BeautifulSoup
import requests

# Set up bs4 for matches
matches_url = 'https://www.vlr.gg/event/matches/2097/valorant-champions-2024/?series_id=all'
page = requests.get(matches_url)
soup = BeautifulSoup(page.text, 'html')
matches = soup.find_all(attrs={'class' : 'match-item'})

# Get every match and result
match_links = []
for match_game in matches:
  match_url = match_game.get('href')
  match_id = match_url.split('/')[1]
  match_url = f"https://www.vlr.gg{match_url}"
  match_links.append(match_url)

  teams = match_game.find_all(attrs={'class' : 'match-item-vs-team'})
  team1_name = teams[0].find('div', class_='text-of').get_text(strip=True)
  team2_name = teams[1].find('div', class_='text-of').get_text(strip=True)

  team1_score = teams[0].find('div', class_='match-item-vs-team-score').get_text(strip=True)
  team2_score = teams[1].find('div', class_='match-item-vs-team-score').get_text(strip=True)

  winner = match_game.find(attrs={'class' : 'match-item-vs-team mod-winner'})
  winner = winner.find('div', class_='text-of').get_text(strip=True)

  print(f"href: {match_url}")
  print(f"Match ID: {match_id}")
  print(f"Team A: {team1_name}")
  print(f"Team B: {team2_name}")
  print(f"Winner: {winner}")
  print(f"Score {team1_score}-{team2_score}")
  print("")

match_maps = {}
global_map_urls = []
for link in match_links:
  print(link)
  page = requests.get(link)
  soup = BeautifulSoup(page.text, 'html.parser')

  team1 = soup.find(attrs={'class' : "match-header-link wf-link-hover mod-1"})
  team2 = soup.find(attrs={'class' : "match-header-link wf-link-hover mod-2"})
  print(team1.get_text(strip=True).split("[")[0])
  print(team2.get_text(strip=True).split("[")[0])
  
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
    winner = team1.get_text(strip=True).split("[")[0]
  elif (score1 < score2):
    winner = team2.get_text(strip=True).split("[")[0]
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
  match_maps[match_id] = [team1.get_text(strip=True).split("[")[0], team2.get_text(strip=True).split("[")[0], score1, score2, winner, map_urls]
print(match_maps)
print(map_urls)