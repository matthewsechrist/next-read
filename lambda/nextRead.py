import json
import re
from urllib.request import urlopen

def lambda_handler(event, context):

    book_api    = "https://www.googleapis.com/books/v1/volumes?q=isbn:"+event['book']
    resp        = urlopen(book_api)
    book_data   =json.load(resp)

    # Check is ISBN has data in Google Books
    if book_data['totalItems'] > 0:
        
        # Retrieves the book's description and splits it up in array by non-word characters
        # This functions also calls is_common_word to not allow common words for potential author names
        desc              = re.split('\W',book_data['items'][0]['volumeInfo']['description'])
        potential_authors = []

        # Iterates over the desc array checking for two adjacent words with each using title case
        for index,word in enumerate(desc):
            if (index >= 1 and is_common_word(desc[index-1]) and is_common_word(desc[index])):
                if (desc[index-1].istitle() and desc[index].istitle()):
                    potential_author = desc[index-1]+"+"+desc[index]
                    potential_authors.append({'value':potential_author})
        
        # Keep only distinct potential authors values              
        potential_authors = [i for n, i in enumerate(potential_authors) if i not in potential_authors[n + 1:]]
        
        return {"potential_authors":potential_authors}       
    else:
        return None

# This functions returns false for common words/some locations to help remove some potentially false author names
# from the results
def is_common_word(word):
    if (word in ['The','In','But','My','She','New','York','Times','City','When','Do','So', 'Be', 'And']):
        return False
    return True    
