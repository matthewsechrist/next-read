from curses.ascii import isalpha, isupper
import json
import re
from urllib.request import urlopen

# 0316531243
# 031653126X

book_api    = "https://www.googleapis.com/books/v1/volumes?q="+"031653126X"

resp        = urlopen(book_api)
book_data   =json.load(resp)

desc        = re.split('\W',book_data['items'][0]['volumeInfo']['description'])

filtered = filter(None,desc)

desc2 = [x for x in filtered if x[0].isupper()]

book_api=book_data["items"][0]["selfLink"]
resp2=urlopen(book_api)
book_data   = json.load(resp2)
desc3 = re.split('\W',book_data['volumeInfo']['description'])
filtered2 = filter(None,desc3)

desc4 = [x for x in filtered2 if x[0].isupper()]
print(desc2)
desc2.extend(desc4)

potential_authors = []
potential_author = ''
for index,word in enumerate(desc2):
    potential_author = desc2[index-1]+"+"+desc2[index]
        
    if potential_author not in potential_authors and desc2[index].isupper() and desc2[index-1].isupper():
        potential_authors.append(potential_author)
#print([potential_authors])

for item in potential_authors:
    author_api         = "https://www.googleapis.com/books/v1/volumes?q=inauthor:\""+item+"\""
    author_resp        = urlopen(author_api)
    author_data         = json.load(author_resp)
#    print(author_api)
    if author_data["totalItems"] > 0:
        # author_volume_info = author_data["volumeInfo"]
        # authors        = author_volume_info['authors']
        # if item.replace('+',' ') in authors:
        #    print(item.replace('+',' '))
        print(item)