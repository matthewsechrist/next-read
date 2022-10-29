import json, re, sys
from urllib.request import urlopen

# This function takes in a potential ISBN and parses though the book's description
# returning all instances of two adjacent words with each using title case,
# indicating the possibility of those two words being a potential author's name
def next_read(event, context):

    isbn = event['book']
    potential_authors = []

    book_api = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn
    resp = urlopen(book_api)
    book_data = json.load(resp)

    # Check is ISBN has data in Google Books
    if book_data['totalItems'] > 0:

        # Retrieves the book's description and splits it up in an  array by non-word characters
        # This functions also calls not_common_word to not allow common words for potential author names
        description = re.split(
            '\W', book_data['items'][0]['volumeInfo']['description'])

        # Iterates over the description array checking for two adjacent words with each using title case
        for index, word in enumerate(description):

            # Start only if the description has at least 2 words, and verify each word is not a common word
            if (index >= 1 and not_common_word(description[index-1]) and not_common_word(description[index])):

                # Check for 2 adjacent words to be title case, add to the potential_author array is true
                # A plus sign is added for the next API call
                if (description[index-1].istitle() and description[index].istitle()):
                    potential_authors.append(
                        {'potential_author': description[index-1]+"+"+description[index]})

        # Keep only distinct potential authors values
        potential_authors = [i for n, i in enumerate(
            potential_authors) if i not in potential_authors[n + 1:]]

        
        print(potential_authors)
        return {"potential_authors": potential_authors}
    else:
        return None

# This functions returns false for common words/some locations to help remove some potentially false author names
# from the results
def not_common_word(word):
    if (word in ['The', 'In', 'But', 'My', 'She', 'New', 'York', 'Times', 'City', 'When', 'Do', 'So', 'Be', 'And', 'United', 'States', 'Press', 'Associated', 'Miami', 'Herald']):
        return False
    return True

if __name__ == '__main__':
    next_read({'book':sys.argv[1]},"")    
