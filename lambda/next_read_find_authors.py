from curses.ascii import isupper
import json
import re
from urllib.request import urlopen

def next_read_find_authors(event, context):
    potential_author = event['value']
    
    book_api    = "https://www.googleapis.com/books/v1/volumes?q=author:"+'"'+potential_author+'"'
    resp        = urlopen(book_api)
    
    book_data   =json.load(resp)
    
    authors = []
    
    # Verify author has any books attributed to them
    if (book_data['totalItems'] > 0):

        # Iterate over all books returned
        for index,book in enumerate(book_data['items']):
            # Verify returned book has authors listed
            if ("authors" not in book_data['items'][index]['volumeInfo']):
                return None
            
            # Assign authors JSON to authors variable    
            authors = book_data['items'][index]['volumeInfo']['authors']
            
            # Iterate over all authors
            for author_index,author in enumerate(authors):
                # Return the potential author if 
                if (potential_author.replace('+',' ').lower() == author.lower()):
                    return {"author":author,"books":book_data['totalItems']}     