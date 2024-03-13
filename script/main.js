// variable untuk fitur save, local storage, render, dan array dari rak buku
const shelfs = [];
const RENDER_EVENT = "render-shelf";
const SAVED_EVENT = "saved-shelf";
const STORAGE_KEY = "SHELF_APPS";

// untuk generate id berbeda masing-masing id
function generateId() {
  return +new Date();
}

// untuk memasukkan data kedalam objek
function generateShelfObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// untuk menemukan id dari masing-masing item
function findShelf(shelfId) {
  for (const shelfItem of shelfs) {
    if (shelfItem.id === shelfId) {
      return shelfItem;
    }
  }
  return null;
}

// untuk menemukan index masing-masing item
function findShelfIndex(shelfId) {
  for (const index in shelfs) {
    if (shelfs[index].id === shelfId) {
      return index;
    }
  }
  return -1;
}

// untuk check apakah browser support local storage atau tidak
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Your browser is not support local storage");
    return false;
  }
  return true;
}

// function untuk saved data yang telah diinput
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(shelfs);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// function untuk mengambil data dari local storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const shelf of data) {
      shelfs.push(shelf);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// function untuk mendefinisikan data yang telah dimasukan oleh user menjadi elemen dalam html
function makeShelf(shelfObject) {
  const { id, title, author, year, isComplete } = shelfObject;

  const textTitle = document.createElement("h3");
  textTitle.classList.add("item-list");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.append(textContainer);

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(container);
  article.setAttribute("id", `todo-${id}`);

  if (isComplete) {
    const unreadedButton = document.createElement("button");
    unreadedButton.classList.add("green-unreaded");
    unreadedButton.innerText = "Belum selesai di Baca";
    unreadedButton.addEventListener("click", function () {
      undoToUnreaded(id);
    });

    const deleteButtonReaded = document.createElement("button");
    deleteButtonReaded.classList.add("red-unreaded");
    deleteButtonReaded.innerText = "Hapus book";
    deleteButtonReaded.addEventListener("click", function () {
      deleteShelf(id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(unreadedButton, deleteButtonReaded);

    article.append(buttonContainer);
  } else {
    const readedButton = document.createElement("button");
    readedButton.classList.add("green-readed");
    readedButton.innerText = "Selesai dibaca";
    readedButton.addEventListener("click", function () {
      addToReaded(id);
    });

    const deleteButtonUnreaded = document.createElement("button");
    deleteButtonUnreaded.classList.add("red-readed");
    deleteButtonUnreaded.innerText = "Hapus book";
    deleteButtonUnreaded.addEventListener("click", function () {
      deleteShelf(id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(readedButton, deleteButtonUnreaded);

    article.append(buttonContainer);
  }
  return article;
}

// funtion untuk menentukan data yang diinput oleh user termasuk kedalam sudah dibaca atau belum dibaca
function addShelf() {
  const titleShelf = document.getElementById("inputBookTitle").value;
  const authorShelf = document.getElementById("inputBookAuthor").value;
  const yearShelf = document.getElementById("inputBookYear").value;

  const generatedID = generateId();
  const isChecked = document.getElementById("inputBookIsComplete").checked;

  if (isChecked) {
    const shelfObject = generateShelfObject(
      generatedID,
      titleShelf,
      authorShelf,
      yearShelf,
      true
    );
    shelfs.push(shelfObject);
  } else {
    const shelfObject = generateShelfObject(
      generatedID,
      titleShelf,
      authorShelf,
      yearShelf,
      false
    );
    shelfs.push(shelfObject);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// function function yang mendefinisikan tiap tiap tombol di dalam value
function addToReaded(shelfId) {
  const shelfTarget = findShelf(shelfId);
  if (shelfTarget == null) return;
  shelfTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteShelf(shelfId) {
  const shelfTarget = findShelfIndex(shelfId);
  if (shelfTarget === -1) return;
  shelfs.splice(shelfTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoToUnreaded(shelfId) {
  const shelfTarget = findShelf(shelfId);
  if (shelfTarget == null) return;
  shelfTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// funtion yang ketika DOM telah diload atau elemen HTML muncul secara penuh akan menjalankan fungsi submit
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addShelf();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// untuk fitur pencarian
const findBook = document.getElementById("searchBook");
const findTitle = document.querySelector("#searchBookTitle");

findBook.addEventListener("submit", function (e) {
  e.preventDefault();

  const titleValue = findTitle.value.toLowerCase().trim();

  const findValue = shelfs.filter((book) => {
    return (
      book.title.toLowerCase().includes(titleValue) ||
      book.author.toLowerCase().includes(titleValue) ||
      book.year.toString().includes(titleValue)
    );
  });

  search(findValue);
});

function search(value) {
  const uncompletedShelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedShelfList = document.getElementById("completeBookshelfList");

  uncompletedShelfList.innerHTML = "";
  completedShelfList.innerHTML = "";

  for (const book of value) {
    const bookItem = makeShelf(book);

    if (book.isComplete) {
      completedShelfList.append(bookItem);
    } else {
      uncompletedShelfList.append(bookItem);
    }
  }
}

// untuk memberi tahu data sudah di save ke local storage di console
document.addEventListener(SAVED_EVENT, () => {
  console.log("The data is saved.");
});

// untuk merender semua input dari user ke dalam HTML
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedShelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedShelfList = document.getElementById("completeBookshelfList");

  uncompletedShelfList.innerHTML = "";
  completedShelfList.innerHTML = "";

  for (const shelfItem of shelfs) {
    const shelfElement = makeShelf(shelfItem);
    if (shelfItem.isComplete) {
      completedShelfList.append(shelfElement);
    } else {
      uncompletedShelfList.append(shelfElement);
    }
  }
});
