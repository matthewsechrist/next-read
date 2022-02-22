from curses.ascii import isupper
import json
import re
from urllib.request import urlopen

def next_read_find_authors(event, context):
    #return event['Payload']
    #print(event['value']+"gg")
    potential_author = event['value']
    
    book_api    = "https://www.googleapis.com/books/v1/volumes?q=author:"+'"'+potential_author+'"'
    resp        = urlopen(book_api)
    
    book_data   =json.load(resp)
    
    authors = []
    mentioned_authors = []
    
    
    if (book_data['totalItems'] > 0):
        print(book_data['totalItems'])

        
        for index,book in enumerate(book_data['items']):
            if ("authors" not in book_data['items'][index]['volumeInfo']):
                return None
            authors = book_data['items'][index]['volumeInfo']['authors']
            for author_index,author in enumerate(authors):
                if potential_author.replace('+',' ').lower() == author.lower():
                    print(potential_author.replace('+',' '))
                    print(author)
                    print(potential_author.replace('+',' ').lower() == author.lower())
                    mentioned_authors.append({"author":potential_author})
            #return {"author":potential_author,"books":book_data['totalItems']}     
            return [potential_author,book_data['totalItems']]