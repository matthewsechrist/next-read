from curses.ascii import isupper
import json
import re
from urllib.request import urlopen

def lambda_handler(event, context):

    book_api    = "https://www.googleapis.com/books/v1/volumes?q=isbn:"+event['book']    
    response        = urlopen(book_api)
    book_data   =json.load(response)

    if book_data['totalItems'] > 0:
        desc        = re.split('\W',book_data['items'][0]['volumeInfo']['description'])
        filtered    = filter(None,desc)
        desc2       = [x for x in filtered if x[0].isupper()]
    
        potential_authors = []
        potential_author  = ''
    
        for index,word in enumerate(desc2):
            potential_author = desc2[index-1]+"+"+desc2[index]
            
            if potential_author not in potential_authors:
                potential_authors.append(potential_author)
        
        return [potential_authors]
    else:
        return "No book found, sorry!"
