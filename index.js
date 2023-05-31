const jim = document.getElementById("jim");
const input = document.getElementById("textInput");
const cursor = document.getElementById("cursor");
const normalMode = "NORMAL";
const insertMode = "INSERT";
const visualMode = "VISUAL";
const commandMode = "COMMAND";
const searchMode = "SEARCH";
let wordState = "INSERT";
let charCount = 0;
let lineCount = 1;
let targetpos = null;
let cursorType = "insert";
let amountString = "";
let layerState = false;
let replaceState = false;
let findState = false;
let commandBuffer = "";
const lineno = document.getElementById("linenumbers");
lineno.innerText = "1.\n";
lineCount++;
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    wordState = normalMode;
    cursorType = "outlineblock";
  } else if (wordState === insertMode) {
    if (event.key.length === 1) {
      appendSpan(event.key);
      charCount++;
      if (event.key === "(") {
        appendSpan(")");
      } else if (event.key === '"') {
        appendSpan('"');
      } else if (event.key === "[") {
        appendSpan("]");
      } else if (event.key === "'") {
        appendSpan("'");
      } else if (event.key === "{") {
        appendSpan("}");
      }
    } else if (event.key === "Backspace") {
      if (charCount !== 0) {
        document.getElementById("jim").removeChild(
          document.getElementById("jim").children[charCount - 1],
        );
        charCount--;
      }
    } else if (event.key === "Enter") {
      jim.innerHTML += "<br>";
      lineno.innerText += lineCount + ".\n";
      lineCount++;
      charCount++;
    }
  } else if (wordState === normalMode) {
    if (layerState) {
      if (replaceState) {
        replaceLetter(event.key);
        replaceState = false;
      } else if (findState) {
        findRealCharacter(event.key);
        findState = false;
      }
      layerState = false;
    } else if (event.key === "i") {
      wordState = insertMode;
      charCount--;
      cursorType = "insert";
    } else if (event.key === "a") {
      wordState = insertMode;
      cursorType = "insert";
    } else if (event.key === "v") {
      wordState = visualMode;
    } else if (event.key === ":") {
      wordState = commandMode;
      appendCommandText(event.key);
    } else if (event.key === "/") {
      wordState = searchMode;
    } else if (event.key === "h") {
      moveLeft(parseInt(amountString));
      amountString = "";
    } else if (event.key === "l") {
      moveRight(parseInt(amountString));
      amountString = "";
    } else if (event.key === "w") {
      goForward(parseInt(amountString));
    } else if (event.key === "b") {
      goBackward(parseInt(amountString));
    } else if (event.key === "$") {
      findKey("BR");
    } else if (event.key === "0" && amountString.length === 0) {
      findKeyBackWards("BR");
    } else if (event.key === "r") {
      replaceState = true;
      layerState = true;
    } else if (event.key === "x") {
      removeLetter();
    } else if (isDigit(event.key)) {
      amountString += event.key;
    } else if (event.key === "f") {
      layerState = true;
      findState = true;
    }
  } else if (wordState === visualMode) {
  } else if (wordState === commandMode) {
    if (event.key === "Enter") {
      evaluateCommand();
      wordState = normalMode;
      document.getElementById("command").textContent = "";
      commandBuffer = "";
    }
    if (event.key.length === 1) {
      appendCommandText(event.key);
      if (event.key !== ":") commandBuffer += event.key;
    }
  }
  updateCursor();
});

function updateCursor() {
  if (charCount === 0) return;
  const charSpan = document.getElementById("jim").children[charCount - 1];
  const cursor = document.getElementById("cursor");
  const rect = charSpan.getBoundingClientRect();
  targetpos = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
  makeCursor(rect, cursor);
  cursor.style.left = targetpos.left + "px";
  cursor.style.top = targetpos.top + "px";
  cursor.style.width = targetpos.width + "px";
  cursor.style.height = targetpos.height + "px";
}

function findKey(theKey) {
  for (
    let i = charCount;
    i < document.getElementById("jim").children.length;
    i++
  ) {
    if (
      document.getElementById("jim").children[charCount++].tagName === theKey
    ) {
      return;
    }
  }
}

function findRealCharacter(theKey) {
  for (let i = 0; i < document.getElementById("jim").children.length; i++) {
    if (document.getElementById("jim").children[charCount++] === theKey) {
      return;
    }
  }
}

function findKeyBackWards(theKey) {
  for (let i = 0; i < document.getElementById("jim").children.length; i++) {
    if (
      document.getElementById("jim").children[charCount - 1].tagName === theKey
    ) {
      charCount++;
      return;
    }
    charCount--;
  }
}

function isDigit(input) {
  let regex = /^\d+$/;
  return regex.test(input);
}

function makeCursor(rect, cursor) {
  if (cursorType === "outlineblock") {
    cursor.style.border = "2px solid white";
    cursor.style.backgroundColor = "rgba(255, 255, 255, 0)";
    targetpos.width = rect.width - 4;
    targetpos.height = rect.height - 5;
    targetpos.left = rect.left;
    targetpos.top = rect.top + 1;
  } else if (cursorType === "insert") {
    targetpos.width = 1;
    cursor.style.backgroundColor = "white";
    targetpos.left = rect.width + rect.left;
    targetpos.top = rect.top;
    targetpos.height = rect.height;
    cursor.style.border = "0px";
  }
}

function appendSpan(key) {
  let parentElement = document.getElementById("jim");
  let newSpan = document.createElement("span");
  newSpan.textContent = key;
  if (charCount < parentElement.children.length) {
    parentElement.insertBefore(newSpan, parentElement.children[charCount]);
  } else {
    parentElement.appendChild(newSpan);
  }
}

function appendCommandText(key) {
  document.getElementById("command").innerText += key;
}

function evaluateCommand() {
  let parent = document.getElementById("jim");
  let spans = parent.getElementsByTagName("span");
  if (commandBuffer === "%d") {
    while (document.getElementById("jim").children.length > 0) {
      parent.removeChild(spans[0]);
    }
    charCount = 0;
    console.log("hi");
  } else if (commandBuffer === "terminal") {
    window.open("https://ld211.github.io");
  }
}

function moveRight(n) {
  if (isNaN(n)) n = 1;
  for (let i = 0; i < n; i++) {
    if (charCount < document.getElementById("jim").children.length) {
      charCount++;
    }
  }
}

function moveLeft(n) {
  if (isNaN(n)) n = 1;
  for (let i = 0; i < n; i++) {
    if (
      charCount > document.getElementById("jim").children.length ||
      charCount !== 0
    ) {
      charCount--;
    }
  }
}

function goForward(n) {
  if (isNaN(n)) n = 1;
  for (let i = 0; i < n; i++) {
    while (charCount++ < document.getElementById("jim").children.length) {
      if (document.getElementById("jim").children[charCount--] === " ") {
        break;
      }
    }
  }
}

function goBackward(n) {
  if (isNan(n)) n = 1;
}

function replaceLetter(character) {
  document.getElementById("jim").children[charCount - 1].textContent =
    character;
}

function removeLetter() {
  document.getElementById("jim").removeChild(
    document.getElementById("jim").children[charCount - 1],
  );
  charCount--;
}
