def lambda_handler(event, context):
    return {"Name": event["Name"].title(), "first_author_book": event["first_author_book"], "Is_An_Author": True} if event["Name"].isupper() else {"Name":event["Name"], "first_author_book": event["first_author_book"],"Is_An_Author": True}
