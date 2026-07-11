(function () {
  'use strict';

  const displayEl = document.getElementById('display');
  const clearBtn = document.getElementById('clearBtn');
  const keysEl = document.querySelector('.keys');

  const MAX_DIGITS = 9; // how many significant digits a real calculator display typically holds

  let display = '0';           // what's currently shown / being typed
  let storedValue = null;      // accumulator from previous step
  let pendingOp = null;        // operator waiting to be applied
  let waitingForOperand = true; // true right after an operator, AC, or "="
  let lastOp = null;            // for repeating "=" (e.g. 5 + 3 = = = ...)
  let lastOperand = null;
  let isError = false;

  function calculate(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷':
        if (b === 0) throw new Error('Division by zero');
        return a / b;
      default:
        return b;
    }
  }

  function formatNumber(num) {
    if (!Number.isFinite(num)) throw new Error('Math error');
    if (Object.is(num, -0)) num = 0;

    // Round to a sensible precision, then trim to the digit budget like a
    // real calculator display would.
    let rounded = parseFloat(num.toPrecision(MAX_DIGITS));
    let str = String(rounded);

    if (str.replace(/[-.]/g, '').length > MAX_DIGITS + 2) {
      str = rounded.toExponential(4);
    }
    return str;
  }

  function displayWithCommas(numStr) {
    const trailingDot = numStr.endsWith('.') ? '.' : '';
    const core = trailingDot ? numStr.slice(0, -1) : numStr;
    if (core.includes('e') || core === '' || core === '-') return numStr;

    const [intPart, decPart] = core.split('.');
    const negative = intPart.startsWith('-');
    const digits = negative ? intPart.slice(1) : intPart;
    const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    let out = (negative ? '-' : '') + withCommas;
    if (decPart !== undefined) out += '.' + decPart;
    return out + trailingDot;
  }

  function render() {
    displayEl.textContent = isError ? 'Error' : displayWithCommas(display);
    // A real calculator shows "AC" only in a fresh state, "C" once you've
    // started entering something.
    const isFreshState = !isError && display === '0' && waitingForOperand && storedValue === null && pendingOp === null;
    clearBtn.textContent = isFreshState ? 'AC' : 'C';
  }

  function resetAll() {
    display = '0';
    storedValue = null;
    pendingOp = null;
    waitingForOperand = true;
    lastOp = null;
    lastOperand = null;
    isError = false;
  }

  function clearEntry() {
    display = '0';
    waitingForOperand = true;
  }

  function inputDigit(d) {
    if (isError) resetAll();
    if (waitingForOperand) {
      display = d;
      waitingForOperand = false;
    } else if (display.replace(/[-.]/g, '').length < MAX_DIGITS) {
      display = display === '0' ? d : display + d;
    }
    render();
  }

  function inputDecimal() {
    if (isError) resetAll();
    if (waitingForOperand) {
      display = '0.';
      waitingForOperand = false;
    } else if (!display.includes('.')) {
      display += '.';
    }
    render();
  }

  function toggleSign() {
    if (isError) return;
    if (display === '0') return;
    display = display.startsWith('-') ? display.slice(1) : '-' + display;
    render();
  }

  function percent() {
    if (isError) return;
    const currentValue = parseFloat(display);
    let result;
    if (pendingOp !== null && storedValue !== null) {
      // e.g. 50 + 10% -> 10% of 50
      result = (storedValue * currentValue) / 100;
    } else {
      result = currentValue / 100;
    }
    display = formatNumber(result);
    render();
  }

  function chooseOperator(opSymbol) {
    if (isError) resetAll();
    const currentValue = parseFloat(display);

    if (pendingOp !== null && !waitingForOperand) {
      try {
        storedValue = calculate(storedValue, pendingOp, currentValue);
        display = formatNumber(storedValue);
      } catch (e) {
        isError = true;
        storedValue = null;
        pendingOp = null;
        render();
        return;
      }
    } else if (storedValue === null) {
      storedValue = currentValue;
    }

    pendingOp = opSymbol;
    waitingForOperand = true;
    lastOp = null;
    lastOperand = null;
    render();
  }

  function equals() {
    if (isError) return;
    const currentValue = parseFloat(display);

    try {
      let result;
      if (pendingOp !== null) {
        result = calculate(storedValue, pendingOp, currentValue);
        lastOp = pendingOp;
        lastOperand = currentValue;
      } else if (lastOp !== null) {
        // Pressing "=" again repeats the last operation, like a real calculator.
        result = calculate(currentValue, lastOp, lastOperand);
      } else {
        result = currentValue;
      }
      display = formatNumber(result);
      storedValue = null;
      pendingOp = null;
      waitingForOperand = true;
      isError = false;
    } catch (e) {
      isError = true;
      storedValue = null;
      pendingOp = null;
      lastOp = null;
      lastOperand = null;
      waitingForOperand = true;
    }
    render();
  }

  function backspace() {
    if (isError) {
      resetAll();
      render();
      return;
    }
    if (waitingForOperand) return;
    display = display.length > 1 ? display.slice(0, -1) : '0';
    if (display === '-') display = '0';
    render();
  }

  // ---------- Event wiring ----------

  function markSelectedOperator(op) {
    document.querySelectorAll('.key--op[data-op]').forEach((b) => {
      b.classList.toggle('is-selected', b.dataset.op === op && waitingForOperand && pendingOp === op);
    });
  }

  function flashKey(btn) {
    btn.classList.add('is-pressed');
    setTimeout(() => btn.classList.remove('is-pressed'), 100);
  }

  function handleKey(btn) {
    if (!btn) return;
    flashKey(btn);

    if (btn.dataset.num !== undefined) {
      inputDigit(btn.dataset.num);
      markSelectedOperator(null);
      return;
    }
    if (btn.dataset.op) {
      chooseOperator(btn.dataset.op);
      markSelectedOperator(btn.dataset.op);
      return;
    }
    switch (btn.dataset.action) {
      case 'clear':
        if (clearBtn.textContent === 'AC') {
          resetAll();
        } else {
          clearEntry();
        }
        markSelectedOperator(null);
        break;
      case 'sign':
        toggleSign();
        break;
      case 'percent':
        percent();
        break;
      case 'decimal':
        inputDecimal();
        markSelectedOperator(null);
        break;
      case 'equals':
        equals();
        markSelectedOperator(null);
        break;
      default:
        break;
    }
    render();
  }

  keysEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.key');
    if (btn) handleKey(btn);
  });

  // ---------- Keyboard support ----------

  const KEY_MAP = {
    '+': '[data-op="+"]',
    '-': '[data-op="−"]',
    '*': '[data-op="×"]',
    '/': '[data-op="÷"]',
    'Enter': '[data-action="equals"]',
    '=': '[data-action="equals"]',
    'Backspace': '__backspace__',
    'Escape': '[data-action="clear"]',
    '.': '[data-action="decimal"]',
    '%': '[data-action="percent"]',
  };

  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleKey(document.querySelector(`[data-num="${e.key}"]`));
      e.preventDefault();
      return;
    }
    const selector = KEY_MAP[e.key];
    if (!selector) return;
    e.preventDefault();
    if (selector === '__backspace__') {
      backspace();
      return;
    }
    handleKey(document.querySelector(selector));
  });

  render();
})();