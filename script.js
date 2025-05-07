// Utility functions
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function createExtraIncomeItem(id) {
  const container = document.createElement('div');
  container.className = 'flex flex-col sm:flex-row sm:space-x-4 items-center space-y-2 sm:space-y-0';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Nome da renda extra';
  nameInput.className = 'flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-400';
  nameInput.required = true;
  nameInput.name = `extraIncomeName_${id}`;

  const daysInput = document.createElement('input');
  daysInput.type = 'text';
  daysInput.placeholder = 'Dias que recebe (ex: 10, 20)';
  daysInput.className = 'flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-400';
  daysInput.required = true;
  daysInput.name = `extraIncomeDays_${id}`;

  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.min = '0';
  amountInput.step = '0.01';
  amountInput.placeholder = 'Valor';
  amountInput.className = 'flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-400';
  amountInput.required = true;
  amountInput.name = `extraIncomeAmount_${id}`;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'text-red-600 hover:text-red-800 focus:outline-none';
  removeBtn.title = 'Remover renda extra';
  removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
  removeBtn.addEventListener('click', () => {
    container.remove();
  });

  container.appendChild(nameInput);
  container.appendChild(daysInput);
  container.appendChild(amountInput);
  container.appendChild(removeBtn);

  return container;
}

function createDebtItem(id) {
  const container = document.createElement('div');
  container.className = 'flex flex-col sm:flex-row sm:space-x-4 items-center space-y-2 sm:space-y-0';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Nome da dívida';
  nameInput.className = 'flex-grow p-2 border rounded focus:ring-2 focus:ring-red-400';
  nameInput.required = true;
  nameInput.name = `debtName_${id}`;

  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.min = '0';
  amountInput.step = '0.01';
  amountInput.placeholder = 'Valor';
  amountInput.className = 'flex-grow p-2 border rounded focus:ring-2 focus:ring-red-400';
  amountInput.required = true;
  amountInput.name = `debtAmount_${id}`;

  const dueDateInput = document.createElement('input');
  dueDateInput.type = 'number';
  dueDateInput.min = '1';
  dueDateInput.max = '31';
  dueDateInput.placeholder = 'Dia do vencimento';
  dueDateInput.className = 'flex-grow p-2 border rounded focus:ring-2 focus:ring-red-400';
  dueDateInput.required = true;
  dueDateInput.name = `debtDueDate_${id}`;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'text-red-600 hover:text-red-800 focus:outline-none';
  removeBtn.title = 'Remover dívida';
  removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
  removeBtn.addEventListener('click', () => {
    container.remove();
  });

  container.appendChild(nameInput);
  container.appendChild(amountInput);
  container.appendChild(dueDateInput);
  container.appendChild(removeBtn);

  return container;
}

// Tab switching
const tabInput = document.getElementById('tab-input');
const tabSaved = document.getElementById('tab-saved');
const sectionInput = document.getElementById('section-input');
const sectionSaved = document.getElementById('section-saved');

tabInput.addEventListener('click', () => {
  tabInput.classList.add('border-blue-600', 'text-blue-600', 'font-semibold');
  tabInput.setAttribute('aria-selected', 'true');
  tabSaved.classList.remove('border-blue-600', 'text-blue-600', 'font-semibold');
  tabSaved.setAttribute('aria-selected', 'false');
  sectionInput.classList.remove('hidden');
  sectionSaved.classList.add('hidden');
  clearSavedDetails();
});

tabSaved.addEventListener('click', () => {
  tabSaved.classList.add('border-blue-600', 'text-blue-600', 'font-semibold');
  tabSaved.setAttribute('aria-selected', 'true');
  tabInput.classList.remove('border-blue-600', 'text-blue-600', 'font-semibold');
  tabInput.setAttribute('aria-selected', 'false');
  sectionSaved.classList.remove('hidden');
  sectionInput.classList.add('hidden');
  clearResults();
  loadSavedDataList();
});

// Dynamic form fields
const extraIncomesList = document.getElementById('extraIncomesList');
const addExtraIncomeBtn = document.getElementById('addExtraIncome');
let extraIncomeId = 0;

