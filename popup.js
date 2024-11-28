// Global declare your list of items
let items = [];

document.addEventListener("DOMContentLoaded", function () {
  const ul = document.getElementById("playlist");
  const searchBox = document.getElementById("search");
  const sortButton = document.getElementById("buttonAlpha");
  let buttonON = false;

  // Function to create list items dynamically
  function createListItems(filter = "") {
    ul.innerHTML = ""; // Clear the current list before re-rendering

    const filteredItems = items.filter(
      (item) => item.toLowerCase().includes(filter.toLowerCase()) // Case-insensitive search
    );

    filteredItems.forEach((itemText) => {
      const li = document.createElement("li");
      li.className = "list-item";
      const a = document.createElement("a");
      const [title, url] = itemText.split(" - "); // Extract the title and URL from the item text
      a.textContent = title; // Use the title as the text content
      a.href = url; // Use the URL as the href attribute
      a.target = "_blank"; // Open the link in a new tab
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  // Initially populate the list without any filter
  createListItems();

  // Add an event listener to Sort A-Z button
  sortButton.addEventListener("click", function () {
    if (!buttonON) {
      this.classList.toggle("toggled");
      window.originalItems = [...items];
      items.sort();
      createListItems();
      buttonON = true;
    } else {
      this.classList.toggle("toggled");
      items = window.originalItems;
      createListItems();
      buttonON = false;
    }
  });

  // Add an event listener to the search box
  searchBox.addEventListener("input", function () {
    const filterText = searchBox.value; // Get the value from the search box
    createListItems(filterText); // Re-render the list with the filtered items
  });

  chrome.runtime.sendMessage({ action: "extractClass" }, function (response) {
    if (response.error) {
      console.log("error");
      const playlistContainer = document.getElementById("playlist-container");
      if (playlistContainer) {
        playlistContainer.style.display = "none";
      }
      const searchBox = document.getElementById("search");
      if (searchBox) {
        searchBox.style.display = "none";
      }
      const errorMessage = document.createElement("p");
      errorMessage.textContent = response.error;
      const playlistList = document.getElementById("playlist");
      if (playlistList) {
        playlistList.appendChild(errorMessage);
      }
    } else if (response) {
      const extractedData = JSON.parse(response.content);
      items = extractedData.map((item) => `${item.title} - ${item.url}`);
      createListItems();
    } else {
      classDataElement.textContent = "No content found.";
    }
  });
  // END
});
