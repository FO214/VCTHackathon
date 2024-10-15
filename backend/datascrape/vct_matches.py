from bs4 import BeautifulSoup
import requests

url = 'https://www.vlr.gg/event/matches/2097/valorant-champions-2024/?series_id=all'
page = requests.get(url)
soup = BeautifulSoup(page.text, 'html')
matches = soup.find_all(attrs={'class' : 'match-item'})

for i in matches:
  match_url = i.get('href')
  match_id = match_url.split('/')[1]
  match_url = f"https://www.vlr.gg{match_url}"

  teams = i.find_all(attrs={'class' : 'match-item-vs-team'})
  team1_name = teams[0].find('div', class_='text-of').get_text(strip=True)
  team2_name = teams[1].find('div', class_='text-of').get_text(strip=True)

  team1_score = teams[0].find('div', class_='match-item-vs-team-score').get_text(strip=True)
  team2_score = teams[1].find('div', class_='match-item-vs-team-score').get_text(strip=True)

  winner = i.find(attrs={'class' : 'match-item-vs-team mod-winner'})
  winner = winner.find('div', class_='text-of').get_text(strip=True)

  print(f"href: {match_url}")
  print(f"Match ID: {match_id}")
  print(f"Team A: {team1_name}")
  print(f"Team B: {team2_name}")
  print(f"Winner: {winner}")
  print(f"Score {team1_score}-{team2_score}")
  print("")