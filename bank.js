let balance = 0;
let history = [];

function createAccount() {
  const name = document.getElementById("username").value;
  balance = parseFloat(document.getElementById("initialBalance").value);
  document.getElementById("greeting").innerText = `Hello, ${name}!`;
  updateBalance();
}

function deposit() {
  const amount = parseFloat(document.getElementById("amount").value);
  balance += amount;
  history.push(`Deposited ₹${amount}`);
  updateBalance();
  updateHistory();
}

function withdraw() {
  const amount = parseFloat(document.getElementById("amount").value);
  if (amount > balance) {
    alert("Insufficient funds!");
    return;
  }
  balance -= amount;
  history.push(`Withdrew ₹${amount}`);
  updateBalance();
  updateHistory();
}

function updateBalance() {
  document.getElementById("balance").innerText = balance.toFixed(2);
}

function updateHistory() {
  const list = document.getElementById("history");
  list.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    list.appendChild(li);
  });
}
