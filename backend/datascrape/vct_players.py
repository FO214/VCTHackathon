from bs4 import BeautifulSoup
import requests

url = 'https://www.vlr.gg/event/2097/valorant-champions-2024/group-stage'
page = requests.get(url)
soup = BeautifulSoup(page.text, 'html')
teams = soup.find_all(attrs={'class':'wf-card event-team'})

for team in teams:
  team_name = team.find(attrs={'class' : 'event-team-name'})
  team_players_html = team.find_all(attrs={'class' : 'event-team-players-item'})
  print(team_name.text.strip())
  
  team_players = []
  for i in team_players_html:
    team_players.append(i.text.strip())
  print(team_players)
