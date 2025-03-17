const inputText = document.querySelector(".input-text");
const inputHistory = document.querySelector(".input-history");
const buttons = document.querySelectorAll(".btn-primary, .btn-secondary, .btn-equal");

let currentInput = "0";
let history = "";
let result = null;
let operator = "";
let isOperatorLast = false;

function updateDisplay() {
  inputText.textContent = formatNumber(currentInput);
  inputHistory.textContent = history;
}

buttons.forEach((button) => {
  button.addEventListener("click", (e) => handleInput(e.target.textContent));
});

document.addEventListener("keydown", (e) => {
  const keyMap = { "*": "×", "/": "÷", "Enter": "=", "Backspace": "Del", "Escape": "C", "Delete": "CE" };
  const key = keyMap[e.key] || e.key;
  if (/^[0-9.+\-×÷()=]$/.test(key)) handleInput(key);
});

function handleInput(value) {
  if (value === "C") {
    resetCalculator();
  } else if (value === "CE") {
    clearEntry();
  } else if (value === "Del") {
    deleteLast();
  } else if (value === "=") {
    calculateResult();
  } else if (["+", "-", "×", "÷"].includes(value)) {
    handleOperator(value);
  } else if (["Sin", "Cos", "Tan", "log", "x²", "e"].includes(value)) {
    handleScientificOperations(value);
  } else {
    handleNumber(value);
  }
  updateDisplay();
}

function resetCalculator() {
  currentInput = "0";
  history = "";
  result = null;
  operator = "";
  isOperatorLast = false;
}

function clearEntry() {
  currentInput = "0";
  isOperatorLast = false;
}

function deleteLast() {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
}

function handleOperator(value) {
  if (result !== null) {
    history = currentInput; 
    result = null;
  }

  if (history === "" && value !== "-") return;
  if (isOperatorLast) {
    history = history.slice(0, -1) + value;
  } else {
    history += value;
  }
  currentInput = "";
  operator = value.replace("×", "*").replace("÷", "/");
  isOperatorLast = true;
}

function handleNumber(value) {
  if (result !== null) {
    currentInput = value;
    history = value; 
    result = null;
  } else if (currentInput === "0" && value !== ".") {
    currentInput = value;
  } else if (!(value === "." && currentInput.includes("."))) {
    currentInput += value;
  }

  if (result === null && history !== currentInput) {
    history += value;
  }

  isOperatorLast = false;
}

function calculateResult() {
  try {
    let expression = history.replace(/×/g, "*").replace(/÷/g, "/");
    if(isOperatorLast) {
      expression = expressionFormat(expression)
    }
    result = new Function(`return ${expression}`)();
    currentInput = String(result);
    history = currentInput;
  } catch {
    currentInput = "Error";
  }
  isOperatorLast = false;
}

function expressionFormat(expression) {
  // Define a regex that matches an operator at the end (optionally with spaces)
  const endOpRegex = /[+\-*\/]\s*$/;
  if (!endOpRegex.test(expression)) {
    return expression; // No trailing operator; return unchanged.
  }

  // Extract the trailing operator (removing any extra whitespace)
  const trailingOpMatch = expression.match(endOpRegex);
  const trailingOp = trailingOpMatch ? trailingOpMatch[0].trim() : "";
  
  // Remove the trailing operator from the expression
  const trimmedExpression = expression.replace(endOpRegex, '');

  // Find the index of the last operator in the remaining expression.
  // We assume the operators we care about are +, -, *, and /
  const lastPlus = trimmedExpression.lastIndexOf('+');
  const lastMinus = trimmedExpression.lastIndexOf('-');
  const lastMultiply = trimmedExpression.lastIndexOf('*');
  const lastDivide = trimmedExpression.lastIndexOf('/');
  
  // Determine the greatest index among them.
  const lastOpIndex = Math.max(lastPlus, lastMinus, lastMultiply, lastDivide);

  // If there is no operator before the trailing operator, just return the expression.
  if (lastOpIndex === -1) {
    return expression;
  }

  // Replace the operator at lastOpIndex with the trailing operator
  // and drop the extra (trailing) operator.
  const newExpression =
    trimmedExpression.substring(0, lastOpIndex) +
    trailingOp +
    trimmedExpression.substring(lastOpIndex + 1);
  return newExpression;
}

function handleScientificOperations(value) {
  const num = parseFloat(currentInput);
  const operations = {
    "Sin": Math.sin,
    "Cos": Math.cos,
    "Tan": Math.tan,
    "log": (n) => (n > 0 ? Math.log(n) : "Error"),
    "x²": (n) => n ** 2,
    "e": () => Math.E
  };
  currentInput = String(operations[value](num));
  history = currentInput;
}

function formatNumber(number) {
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
