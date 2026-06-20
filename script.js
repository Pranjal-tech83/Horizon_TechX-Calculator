/* ══════════════════════════════════════════════════════
   Calculator — Vanilla JS Engine (Neumorphic)
   ══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // ── State ──────────────────────────────────────────
  let currentInput   = "0";
  let previousInput  = "";
  let operator       = null;
  let shouldReset    = false;
  let lastExpression = "";

  // ── DOM refs ───────────────────────────────────────
  const displayValue = document.getElementById("displayValue");
  const expressionEl = document.getElementById("expression");
  const historyEl    = document.getElementById("history");

  // ── Helpers ────────────────────────────────────────
  function formatNumber(numStr) {
    if (numStr === "" || numStr === "Error") return numStr;
    const parts   = numStr.split(".");
    const intPart = parts[0];
    const decPart = parts[1];

    const sign      = intPart.startsWith("-") ? "-" : "";
    const absInt    = intPart.replace("-", "");
    const formatted = absInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let result = sign + formatted;
    if (decPart !== undefined) result += "." + decPart;
    return result;
  }

  function updateDisplay() {
    const formatted = formatNumber(currentInput);
    displayValue.textContent = formatted || "0";

    // Auto-resize for very long numbers
    const len = currentInput.replace(/[^0-9]/g, "").length;
    if (len > 12) {
      displayValue.style.fontSize = "1.8rem";
    } else if (len > 9) {
      displayValue.style.fontSize = "2.2rem";
    } else {
      displayValue.style.fontSize = "";
    }

    // Flash animation
    displayValue.classList.remove("flash");
    void displayValue.offsetWidth; // force reflow
    displayValue.classList.add("flash");
  }

  function updateExpression() {
    if (previousInput && operator) {
      expressionEl.textContent = formatNumber(previousInput) + " " + operator;
    } else {
      expressionEl.textContent = lastExpression;
    }
  }

  // ── Core logic ─────────────────────────────────────
  function inputNumber(num) {
    if (shouldReset) {
      currentInput = num;
      shouldReset  = false;
    } else {
      if (currentInput === "0" && num !== ".") {
        currentInput = num;
      } else {
        if (currentInput.length >= 15) return;
        currentInput += num;
      }
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldReset) {
      currentInput = "0.";
      shouldReset  = false;
      updateDisplay();
      return;
    }
    if (!currentInput.includes(".")) {
      currentInput += ".";
      updateDisplay();
    }
  }

  function inputOperator(op) {
    if (operator && !shouldReset) {
      calculate();
    }
    previousInput = currentInput;
    operator      = op;
    shouldReset   = true;
    lastExpression = "";
    updateExpression();
  }

  function calculate() {
    if (!operator || previousInput === "") return;

    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    let result;

    switch (operator) {
      case "+": result = prev + curr; break;
      case "−": result = prev - curr; break;
      case "×": result = prev * curr; break;
      case "÷":
        if (curr === 0) {
          currentInput   = "Error";
          previousInput  = "";
          operator       = null;
          shouldReset    = true;
          lastExpression = "Cannot divide by zero";
          updateDisplay();
          updateExpression();
          return;
        }
        result = prev / curr;
        break;
      default: return;
    }

    // Build expression string for history
    lastExpression = formatNumber(previousInput) + " " + operator + " " + formatNumber(currentInput) + " =";

    // Handle floating point precision
    result        = parseFloat(result.toPrecision(12));
    currentInput  = String(result);
    previousInput = "";
    operator      = null;
    shouldReset   = true;

    updateDisplay();
    updateExpression();
    historyEl.textContent = lastExpression + " " + formatNumber(currentInput);
  }

  function inputPercent() {
    const val = parseFloat(currentInput);
    if (isNaN(val)) return;
    currentInput = String(parseFloat((val / 100).toPrecision(12)));
    updateDisplay();
  }

  function clearAll() {
    currentInput   = "0";
    previousInput  = "";
    operator       = null;
    shouldReset    = false;
    lastExpression = "";
    updateDisplay();
    updateExpression();
  }

  function backspace() {
    if (shouldReset || currentInput === "Error") {
      clearAll();
      return;
    }
    currentInput = currentInput.slice(0, -1);
    if (currentInput === "" || currentInput === "-") {
      currentInput = "0";
    }
    updateDisplay();
  }

  // ── Button press visual feedback ───────────────────
  function flashButton(btn) {
    btn.classList.remove("pressed");
    void btn.offsetWidth;
    btn.classList.add("pressed");
    setTimeout(function () { btn.classList.remove("pressed"); }, 180);
  }

  // ── Click handler ──────────────────────────────────
  document.getElementById("calculator").addEventListener("click", function (e) {
    var btn = e.target.closest(".btn");
    if (!btn) return;

    flashButton(btn);
    var action = btn.dataset.action;
    var value  = btn.dataset.value;

    switch (action) {
      case "number":    inputNumber(value); break;
      case "decimal":   inputDecimal(); break;
      case "operator":  inputOperator(value); break;
      case "equals":    calculate(); break;
      case "clear":     clearAll(); break;
      case "backspace": backspace(); break;
      case "percent":   inputPercent(); break;
    }
  });

  // ── Keyboard support ───────────────────────────────
  var keyMap = {
    "0": { action: "number",   value: "0", btn: "btn-0" },
    "1": { action: "number",   value: "1", btn: "btn-1" },
    "2": { action: "number",   value: "2", btn: "btn-2" },
    "3": { action: "number",   value: "3", btn: "btn-3" },
    "4": { action: "number",   value: "4", btn: "btn-4" },
    "5": { action: "number",   value: "5", btn: "btn-5" },
    "6": { action: "number",   value: "6", btn: "btn-6" },
    "7": { action: "number",   value: "7", btn: "btn-7" },
    "8": { action: "number",   value: "8", btn: "btn-8" },
    "9": { action: "number",   value: "9", btn: "btn-9" },
    ".": { action: "decimal",  btn: "btn-decimal" },
    "+": { action: "operator", value: "+", btn: "btn-add" },
    "-": { action: "operator", value: "−", btn: "btn-subtract" },
    "*": { action: "operator", value: "×", btn: "btn-multiply" },
    "/": { action: "operator", value: "÷", btn: "btn-divide" },
    "%": { action: "percent",  btn: "btn-percent" },
    "Enter":     { action: "equals",    btn: "btn-equals" },
    "=":         { action: "equals",    btn: "btn-equals" },
    "Escape":    { action: "clear",     btn: "btn-clear" },
    "Backspace": { action: "backspace", btn: "btn-backspace" },
    "Delete":    { action: "clear",     btn: "btn-clear" },
  };

  document.addEventListener("keydown", function (e) {
    var mapping = keyMap[e.key];
    if (!mapping) return;

    e.preventDefault();

    var btnEl = document.getElementById(mapping.btn);
    if (btnEl) flashButton(btnEl);

    switch (mapping.action) {
      case "number":    inputNumber(mapping.value); break;
      case "decimal":   inputDecimal(); break;
      case "operator":  inputOperator(mapping.value); break;
      case "equals":    calculate(); break;
      case "clear":     clearAll(); break;
      case "backspace": backspace(); break;
      case "percent":   inputPercent(); break;
    }
  });

  // ── Bottom nav interaction ─────────────────────────
  document.querySelectorAll(".nav-item").forEach(function (item) {
    item.addEventListener("click", function () {
      document.querySelectorAll(".nav-item").forEach(function (i) {
        i.classList.remove("active");
      });
      item.classList.add("active");
    });
  });

  // ── Init ───────────────────────────────────────────
  updateDisplay();
})();
