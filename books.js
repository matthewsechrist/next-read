function books() {
  var search_item = document.getElementById("search").value;

  if (search_item) {
    fetch("https://www.googleapis.com/books/v1/volumes?q=" + search_item, {
      method: "GET",
    })
      .then((response) => response.text())
      .then((body) => {
        const obj = JSON.parse(body);

          document.getElementById("content").innerHTML = obj.items.volumeInfo.title;
      })
      .catch(function (error) {
        console.log(error);
      });
  } else document.getElementById("content").innerHTML = "";
}

books();