addExtraIncomeBtn.addEventListener('click', () => {
  extraIncomeId++;
  const item = createExtraIncomeItem(extraIncomeId);
  extraIncomesList.appendChild(item);
});

const debtsList = document.getElementById('debtsList');
const addDebtBtn = document.getElementById('addDebt');
let debtId = 0;

addDebtBtn.addEventListener('click', () => {
  debtId++;
  const item = createDebtItem(debtId);
  debtsList.appendChild(item);
});

// Calculation and results
const calculateBtn = document.getElementById('calculateBtn');
const saveBtn = document.getElementById('saveBtn');
const resultsSection = document.getElementById('resultsSection');
const totalDebtsEl = document.getElementById('totalDebts');
const totalIncomeEl = document.getElementById('totalIncome');
const balanceEl = document.getElementById('balance');
const balanceStatusEl = document.getElementById('balanceStatus');
const paymentSuggestionsEl = document.getElementById('paymentSuggestions');
const improvementSuggestionsEl = document.getElementById('improvementSuggestions');
const saveNameInput = document.getElementById('saveName');

function parseDaysString(daysStr) {
  // Parse string like "10, 20" into array of numbers
  return daysStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '')
    .map(s => parseInt(s))
    .filter(n => !isNaN(n) && n >= 1 && n <= 31);
}

function calculateResults() {
  const paymentDay = parseInt(document.getElementById('paymentDay').value);
  const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);

  if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
    alert('Informe um dia de pagamento válido (1-31).');
    return null;
  }
  if (isNaN(paymentAmount) || paymentAmount < 0) {
    alert('Informe um valor de pagamento válido.');
    return null;
  }

  // Calculate total income including extras
  let totalIncome = paymentAmount;
  const extraIncomes = [];
  for (const container of extraIncomesList.children) {
    const name = container.querySelector('input[name^="extraIncomeName_"]').value.trim();
    const daysStr = container.querySelector('input[name^="extraIncomeDays_"]').value.trim();
    const amount = parseFloat(container.querySelector('input[name^="extraIncomeAmount_"]').value);
    if (!name || !daysStr || isNaN(amount) || amount < 0) {
      alert('Preencha corretamente todas as rendas extras.');
      return null;
    }
    const days = parseDaysString(daysStr);
    if (days.length === 0) {
      alert('Informe dias válidos para as rendas extras.');
      return null;
    }
    extraIncomes.push({ name, days, amount });
    totalIncome += amount * days.length;
  }

  // Calculate total debts
  const debts = [];
  for (const container of debtsList.children) {
    const name = container.querySelector('input[name^="debtName_"]').value.trim();
    const amount = parseFloat(container.querySelector('input[name^="debtAmount_"]').value);
    const dueDate = parseInt(container.querySelector('input[name^="debtDueDate_"]').value);
    if (!name || isNaN(amount) || amount < 0 || isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
      alert('Preencha corretamente todas as dívidas.');
      return null;
    }
    debts.push({ name, amount, dueDate });
  }

  // Calculate total debts sum
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);

  // Calculate balance
  const balance = totalIncome - totalDebts;

  // Determine balance status
  let balanceStatus = '';
  if (balance > 0) {
    balanceStatus = 'Saldo positivo. Você tem dinheiro sobrando.';
  } else if (balance < 0) {
    balanceStatus = 'Saldo negativo. Você está devendo mais do que recebe.';
  } else {
    balanceStatus = 'Saldo zerado.';
  }

  // Suggest debts to pay to avoid overdue
  // Sort debts by due date ascending
  const debtsSorted = debts.slice().sort((a, b) => a.dueDate - b.dueDate);
  let availableMoney = totalIncome;
  const debtsToPay = [];
  for (const debt of debtsSorted) {
    if (availableMoney >= debt.amount) {
      debtsToPay.push(debt);
      availableMoney -= debt.amount;
    } else {
      break;
    }
  }

  // Improvement suggestions based on balance
  let improvementSuggestions = '';
  if (balance < 0) {
    improvementSuggestions = 'Considere reduzir despesas ou aumentar suas rendas extras para evitar saldo negativo.';
  } else if (balance === 0) {
    improvementSuggestions = 'Seu saldo está equilibrado, mas é bom manter um controle rigoroso para evitar dívidas.';
  } else {
    improvementSuggestions = 'Ótimo! Você tem saldo positivo. Considere guardar uma parte para emergências.';
  }

  return {
    totalIncome,
    totalDebts,
    balance,
    balanceStatus,
    debtsToPay,
    improvementSuggestions,
    extraIncomes,
    debts,
    paymentDay,
    paymentAmount,
  };
}

