from bs4 import BeautifulSoup
import requests

url = 'https://www.vlr.gg/event/2097/valorant-champions-2024/group-stage'
page = requests.get(url)
soup = BeautifulSoup(page.text, 'html')
teams = soup.find_all(attrs={'class':'wf-card event-team'})

# Get every team and team player
team_info = {}
player_links = []
for team in teams:
  team_name = team.find(attrs={'class' : 'event-team-name'})
  team_players_html = team.find_all(attrs={'class' : 'event-team-players-item'})

  
  team_players = []
  for player in team_players_html:
    team_players.append(player.get_text(strip=True))
    player_link = f"https://www.vlr.gg{player.get('href')}/?timespan=90d"
    player_links.append(player_link)

  team_info[team_name.get_text(strip=True)] = team_players

print(team_info)
print(player_links)

players_info = {}
for link in player_links:
  page = requests.get(link)
  soup = BeautifulSoup(page.text, 'html.parser')

  player_ign = soup.find(attrs={'class' : 'wf-title'}).get_text(strip=True)
  player_name = soup.find(attrs={'class' : 'player-real-name'}).get_text(strip=True)
  player_info = [player_name]

  stats_table = soup.find(attrs={'class' : 'wf-table'})
  stats_rows = stats_table.find_all('tr')

  count = 0
  for row in stats_rows:
    if count == 0:
      count += 1
      continue
    player_stats = []

    stats = row.find_all('td')
    
    stats[0] = stats[0].find(attrs={'alt' : True})['alt']
    player_stats.append(stats[0])
    
    skip = False # my bad gang
    for stat in stats:
      if not skip:
        skip = True
        continue
      player_stats.append(stat.get_text(strip=True))
    
    player_info.append(player_stats)

    if count == 3:
      break
    count += 1

  players_info[player_ign] = player_info

  # IGN : [Real Name, [Agent, Usage, Rounds played, "Rating," ACS, K/D, ADR, KAST, KPR, APR, FKPR, FDPR, K, D, A, FK, FD]]

print(players_info)
  