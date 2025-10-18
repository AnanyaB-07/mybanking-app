let balance = 0;
let history = [];
let spendingData = [];

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

function generateQR() {
  const amount = document.getElementById("qrAmount").value;
  const qrData = `deposit:${amount}`;
  QRCode.toCanvas(document.getElementById("qrCode"), qrData);
}

function startScanner() {
  const qrScanner = new Html5Qrcode("reader");
  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      const parts = decodedText.split(":");
      if (parts[0] === "deposit") {
        const amount = parseFloat(parts[1]);
        balance += amount;
        history.push(`QR deposit ₹${amount}`);
        updateBalance();
        updateHistory();
        qrScanner.stop();
      } else if (parts[0] === "pay") {
        const recipient = parts[1];
        const amount = parseFloat(parts[2]);
        const confirmPayment = confirm(`Pay ₹${amount} to ${recipient}?`);
        if (confirmPayment) {
          if (amount > balance) {
            alert("Insufficient funds!");
          } else {
            balance -= amount;
            const transaction = {
              type: "payment",
              recipient,
              amount,
              timestamp: new Date().toLocaleString()
            };
            history.push(`Paid ₹${amount} to ${recipient}`);
            spendingData.push({ recipient, amount });
            saveTransaction(transaction);
            updateBalance();
            updateHistory();
            updateRecipientLog(transaction);
            updateChart();
            alert(`Payment of ₹${amount} to ${recipient} successful!`);
          }
        }
        qrScanner.stop();
      }
    },
    (errorMessage) => {
      console.warn("QR scan error:", errorMessage);
    }
  );
}

function updateRecipientLog(transaction) {
  const log = document.getElementById("recipientLog");
  const li = document.createElement("li");
  li.innerText = `${transaction.timestamp}: Paid ₹${transaction.amount} to ${transaction.recipient}`;
  log.appendChild(li);
}

function saveTransaction(transaction) {
  let stored = JSON.parse(localStorage.getItem("transactions")) || [];
  stored.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(stored));
}

function loadTransactions() {
  const stored = JSON.parse(localStorage.getItem("transactions")) || [];
  stored.forEach(tx => {
    history.push(`Paid ₹${tx.amount} to ${tx.recipient}`);
    updateRecipientLog(tx);
    spendingData.push({ recipient: tx.recipient, amount: tx.amount });
  });
  updateHistory();
}

function updateChart() {
  const labels = spendingData.map(tx => tx.recipient);
  const data = spendingData.map(tx => tx.amount);
  const ctx = document.getElementById("spendingChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount Paid (₹)',
        data: data,
        backgroundColor: '#0078D4'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function loadSpendingData() {
  const stored = JSON.parse(localStorage.getItem("spendingData")) || [];
  spendingData = stored;
  updateChart();
}

function saveSpendingData() {
  localStorage.setItem("spendingData", JSON.stringify(spendingData));
}

window.onload = () => {
  loadTransactions();
  loadSpendingData();
  updateBalance();
  QRCode.toCanvas(document.getElementById("qrCode"), "deposit:100", function (error) {
    if (error) console.error(error);
  });
};
