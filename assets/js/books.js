var authors =
    (isbns =
    flattened_authors =
    filtered_authors =
    ordered_authors =
      []),
  dictionary_authors = {},
  isbn = (searched_author = "");

const spinner = document.getElementById("spinner");

//const spinner = document.getElementById("associated_authors");

async function searchAuthor() {
  // Set searched_author variable to searched valued
  searched_author = document.getElementById("search").value;

  (authors = []), (isbns = []);

  // Null out HTML elements for book content and authors
  document.getElementById("content").innerHTML =
    document.getElementById("associated_authors").innerHTML =
    document.getElementById("current_author").innerHTML =
      "";

  // If a valid author is searched, pull the first 10 books for the searched author
  if (searched_author) {
    document
      .getElementById("current_author")
      .append("BOOKS BY " + searched_author.toUpperCase());

    document.createElement("associated_authors");

    let books = await fetch(
      'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
        searched_author +
        '"}&maxResults=10'
    ).then((response) => response.json());

    this.books = books;

    // Each book results must have a 10 digit ISBN and a book description. An array of ISBNs is created
    // for further processing in the getMentionedAuthors() function
    for (var book in books.items) {
      isbn = books.items[book].volumeInfo.industryIdentifiers;

      for (var j = 0; j < isbn.length; j++) {
        if (
          isbn[j].type === "ISBN_10" &&
          books.items[book].volumeInfo.description
        ) {
          isbns.push(isbn[j].identifier);

          // Need to change from HTTP to HTTPS for the Google Books image link
          if (books.items[book].volumeInfo.imageLinks) {
            var src = books.items[book].volumeInfo.imageLinks.thumbnail.replace(
              "http://",
              "https://"
            );
          }

          // Set HTML element values
          img = document.createElement("img");
          div = document.createElement("div");
          div.style.display = "inline-block";
          img.id = isbn[j].identifier;
          img.src = src;

          div.setAttribute("id", isbn[j].identifier.toString());

          // Add HTML elements
          document.getElementById("content").appendChild(div);
          document.getElementById(isbn[j].identifier.toString()).append(img);

          if (books.items[book].volumeInfo.title) {
            document
              .getElementById(isbn[j].identifier.toString())
              .append(books.items[book].volumeInfo.title);

            document.getElementById(isbn[j].identifier.toString());
          }
        }
      }
    }
  }

  // Remove any "falsy" ISBNs
  filtered_isbns = isbns.filter(Boolean);

  spinner.removeAttribute("hidden");

  // Pseudo-concurrently retrieve all potential authors mentioned in the book description
  await Promise.allSettled(
    filtered_isbns.map((stuff) => getMentionedAuthors(stuff))
  );

  addAuthors();

  spinner.setAttribute("hidden", "");
}

async function getMentionedAuthors(isbn) {
  const response = await fetch("https://api.matthewsechrist.cloud/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"book":"' + isbn + '"}',
  }).then((response) => response.json());

  //spinner.setAttribute('hidden', '');

  this.response = response;

  authors.push(response);
  if (books.items[book].volumeInfo.title) {
    document
      .getElementById(isbn.toString())
      .append(books.items[book].volumeInfo.title);
  }
}

// Call the searchAuthor() function from the Enter key, also the "Click Me!" button
var input = document.getElementById("search");
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();

    searchAuthor();
  }
});

// This function adds the authors to HTML in order of number of books associated by author in descending order,
// mimicking a sort by relevancy
function addAuthors() {
  div = document.createElement("div");

  // Step 1 of 3 - Flatten multiple author arrays into one authors array
  flattened_authors = authors.flat();

  // Step 2 of 3 - Remove "falsy" authors from the flattened_authors array
  filtered_authors = flattened_authors.filter(Boolean);

  for (var i = filtered_authors.length - 1; i >= 0; --i) {
    if(filtered_authors[i].books === 0) {
      filtered_authors.splice(i, 1);
    }
}

  // Step 3 of 5 - Need to remove currently searched author name from the array

  // Step 4 of 5 - Create a dictionary of authors which does not allow duplicates of authors,
  // and this maps the JSON returned in the format author:books
  dictionary_authors = Object.assign(
    {},
    ...filtered_authors.map((x) => ({ [x.author]: x.books }))
  );

  // Step 5 of 5 - Create and sort the ordered_authors array in descending order, mimicking relevancy of authors found
  var ordered_authors = Object.keys(dictionary_authors).map(function (key) {
    return [key, dictionary_authors[key]];
  });
  ordered_authors.sort(function (first, second) {
    return second[1] - first[1];
  });

  // Only add the authors HTML div only after an author has been searched
  if (searched_author) {
    document.getElementById("associated_authors").append("MENTIONED AUTHORS:");

    for (author_index in ordered_authors) {
      // Remove the currently searched author, no need to see duplicates
      if (
        ordered_authors[author_index][0].toLowerCase() ==
        searched_author.toLowerCase()
      ) {
        ordered_authors.splice(author_index, 1);
      }

      associated_author_div = document.createElement("div");

      associated_author_div.append(
        //call getFirst10Books per author

        //getFirst10Books(ordered_authors[author_index][0]);
        ordered_authors[author_index][0] +
          " has " +
          ordered_authors[author_index][1].toString() +
          " associated books."
      );

      document
        .getElementById("associated_authors")
        .appendChild(associated_author_div);
    }
  }
}

searchAuthor();

async function getFirst10Books(fetched_author) {
  //promise all setlled for first 10 books - title and image
  //append to that specific authors div

  let authors_books = await fetch(
    'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
      fetched_author +
      '"}&maxResults=10'
  ).then((response) => response.json());

  this.authors_books = authors_books;

  author_div = document.createElement("div");
  fetched_author_div = document.createElement("div");
  author_div.style.display = "block";
  fetched_author_div.style.display = "block";

  author_div.setAttribute("id", fetched_author.replace(/\s+/g, ""));

  fetched_author_div.append(fetched_author);

  document.getElementById("associated_authors").appendChild(author_div);
  //document.getElementById(author_div).appendChild(fetched_author_div);

  for (var book in authors_books.items) {
    isbn = authors_books.items[book].volumeInfo.industryIdentifiers;

    for (var j = 0; j < isbn.length; j++) {
      if (
        isbn[j].type === "ISBN_10" &&
        authors_books.items[book].volumeInfo.description
      ) {
        isbns.push(isbn[j].identifier);

        // Need to change from HTTP to HTTPS for the Google Books image link
        if (authors_books.items[book].volumeInfo.imageLinks) {
          var src = authors_books.items[
            book
          ].volumeInfo.imageLinks.thumbnail.replace("http://", "https://");
        }

        // Set HTML element values
        img = document.createElement("img");
        div = document.createElement("div");
        title_div = document.createElement("div");
        title_div.style.display = "block";
        div.style.display = "inline-block";
        img.id = isbn[j].identifier;
        img.src = src;

        div.setAttribute("id", isbn[j].identifier.toString());

        title_div.append(authors_books.items[book].volumeInfo.title);

        // Add HTML elements
        document
          .getElementById(fetched_author.replace(/\s+/g, ""))
          .appendChild(div);
        document.getElementById(isbn[j].identifier.toString()).append(img);

        if (authors_books.items[book].volumeInfo.title) {
          document
            .getElementById(isbn[j].identifier.toString())
            .appendChild(title_div);
        }
      }
    }
  }
}
