(() => {
  const expressionView = document.querySelector('#expression');
  const resultView = document.querySelector('#result');
  const keypad = document.querySelector('.keypad');
  const operators = ['+', '−', '×', '÷'];
  let expression = '';
  let justCalculated = false;
  let hasError = false;

  function render(preview = true) {
    expressionView.textContent = expression || '\u00a0';
    resultView.classList.toggle('error', hasError);
    if (hasError) return;
    if (!expression) { resultView.textContent = '0'; return; }
    if (!preview) return;
    try {
      const value = evaluate(expression);
      resultView.textContent = format(value);
    } catch {
      const current = expression.match(/(?:^|[+−×÷])\s*(-?\d*\.?\d*)$/)?.[1];
      resultView.textContent = current === undefined || current === '' ? '0' : current;
    }
  }

  function format(number) {
    if (!Number.isFinite(number)) throw new Error('Result is out of range');
    const rounded = Number.parseFloat(number.toPrecision(12));
    return Object.is(rounded, -0) ? '0' : String(rounded);
  }

  // Recursive descent parser: expression -> terms -> unary numbers with postfix %.
  function evaluate(source) {
    const tokens = source.replaceAll('−', '-').replaceAll('×', '*').replaceAll('÷', '/').match(/(?:\d+\.?\d*|\.\d+)|[+*/%()-]/g);
    if (!tokens || tokens.join('') !== source.replaceAll('−', '-').replaceAll('×', '*').replaceAll('÷', '/').replace(/\s/g, '')) throw new Error('Invalid expression');
    let index = 0;
    const peek = () => tokens[index];
    const take = () => tokens[index++];
    function parseExpression() {
      let value = parseTerm();
      while (peek() === '+' || peek() === '-') { const op = take(); const right = parseTerm(); value = op === '+' ? value + right : value - right; }
      return value;
    }
    function parseTerm() {
      let value = parseUnary();
      while (peek() === '*' || peek() === '/') {
        const op = take(); const right = parseUnary();
        if (op === '/' && right === 0) throw new Error('Cannot divide by zero');
        value = op === '*' ? value * right : value / right;
      }
      return value;
    }
    function parseUnary() {
      if (peek() === '+') { take(); return parseUnary(); }
      if (peek() === '-') { take(); return -parseUnary(); }
      let value;
      if (peek() === '(') { take(); value = parseExpression(); if (take() !== ')') throw new Error('Incomplete expression'); }
      else {
        const token = take();
        if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) throw new Error('Incomplete expression');
        value = Number(token);
      }
      while (peek() === '%') { take(); value /= 100; }
      return value;
    }
    const value = parseExpression();
    if (index !== tokens.length) throw new Error('Incomplete expression');
    if (!Number.isFinite(value)) throw new Error('Result is out of range');
    return value;
  }

  function appendDigit(value) {
    if (hasError || justCalculated) { expression = ''; hasError = false; justCalculated = false; }
    const match = expression.match(/(?:^|[+−×÷])(-?)(\d*\.?\d*)$/);
    const current = match?.[2] ?? '';
    if (value === '.' && current.includes('.')) return;
    if (value === '.' && (current === '' || current === '0')) {
      expression += current === '0' ? '' : '0';
    }
    expression += value;
    render();
  }

  function appendOperator(value) {
    if (hasError) { expression = ''; hasError = false; }
    if (!expression) {
      if (value === '−') expression = '−';
      else return;
    } else if (/[+−×÷.]$/.test(expression)) {
      if (value === '−' && /[×÷]$/.test(expression)) expression += value;
      else expression = expression.replace(/[+−×÷.]+$/, '') + value;
    } else expression += value;
    justCalculated = false;
    render();
  }

  function appendPercent() {
    if (hasError || !/\d$/.test(expression)) return;
    expression += '%'; justCalculated = false; render();
  }

  function calculate() {
    if (!expression || /[+−×÷]$/.test(expression)) { showError('Incomplete expression'); return; }
    try {
      const value = evaluate(expression);
      const formatted = format(value);
      expressionView.textContent = expression + ' =';
      expression = formatted;
      resultView.textContent = formatted;
      hasError = false; resultView.classList.remove('error'); justCalculated = true;
    } catch (error) { showError(error.message); }
  }

  function showError(message) { hasError = true; justCalculated = false; resultView.textContent = message; resultView.classList.add('error'); }

  function removeLast() {
    if (hasError || justCalculated) { expression = ''; hasError = false; justCalculated = false; }
    else expression = expression.slice(0, -1);
    render();
  }

  function changeSign() {
    if (hasError || justCalculated) { expression = ''; hasError = false; justCalculated = false; }
    if (!expression) { expression = '−'; render(); return; }
    const match = expression.match(/(^|[+−×÷])(-?\d*\.?\d+%?)$/);
    if (!match) return;
    const start = expression.length - match[2].length;
    expression = expression.slice(0, start) + (match[2].startsWith('-') ? match[2].slice(1) : '−' + match[2]);
    render();
  }

  function clear() { expression = ''; hasError = false; justCalculated = false; render(); }
  function activate(button) {
    const { action, value } = button.dataset;
    if (value !== undefined) {
      if (/^\d$|\./.test(value)) appendDigit(value);
      else if (operators.includes(value)) appendOperator(value);
      else if (value === '%') appendPercent();
    } else if (action === 'clear') clear();
    else if (action === 'delete') removeLast();
    else if (action === 'equals') calculate();
    else if (action === 'sign') changeSign();
  }

  keypad.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) activate(button);
  });

  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const keyMap = { '*': '×', '/': '÷', '-': '−', '+': '+', '%': '%', '.': '.', ',': '.', 'Enter': 'equals', '=': 'equals', 'Backspace': 'delete', 'Delete': 'clear', 'Escape': 'clear' };
    if (/^\d$/.test(event.key)) { appendDigit(event.key); event.preventDefault(); return; }
    const mapped = keyMap[event.key];
    if (mapped === 'equals') calculate();
    else if (mapped === 'delete') removeLast();
    else if (mapped === 'clear') clear();
    else if (mapped === '%') appendPercent();
    else if (mapped === '.') appendDigit('.');
    else if (mapped) appendOperator(mapped);
    else return;
    event.preventDefault();
  });

  keypad.addEventListener('pointerdown', event => { const button = event.target.closest('button'); if (button) button.classList.add('pressed'); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => keypad.addEventListener(type, event => { event.target.closest?.('button')?.classList.remove('pressed'); }));
  render();
})();
