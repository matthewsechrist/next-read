var authors = (isbns = flattened_authors = filtered_authors = []),
  isbn = (searched_author = "");

const spinner = document.getElementById("spinner");

async function searchAuthor() {
  // Set searched_author variable to HTML search value
  searched_author = document.getElementById("search").value;

  // Reset all author varables and Null out with each author search
  (authors = []), (isbns = []);

  // Reset all HTML elements to a Null state
  document.getElementById("current_author_books").innerHTML =
    document.getElementById("mentioned_authors").innerHTML =
    document.getElementById("mentioned_authors_header").innerHTML =
    document.getElementById("current_author").innerHTML =
      "";
  document.getElementById("mentioned_authors").setAttribute("hidden", "");
  document.getElementById("mentioned_authors_header").setAttribute("hidden", "");

  document.getElementById("current_author").setAttribute("hidden", "");
  document.getElementById("current_author_books").setAttribute("hidden", "");


  // If a valid author is searched, display the first 10 books for the searched author
  if (searched_author) {
    let books = await fetch(
      'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
        searched_author +
        '"}&maxResults=10'
    ).then((response) => response.json());

    // Only create the associated authors and current author HTML elements if the searched author is found
    // to be a valid author
    if (books.totalItems > 0) {
      document
        .getElementById("current_author")
        .append(
          "Books by " + searched_author + " used for NextRead Processing"
        );
      document.createElement("mentioned_authors");

      // Each book result must have a 10 digit ISBN and a book description for NextRead to work correctly.
      // An array of ISBNs is sent for further processing to the getMentionedAuthors() function
      for (var book in books.items) {
        isbn = books.items[book].volumeInfo.industryIdentifiers;

        for (var isbn_counter = 0; isbn_counter < isbn.length; isbn_counter++) {
          if (
            isbn[isbn_counter].type === "ISBN_10" &&
            books.items[book].volumeInfo.description
          ) {
            isbns.push(isbn[isbn_counter].identifier);

            // Need to change from HTTP to HTTPS for the Google Books image link
            // if a valid thumbnail URL exists
            if (books.items[book].volumeInfo.imageLinks) {
              var src = books.items[
                book
              ].volumeInfo.imageLinks.thumbnail.replace("http://", "https://");
            }

            // Below creates a centered div containing each book for the search author as an image
            // that links to that book's WorldCat page
            current_author_img = document.createElement("img");
            current_author_a = document.createElement("a");
            current_author_div = document.createElement("div");

            current_author_div.style.display = "inline-block";
            current_author_img.id = isbn[isbn_counter].identifier;
            current_author_img.src = src;
            current_author_href =
              "https://www.worldcat.org/isbn/" + isbn[isbn_counter].identifier;
            current_author_a.href = current_author_href;
            current_author_a.target = "_blank";

            current_author_a.appendChild(current_author_img);
            current_author_div.setAttribute(
              "id",
              isbn[isbn_counter].identifier.toString()
            );

            document
              .getElementById("current_author_books")
              .appendChild(current_author_div);
            document
              .getElementById(isbn[isbn_counter].identifier.toString())
              .append(current_author_a);
          }
        }
      }
    } else {
      // If the searched author does not exist in Google Books, display an error
      current_author_div = document.createElement("div");
      current_author_div.append("No books found by " + searched_author);
      document
        .getElementById("mentioned_authors")
        .appendChild(current_author_div);
      document.getElementById("mentioned_authors").removeAttribute("hidden");
      document
        .getElementById("current_author_books")
        .setAttribute("hidden", "");
      document.getElementById("current_author").setAttribute("hidden", "");
    }
  }

  // Show a spinner while NextRead processing begins
  spinner.removeAttribute("hidden");

  // At this point, there is a valid list of ISBN(s), need to sanitize
  // the ISBNs array of any "falsy" ISBNs including: [], None, Null, and false
  filtered_isbns = isbns.filter(Boolean);

  // Pseudo-concurrently retrieve all mentioned authors in the book description.
  // Using Promise.allSettled() as opposed to Promise.all() since I want to show as many mentioned
  // authors as possible, even if I can't return all of them
  await Promise.allSettled(
    filtered_isbns.map((isbn) => getMentionedAuthors(isbn))
  );

  // This functions iterates over all mentioned authors and adds the HTML elements
  addAuthors();

  // After all mentioned authors HTML elements are visible, this code scrolls the window focus to the top
  // of the mentioned authors div, and also hides the spinner
  document
    .getElementById("mentioned_authors")
    .scrollIntoView({ behavior: "smooth", block: "center" });
  spinner.setAttribute("hidden", "");
}

// This function passes in an ISBN, calls my API and returns all menionted authors which are
// assigned to the authors array
async function getMentionedAuthors(isbn) {
  const response = await fetch("https://api.matthewsechrist.cloud/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"book":"' + isbn + '"}',
  }).then((response) => response.json());

  authors.push(response);
}

// Call the searchAuthor() function from the Enter key, also the search button
var input = document.getElementById("search");
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();

    searchAuthor();
  }
});

