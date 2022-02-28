import json
import re
from urllib.request import urlopen

# This fuction takes a potential author's name from the event
# and returns None if they have no attributed books, and JSON of their
# name and number of books if they do
def next_read_find_authors(event, context):
    potential_author = event['potential_author']
    authors          = []         

    book_api  = "https://www.googleapis.com/books/v1/volumes?q=author:" + \
               '"'+potential_author+'"'
    resp      = urlopen(book_api)
    book_data = json.load(resp)

    # Verifies if the potential author has any books attributed to them
    if (book_data['totalItems'] > 0):

        # Iterate over all books returned
        for index, book in enumerate(book_data['items']):
            # Verify returned book has authors listed, if not return with 0 books
            if ("authors" not in book['volumeInfo']):
                return {"author": potential_author, "books": 0}

            # Assign authors JSON value to authors variable
            authors = book['volumeInfo']['authors']

            # Iterate over all authors and verify the potential author
            # passed into the function is an exact match to an author's name returned,
            # not just a partial substring match. The space is replaced with a plus sign for API call
            for author_index, author in enumerate(authors):
                if (potential_author.replace('+', ' ').lower() == author.lower()):
                    return {"author": author, "books": book_data['totalItems']}

    # If the potential author is not an author, return None
    else:
        return {"author": potential_author, "books": 0}
