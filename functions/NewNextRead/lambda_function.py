import json

def new_next_read(event, context):
    author_dictionary = {}
    
    for author in event['author']:
        if (author['Name'].startswith(('-','–','.',' ','“','"','\''))) :
            author_dictionary[author['first_author_book']] = author['Name'][1:]
        else :
            author_dictionary[author['first_author_book']] = author['Name']    
    
    return {"authors" :  list({value.title() if value.isupper() else value for value in author_dictionary.values()}) }