// This function cleans up the authors list and adds the mentioned authors HTML elements
function addAuthors() {
  var flattened_authors = [],
    filtered_authors = [];

  // Flatten multiple author array results into one flat authors array
  flattened_authors = authors.flat();

  // Remove "falsy" authors from the flattened_authors array
  filtered_authors = flattened_authors.filter(Boolean);

  // Remove authors with 0 attributed books
  for (var i = filtered_authors.length - 1; i >= 0; --i) {
    if (filtered_authors[i].books === 0) {
      filtered_authors.splice(i, 1);
    }
  }

  // Create a map of authors which does not allow duplicates of authors,
  // and this maps the JSON data returned in the format "author:books"
  var map_of_authors = {};

  map_of_authors = Object.assign(
    {},
    ...filtered_authors.map((x) => ({ [x.author]: x.books }))
  );

  // Create and sort the ordered_authors array in descending order
  // NOTE: Because I am using Promise.Allsettled(), the mentioned_authors divs
  // are not added to HTML in this order, this will be added in the future
  var ordered_authors = Object.keys(map_of_authors).map(function (key) {
    return [key, map_of_authors[key]];
  });

  ordered_authors.sort(function (first, second) {
    return second[1] - first[1];
  });

  // Verify that an author was searched, and there are mentioned author to show
  // This codes makes visible the mentioned authors divs, current author divs,
  // and makes the call to the getFirst10Books() to add the images for books
  // for each mentioned author
  if (searched_author && ordered_authors.length > 0) {
    document.getElementById("mentioned_authors").removeAttribute("hidden");
    document
      .getElementById("mentioned_authors_header")
      .removeAttribute("hidden");

    document.getElementById("current_author").removeAttribute("hidden");
    document.getElementById("current_author_books").removeAttribute("hidden");

    document
      .getElementById("mentioned_authors_header")
      .append("Click each mentioned author below to see a few of their books.");

    linebreak = document.createElement("br");
    document.getElementById("mentioned_authors_header").appendChild(linebreak);

    document
      .getElementById("mentioned_authors_header")
      .append("Then click a book to see which local library owns it!");

    // Iterate over each mentioned, remove the item if the name is the same as
    // the current author, or call getFirst10Books() passing in the
    // the author from the authors array
    for (author_index in ordered_authors) {
      //Remove the currently searched author
      if (
        ordered_authors[author_index][0].toLowerCase() ==
        searched_author.toLowerCase()
      ) {
        ordered_authors.splice(author_index, 1);
      } else {
        getFirst10Books(ordered_authors[author_index][0]);
      }
    }
  }
}

// This functions adds HTML elements for the first 10 books return for each mentioned author
async function getFirst10Books(mentioned_author) {
  let mentioned_author_books = await fetch(
    'https://www.googleapis.com/books/v1/volumes?q=inauthor:${"' +
      mentioned_author +
      '"}&maxResults=10'
  ).then((response) => response.json());

  // Create a variable that holds the name of the mentioned author with no spaces.
  // This will be the base of the var names for the HTML elements, attaching an _ and one
  // of the following HTML element types: button, a, img, p, and div
  var mentioned_author_name = mentioned_author.replace(/\s+/g, "");

  // Create mentioned author HTML elements
  mentioned_author_div = document.createElement("div");
  mentioned_author_p = document.createElement("p");
  mentioned_author_button = document.createElement("button");

  // Create the accordion and panel HTML element for the mentioned author
  mentioned_author_button.className = "accordion";
  mentioned_author_div.className = "panel";

  // Set the button text to the mentioned author name
  mentioned_author_button.textContent = mentioned_author;

  // Set the id for each HTML element
  mentioned_author_button.setAttribute("id", mentioned_author_name + "_button");
  mentioned_author_p.setAttribute("id", mentioned_author_name + "_p");
  mentioned_author_div.setAttribute("id", mentioned_author_name);

  // Adds the author HTML elements to the associate_authors div
  document
    .getElementById("mentioned_authors")
    .appendChild(mentioned_author_button);
  document
    .getElementById("mentioned_authors")
    .appendChild(mentioned_author_div);
  document
    .getElementById(mentioned_author_name)
    .appendChild(mentioned_author_p);

  // This code adds the accordion opening effect to each mentioned author button
  mentioned_author_button.addEventListener("click", function () {
    this.classList.toggle("active");

    var panel = this.nextElementSibling;

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });

  // Adds the mentioned author's books to the current_author div that have
  // an associated ISBN_10 value.
  for (var book in mentioned_author_books.items) {
    if (mentioned_author_books.items[book].volumeInfo.industryIdentifiers) {
      isbn = mentioned_author_books.items[book].volumeInfo.industryIdentifiers;

      for (isbn_index in isbn) {
        if (isbn[isbn_index].type === "ISBN_10") {
          if (mentioned_author_books.items[book].volumeInfo.imageLinks) {
            var src = mentioned_author_books.items[
              book
            ].volumeInfo.imageLinks.thumbnail.replace("http://", "https://");

            // This block of code creates an the image if the thumbnail for 
            // each book of the mentioned author if it exists, otherwise show "No image found."
            // For each image, it adds a link the WorldCat page for its ISBN. 
            img = document.createElement("img");
            a = document.createElement("a");
            img.id = isbn[isbn_index].identifier;
            img.src = src;
            href = "https://www.worldcat.org/isbn/" + isbn[isbn_index].identifier;
            a.href = href;
            a.target = "_blank";

            a.appendChild(img);

            // Add each book's image and title in a p HTML element for in the HTML div
            // with the clas name of Panel 
            document.getElementById(mentioned_author_name + "_p").append(a);
          } else {
            // If the book has a title but no image thumbnail, show the error
            // "No image found"
            if (mentioned_author_books.items[book].volumeInfo.title) {
              document
                .getElementById(mentioned_author_name + "_p")
                .append(
                  mentioned_author_books.items[book].volumeInfo.title +
                    " - No image found  "
                );
            }
          }
        }
      }
    }
  }
}

searchAuthor();