function displayResults(results) {
  if (!results) {
    resultsSection.classList.add('hidden');
    saveBtn.disabled = true;
    return;
  }
  totalDebtsEl.textContent = formatCurrency(results.totalDebts);
  totalIncomeEl.textContent = formatCurrency(results.totalIncome);
  balanceEl.textContent = formatCurrency(results.balance);
  balanceStatusEl.textContent = results.balanceStatus;

  // Payment suggestions
  if (results.debtsToPay.length === 0) {
    paymentSuggestionsEl.innerHTML = '<p class="font-semibold text-gray-700">Nenhuma dívida pode ser paga com o saldo atual.</p>';
  } else {
    let html = '<p class="font-semibold text-gray-700 mb-2">Dívidas que você deve pagar para não atrasar:</p><ul class="list-disc list-inside">';
    for (const debt of results.debtsToPay) {
      html += `<li>${debt.name} - Vence dia ${debt.dueDate} - ${formatCurrency(debt.amount)}</li>`;
    }
    html += '</ul>';
    paymentSuggestionsEl.innerHTML = html;
  }

  improvementSuggestionsEl.textContent = results.improvementSuggestions;

  resultsSection.classList.remove('hidden');
  saveBtn.disabled = false;
}

calculateBtn.addEventListener('click', () => {
  const results = calculateResults();
  displayResults(results);
});

// Saving and loading data
function getSavedData() {
  const data = localStorage.getItem('debtManagerData');
  return data ? JSON.parse(data) : [];
}

function saveData(entry) {
  const data = getSavedData();
  data.push(entry);
  localStorage.setItem('debtManagerData', JSON.stringify(data));
}

function deleteDataById(id) {
  let data = getSavedData();
  data = data.filter(d => d.id !== id);
  localStorage.setItem('debtManagerData', JSON.stringify(data));
}

function clearAllData() {
  localStorage.removeItem('debtManagerData');
}

// Save button handler
saveBtn.addEventListener('click', () => {
  const results = calculateResults();
  if (!results) return;

  const saveName = saveNameInput.value.trim();
  if (!saveName) {
    alert('Informe um nome para salvar os dados.');
    return;
  }

  const id = Date.now().toString();
  const entry = {
    id,
    name: saveName,
    timestamp: new Date().toISOString(),
    results,
  };
  saveData(entry);
  alert('Dados salvos com sucesso!');
  saveBtn.disabled = true;
  saveNameInput.value = '';
  clearForm();
});

// Clear form after save
function clearForm() {
  document.getElementById('debtForm').reset();
  extraIncomesList.innerHTML = '';
  debtsList.innerHTML = '';
  resultsSection.classList.add('hidden');
}

// Saved data list and details
const savedDataList = document.getElementById('savedDataList');
const deleteAllSavedBtn = document.getElementById('deleteAllSaved');
const savedDetails = document.getElementById('savedDetails');

