import json
from urllib.request import urlopen

api = "https://www.googleapis.com/books/v1/volumes?q=isbn:"
isbn = input("Enter 10 digit ISBN: ").strip()

resp = urlopen(api + isbn)
book_data = json.load(resp)

volume_info = book_data["items"][0]["volumeInfo"]
desc = volume_info['description'].split('—')

print(f"Description: {desc}")
