//SELECT ELEMENTS
const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

//SELECT BUTTONS
const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

//INPUT BTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

//VARIABLES
let ENTRY_LIST;
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";

// LOOK IF THERE IS DATA IN LOCAL STORAGE
ENTRY_LIST = JSON.parse(localStorage.getItem("entry_list")) || [];
updateUI();

//EVENT LISTENERS
expenseBtn?.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});

incomeBtn?.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});

allBtn?.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});

addExpense?.addEventListener("click", function () {
  if (!expenseTitle.value || !expenseAmount.value) return;

  const amountNumber = +expenseAmount.value.replace(",", ".");

  if (isNaN(amountNumber)) return;

  let expense = {
    type: "expense",
    title: expenseTitle.value,
    amount: amountNumber,
  };
  ENTRY_LIST.push(expense);

  updateUI();
  clearInput([expenseTitle, expenseAmount]);
});

addIncome?.addEventListener("click", function () {
  if (!incomeTitle.value || !incomeAmount.value) return;

  const amountNumber = +incomeAmount.value.replace(",", ".");

  if (isNaN(amountNumber)) return;

  let incomeObj = {
    type: "income",
    title: incomeTitle.value,
    amount: amountNumber,
  };
  ENTRY_LIST.push(incomeObj);

  updateUI();
  clearInput([incomeTitle, incomeAmount]);
});

incomeList?.addEventListener("click", deleteOrEdit);
expenseList?.addEventListener("click", deleteOrEdit);
allList?.addEventListener("click", deleteOrEdit);

// HELPER FUNCS
function deleteOrEdit(event) {
  const target = event.target;
  const action = target.id || target.closest("div")?.id;
  const entryEl = target.closest("li");

  if (!entryEl || !action) return;

  if (action === EDIT) {
    editEntry(entryEl);
  } else if (action === DELETE) {
    deleteEntry(entryEl);
  }
}

function deleteEntry(entry) {
  const index = parseInt(entry.id, 10);
  if (isNaN(index)) return;
  ENTRY_LIST.splice(index, 1);
  updateUI();
}

function editEntry(entry) {
  const index = parseInt(entry.id, 10);
  if (isNaN(index)) return;
  const ENTRY = ENTRY_LIST[index];

  if (ENTRY.type == "income") {
    incomeTitle.value = ENTRY.title;
    incomeAmount.value = ENTRY.amount;
  } else if (ENTRY.type == "expense") {
    expenseTitle.value = ENTRY.title;
    expenseAmount.value = ENTRY.amount;
  }
  deleteEntry(entry);
}

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, outcome));

  let sign = income >= outcome ? "$" : "-$";

  //UPDATE UI (usar template literals)
  balanceEl && (balanceEl.innerHTML = `<small>${sign}</small>${balance.toFixed(2)}`);
  outcomeTotalEl && (outcomeTotalEl.innerHTML = `<small>$</small>${outcome.toFixed(2)}`);
  incomeTotalEl && (incomeTotalEl.innerHTML = `<small>$</small>${income.toFixed(2)}`);

  clearElement([expenseList, incomeList, allList]);

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type == "expense") {
      showEntry(expenseList, entry.type, entry.title, entry.amount, index);
    } else if (entry.type == "income") {
      showEntry(incomeList, entry.type, entry.title, entry.amount, index);
    }
    showEntry(allList, entry.type, entry.title, entry.amount, index);
  });
  // se tiver função updateChart, mantém; senão comente/remova
  if (typeof updateChart === "function") updateChart(income, outcome);
  localStorage.setItem("entry_list", JSON.stringify(ENTRY_LIST));
}

function showEntry(list, type, title, amount, id) {
  if (!list) return;
  const entry = `<li id="${id}" class="${type}">
                    <div class="entry">${escapeHtml(title)} : $${amount.toFixed(2)}</div>
                    <div id="edit"></div>
                    <div id="delete"></div>
                  </li>`;
  const position = "afterbegin";
  list.insertAdjacentHTML(position, entry);
}

function clearElement(elements) {
  elements.forEach((element) => {
    if (element) element.innerHTML = "";
  });
}

function calculateTotal(type, list) {
  let sum = 0;
  list.forEach((entry) => {
    if (entry.type == type) {
      sum += Number(entry.amount) || 0;
    }
  });
  return sum;
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    if (input) input.value = "";
  });
}

function show(element) {
  if (element) element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    if (element) element.classList.add("hide");
  });
}

function active(element) {
  if (element) element.classList.add("focus");
}

function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("focus");
  });
}

// pequena função para evitar injeção de HTML nos títulos
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