function loadSavedDataList() {
  const data = getSavedData();
  savedDataList.innerHTML = '';
  savedDetails.classList.add('hidden');
  savedDetails.innerHTML = '';
  deleteAllSavedBtn.disabled = data.length === 0;

  if (data.length === 0) {
    savedDataList.innerHTML = '<p class="text-gray-600 italic">Nenhum dado salvo.</p>';
    return;
  }

  data.forEach(entry => {
    const container = document.createElement('div');
    container.className = 'border border-gray-300 rounded p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100';
    container.tabIndex = 0;
    container.setAttribute('role', 'button');
    container.setAttribute('aria-pressed', 'false');

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
      <p class="font-semibold">${entry.name}</p>
      <p class="text-sm text-gray-600">Total Dívidas: ${formatCurrency(entry.results.totalDebts)} | Total Rendimentos: ${formatCurrency(entry.results.totalIncome)} | Saldo: ${formatCurrency(entry.results.balance)}</p>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'text-red-600 hover:text-red-800 focus:outline-none ml-4';
    deleteBtn.title = 'Excluir este dado';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Deseja realmente excluir "${entry.name}"?`)) {
        deleteDataById(entry.id);
        loadSavedDataList();
        savedDetails.classList.add('hidden');
        savedDetails.innerHTML = '';
      }
    });

    container.appendChild(infoDiv);
    container.appendChild(deleteBtn);

    container.addEventListener('click', () => {
      displaySavedDetails(entry);
    });
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        displaySavedDetails(entry);
      }
    });

    savedDataList.appendChild(container);
  });
}

function displaySavedDetails(entry) {
  savedDetails.classList.remove('hidden');
  const { results } = entry;
  let html = `<h3 class="font-semibold mb-2">${entry.name}</h3>`;
  html += `<p><strong>Data do salvamento:</strong> ${new Date(entry.timestamp).toLocaleString('pt-BR')}</p>`;
  html += `<p><strong>Dia do pagamento principal:</strong> ${results.paymentDay}</p>`;
  html += `<p><strong>Valor do pagamento principal:</strong> ${formatCurrency(results.paymentAmount)}</p>`;

  html += '<h4 class="mt-4 font-semibold">Rendas Extras:</h4>';
  if (results.extraIncomes.length === 0) {
    html += '<p>Nenhuma renda extra.</p>';
  } else {
    html += '<ul class="list-disc list-inside">';
    results.extraIncomes.forEach(inc => {
      html += `<li>${inc.name} - Dias: ${inc.days.join(', ')} - Valor: ${formatCurrency(inc.amount)}</li>`;
    });
    html += '</ul>';
  }

  html += '<h4 class="mt-4 font-semibold">Dívidas:</h4>';
  if (results.debts.length === 0) {
    html += '<p>Nenhuma dívida.</p>';
  } else {
    html += '<ul class="list-disc list-inside">';
    results.debts.forEach(debt => {
      html += `<li>${debt.name} - Vence dia ${debt.dueDate} - Valor: ${formatCurrency(debt.amount)}</li>`;
    });
    html += '</ul>';
  }

  html += `<p class="mt-4"><strong>Total de Dívidas:</strong> ${formatCurrency(results.totalDebts)}</p>`;
  html += `<p><strong>Total de Rendimentos:</strong> ${formatCurrency(results.totalIncome)}</p>`;
  html += `<p><strong>Saldo:</strong> ${formatCurrency(results.balance)}</p>`;
  html += `<p><strong>Status do saldo:</strong> ${results.balanceStatus}</p>`;

  html += '<h4 class="mt-4 font-semibold">Dívidas para pagar:</h4>';
  if (results.debtsToPay.length === 0) {
    html += '<p>Nenhuma dívida pode ser paga com o saldo atual.</p>';
  } else {
    html += '<ul class="list-disc list-inside">';
    results.debtsToPay.forEach(debt => {
      html += `<li>${debt.name} - Vence dia ${debt.dueDate} - Valor: ${formatCurrency(debt.amount)}</li>`;
    });
    html += '</ul>';
  }

  html += `<p class="mt-4 italic text-gray-700">${results.improvementSuggestions}</p>`;

  savedDetails.innerHTML = html;
}

function clearSavedDetails() {
  savedDetails.classList.add('hidden');
  savedDetails.innerHTML = '';
}

deleteAllSavedBtn.addEventListener('click', () => {
  if (confirm('Deseja realmente excluir todos os dados salvos?')) {
    clearAllData();
    loadSavedDataList();
    clearSavedDetails();
  }
});

// Clear results when switching to saved tab
function clearResults() {
  resultsSection.classList.add('hidden');
  saveBtn.disabled = true;
}

// Initialize with one extra income and one debt input for user convenience
addExtraIncomeBtn.click();
addDebtBtn.click();
