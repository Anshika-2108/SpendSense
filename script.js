// ========================================
// SpendSense - Dashboard JavaScript
// ========================================


// Get saved transactions
let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


// Get saved budget
let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


// ========================================
// HTML ELEMENTS
// ========================================

const form =
    document.getElementById("transactionForm");

const transactionList =
    document.getElementById("transactionList");

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expenseElement =
    document.getElementById("expenses");

const searchInput =
    document.getElementById("search");

const budgetInput =
    document.getElementById("budgetInput");

const saveBudgetButton =
    document.getElementById("saveBudget");

const budgetProgress =
    document.getElementById("budgetProgress");

const budgetText =
    document.getElementById("budgetText");

const savingsGoal =
    document.getElementById("savingsGoal");

const savingsMonths =
    document.getElementById("savingsMonths");

const calculateSavingsButton =
    document.getElementById("calculateSavings");

const savingsResult =
    document.getElementById("savingsResult");


// Chart
let expenseChart = null;


// ========================================
// ADD TRANSACTION
// ========================================

form.addEventListener("submit", function(event) {

    event.preventDefault();


    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;


    if (!description || amount <= 0) {

        alert("Please enter a valid description and amount.");

        return;
    }


    const transaction = {

        id: Date.now(),

        description: description,

        amount: amount,

        type: type,

        category: category,

        date: new Date().toISOString()

    };


    transactions.push(transaction);


    saveTransactions();


    form.reset();


    updateDashboard();

});


// ========================================
// SAVE TRANSACTIONS
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    let totalIncome = 0;

    let totalExpenses = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            totalIncome += Number(transaction.amount);

        }

        else {

            totalExpenses += Number(transaction.amount);

        }

    });


    const balance =
        totalIncome - totalExpenses;


    // Main cards

    incomeElement.textContent =
        "₹" + totalIncome.toLocaleString("en-IN");


    expenseElement.textContent =
        "₹" + totalExpenses.toLocaleString("en-IN");


    balanceElement.textContent =
        "₹" + balance.toLocaleString("en-IN");


    // At a glance

    const glanceIncome =
        document.getElementById("glanceIncome");

    const glanceExpense =
        document.getElementById("glanceExpense");

    const glanceBalance =
        document.getElementById("glanceBalance");


    if (glanceIncome) {

        glanceIncome.textContent =
            "₹" + totalIncome.toLocaleString("en-IN");

    }


    if (glanceExpense) {

        glanceExpense.textContent =
            "₹" + totalExpenses.toLocaleString("en-IN");

    }


    if (glanceBalance) {

        glanceBalance.textContent =
            "₹" + balance.toLocaleString("en-IN");

    }


    displayTransactions();

    updateBudget(totalExpenses);

    updateChart();

}


// ========================================
// DISPLAY TRANSACTIONS
// ========================================

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        searchInput.value.toLowerCase().trim();


    const filteredTransactions =
        transactions.filter(function(transaction) {

            return (

                transaction.description
                    .toLowerCase()
                    .includes(searchText)

                ||

                transaction.category
                    .toLowerCase()
                    .includes(searchText)

            );

        });


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =

            '<p class="empty-message">' +

            (
                transactions.length === 0

                    ? "No transactions yet."

                    : "No matching transactions found."

            )

            +

            "</p>";

        return;

    }


    filteredTransactions
        .slice()
        .reverse()
        .forEach(function(transaction) {


            const item =
                document.createElement("div");


            item.className =
                "transaction";


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            const colorClass =
                transaction.type === "income"
                    ? "income"
                    : "expense";


            const date =
                new Date(transaction.date)
                    .toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    );


            item.innerHTML = `

                <div class="transaction-info">

                    <h3>
                        ${transaction.description}
                    </h3>

                    <p>
                        ${transaction.category}
                        •
                        ${date}
                    </p>

                </div>


                <div>

                    <strong class="${colorClass}">

                        ${sign}₹${Number(
                            transaction.amount
                        ).toLocaleString("en-IN")}

                    </strong>

                    <br>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            transactionList.appendChild(item);

        });

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    displayTransactions
);


// ========================================
// DELETE TRANSACTION
// ========================================

function deleteTransaction(id) {

    transactions =
        transactions.filter(function(transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    updateDashboard();

}


// ========================================
// BUDGET
// ========================================

if (monthlyBudget > 0) {

    budgetInput.value =
        monthlyBudget;

}


saveBudgetButton.addEventListener(
    "click",
    function() {


        const amount =
            Number(budgetInput.value);


        if (amount <= 0) {

            alert("Please enter a valid budget.");

            return;

        }


        monthlyBudget =
            amount;


        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        updateDashboard();


        alert("Budget saved successfully! 🎯");

    }
);


// ========================================
// UPDATE BUDGET
// ========================================

function updateBudget(totalExpenses) {


    if (monthlyBudget <= 0) {

        budgetProgress.style.width = "0%";

        budgetText.textContent =
            "Set a monthly budget to start tracking.";

        return;

    }


    const percentage =
        (totalExpenses / monthlyBudget) * 100;


    const progress =
        Math.min(percentage, 100);


    budgetProgress.style.width =
        progress + "%";


    const remaining =
        monthlyBudget - totalExpenses;


    if (remaining < 0) {

        budgetText.textContent =

            "⚠️ You exceeded your budget by ₹" +

            Math.abs(remaining)
                .toLocaleString("en-IN");

    }

    else {

        budgetText.textContent =

            "₹" +

            remaining.toLocaleString("en-IN") +

            " remaining • " +

            percentage.toFixed(1) +

            "% used";

    }

}


// ========================================
// SAVINGS CALCULATOR
// ========================================

calculateSavingsButton.addEventListener(
    "click",
    function() {


        const goal =
            Number(savingsGoal.value);


        const months =
            Number(savingsMonths.value);


        if (goal <= 0 || months <= 0) {

            savingsResult.textContent =
                "Please enter a valid goal and number of months.";

            return;

        }


        const monthlyAmount =
            Math.ceil(goal / months);


        savingsResult.textContent =

            "🌱 You need to save approximately ₹" +

            monthlyAmount.toLocaleString("en-IN") +

            " every month to reach ₹" +

            goal.toLocaleString("en-IN") +

            " in " +

            months +

            " months.";

    }
);


// ========================================
// CHART
// ========================================

function updateChart() {


    const categoryTotals = {};


    transactions.forEach(function(transaction) {


        if (transaction.type !== "expense") {

            return;

        }


        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }


        categoryTotals[transaction.category] +=
            Number(transaction.amount);

    });


    const categories =
        Object.keys(categoryTotals);


    const amounts =
        Object.values(categoryTotals);


    const canvas =
        document.getElementById("expenseChart");


    if (!canvas) {

        return;

    }


    if (expenseChart) {

        expenseChart.destroy();

    }


    if (categories.length === 0) {

        return;

    }


    expenseChart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: categories,

                datasets: [

                    {

                        data: amounts

                    }

                ]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });

}


// ========================================
// START
// ========================================

updateDashboard();
