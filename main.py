import json
import re
from urllib.request import urlopen

book_api    = "https://www.googleapis.com/books/v1/volumes?q=isbn:1250297621"
resp        = urlopen(book_api)
book_data=json.load(resp)

# volume_info = book_data['volumeInfo']
desc        = re.split('”|-|\s|<b>|</b>|<i>|</i>|<br>|</br>',book_data['items'][0]['volumeInfo']['description'])
print(desc)
book_api=book_data["items"][0]["selfLink"]
resp=urlopen(book_api)
book_data   = json.load(resp)
# print(book_data)
desc2 = re.split('”|-|\s|<b>|</b>|<i>|</i>|<br>|</br>',book_data['volumeInfo']['description'])
desc.extend(desc2)
print(desc)

# print(book_data)
#if book_data["totalItems"] > 0:
# volume_info = book_data["volumeInfo"]
# desc        = volume_info['description'].split(' ')
potential_authors = []
# print(desc)
for index,word in enumerate(desc):
    # word = re.sub(r"<br>","",word)
    # word = re.sub(r"</br>","",word)     
    word = re.sub(r"”|<b>|</b>|<i>|</i>|<br>|</br>|[^a-zA-Z]|","",word)
    # print(word)

    # The book description must have at least two words 
    if index > 0:
        # lastword = re.sub(r"<br>","",desc[index-1])
        # lastword = re.sub(r"</br>","",desc[index-1])
        lastword = re.sub(r"”|<b>|</b>|<i>|</i>|<br>|</br>|[^a-zA-Z]","",desc[index-1])
        # print(lastword)
        # The current word and the previous word must be title case to be considered as a potential author name
        if word.istitle() and lastword.istitle():
            potential_author =  lastword+"+"+word
            # print(potential_author)
            
            # Do not want to add duplicates to the potential_authors list
            if potential_author not in potential_authors:
                potential_authors.append(potential_author)

# print(potential_authors)
for item in potential_authors:
    author_api         = "https://www.googleapis.com/books/v1/volumes?q=inauthor:\""+item+"\""
    author_resp        = urlopen(author_api)
    author_data         = json.load(author_resp)
    
    if author_data["totalItems"] > 0:
        author_volume_info = author_data["items"][0]["volumeInfo"]
        authors        = author_volume_info['authors']
        if item.replace('+',' ') in authors:
            print(item.replace('+',' '))
