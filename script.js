let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


// ===============================
// Get HTML Elements
// ===============================

const form =
    document.getElementById("transactionForm");

const transactionList =
    document.getElementById("transactionList");

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expenseElement =
    document.getElementById("expense");


// Budget elements

const budgetAmountInput =
    document.getElementById("budgetAmount");

const saveBudgetButton =
    document.getElementById("saveBudgetButton");

const budgetDisplay =
    document.getElementById("budgetDisplay");

const budgetSpent =
    document.getElementById("budgetSpent");

const budgetRemaining =
    document.getElementById("budgetRemaining");

const budgetProgress =
    document.getElementById("budgetProgress");

const budgetPercentage =
    document.getElementById("budgetPercentage");

const budgetMessage =
    document.getElementById("budgetMessage");


// Search and filter

const searchInput =
    document.getElementById("searchInput");

const filterType =
    document.getElementById("filterType");


// Monthly summary

const monthlyIncome =
    document.getElementById("monthlyIncome");

const monthlyExpense =
    document.getElementById("monthlyExpense");

const monthlySavings =
    document.getElementById("monthlySavings");

const topCategory =
    document.getElementById("topCategory");

const monthlyInsight =
    document.getElementById("monthlyInsight");


// Chart

let expenseChart;


// ===============================
// Set Today's Date
// ===============================

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


// ===============================
// Load Saved Budget
// ===============================

if (monthlyBudget > 0) {

    budgetAmountInput.value =
        monthlyBudget;

}


// ===============================
// Save Budget
// ===============================

saveBudgetButton.addEventListener(
    "click",
    function () {

        const enteredBudget =
            Number(budgetAmountInput.value);


        if (!enteredBudget || enteredBudget <= 0) {

            alert(
                "Please enter a valid budget amount."
            );

            return;
        }


        monthlyBudget =
            enteredBudget;


        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        updateBudget();


        alert(
            "Budget saved successfully!"
        );

    }
);


// ===============================
// Add Transaction
// ===============================

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const description =
            document.getElementById(
                "description"
            ).value;


        const amount =
            Number(
                document.getElementById(
                    "amount"
                ).value
            );


        const type =
            document.getElementById(
                "type"
            ).value;


        const category =
            document.getElementById(
                "category"
            ).value;


        const date =
            document.getElementById(
                "date"
            ).value;


        const transaction = {

            id: Date.now(),

            description:
                description,

            amount:
                amount,

            type:
                type,

            category:
                category,

            date:
                date

        };


        transactions.push(
            transaction
        );


        saveTransactions();


        form.reset();


        document.getElementById(
            "date"
        ).value =
            new Date()
                .toISOString()
                .split("T")[0];


        updateWebsite();

    }
);


// ===============================
// Update Website
// ===============================

function updateWebsite() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    transaction.amount;

            } else {

                totalExpense +=
                    transaction.amount;

            }

        }
    );


    const balance =
        totalIncome - totalExpense;


    incomeElement.textContent =
        "₹" +
        totalIncome.toLocaleString(
            "en-IN"
        );


    expenseElement.textContent =
        "₹" +
        totalExpense.toLocaleString(
            "en-IN"
        );


    balanceElement.textContent =
        "₹" +
        balance.toLocaleString(
            "en-IN"
        );


    displayTransactions();

    updateChart();

    updateBudget();

    updateMonthlySummary();

}


// ===============================
// Display Transactions
// ===============================

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedType =
        filterType.value;


    const filteredTransactions =
        transactions.filter(
            function (transaction) {


                const matchesSearch =

                    transaction.description
                        .toLowerCase()
                        .includes(
                            searchText
                        )

                    ||

                    transaction.category
                        .toLowerCase()
                        .includes(
                            searchText
                        );


                const matchesType =

                    selectedType ===
                    "all"

                    ||

                    transaction.type ===
                    selectedType;


                return (
                    matchesSearch &&
                    matchesType
                );

            }
        );


    if (
        filteredTransactions.length === 0
    ) {

        transactionList.innerHTML =

            '<p class="empty-message">' +

            (
                transactions.length === 0

                ? "No transactions yet."

                : "No matching transactions found."

            ) +

            "</p>";

        return;
    }


    filteredTransactions.forEach(
        function (transaction) {


            const transactionElement =
                document.createElement(
                    "div"
                );


            transactionElement.className =
                "transaction";


            const sign =
                transaction.type ===
                "income"
                    ? "+"
                    : "-";


            let formattedDate =
                "No date";


            if (transaction.date) {

                const dateObject =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );


                formattedDate =
                    dateObject.toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    );

            }


            transactionElement.innerHTML = `

                <div class="transaction-info">

                    <h3>
                        ${transaction.description}
                    </h3>

                    <p>
                        ${transaction.category}
                        •
                        ${formattedDate}
                    </p>

                </div>


                <div>

                    <strong
                        class="${transaction.type}"
                    >

                        ${sign}₹${transaction.amount.toLocaleString("en-IN")}

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


            transactionList.appendChild(
                transactionElement
            );

        }
    );

}


// ===============================
// Search
// ===============================

searchInput.addEventListener(
    "input",
    function () {

        displayTransactions();

    }
);


// ===============================
// Filter
// ===============================

filterType.addEventListener(
    "change",
    function () {

        displayTransactions();

    }
);


// ===============================
// Spending Chart
// ===============================

function updateChart() {

    const categoryTotals = {};


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type ===
                "expense"
            ) {

                if (
                    !categoryTotals[
                        transaction.category
                    ]
                ) {

                    categoryTotals[
                        transaction.category
                    ] = 0;

                }


                categoryTotals[
                    transaction.category
                ] +=
                    transaction.amount;

            }

        }
    );


    const categories =
        Object.keys(
            categoryTotals
        );


    const amounts =
        Object.values(
            categoryTotals
        );


    const chartCanvas =
        document.getElementById(
            "expenseChart"
        );


    if (!chartCanvas) {

        return;

    }


    if (expenseChart) {

        expenseChart.destroy();

    }


    if (categories.length === 0) {

        return;

    }


    expenseChart =
        new Chart(
            chartCanvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        categories,

                    datasets: [

                        {

                            label:
                                "Expenses",

                            data:
                                amounts

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ===============================
// Monthly Budget
// ===============================

function updateBudget() {

    budgetDisplay.textContent =
        "₹" +
        monthlyBudget.toLocaleString(
            "en-IN"
        );


    if (monthlyBudget <= 0) {

        budgetSpent.textContent =
            "₹0";


        budgetRemaining.textContent =
            "₹0";


        budgetProgress.style.width =
            "0%";


        budgetPercentage.textContent =
            "0% used";


        budgetMessage.textContent =
            "Set a monthly budget to start tracking your expenses.";


        return;

    }


    const today =
        new Date();


    const currentMonth =
        today.getMonth();


    const currentYear =
        today.getFullYear();


    let currentMonthExpense = 0;


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type ===
                    "expense"
                &&
                transaction.date
            ) {

                const transactionDate =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );


                if (

                    transactionDate.getMonth() ===
                        currentMonth

                    &&

                    transactionDate.getFullYear() ===
                        currentYear

                ) {

                    currentMonthExpense +=
                        transaction.amount;

                }

            }

        }
    );


    const remaining =
        monthlyBudget -
        currentMonthExpense;


    const percentage =
        (
            currentMonthExpense /
            monthlyBudget
        ) * 100;


    const progressWidth =
        Math.min(
            percentage,
            100
        );


    budgetSpent.textContent =
        "₹" +
        currentMonthExpense.toLocaleString(
            "en-IN"
        );


    budgetRemaining.textContent =
        "₹" +
        Math.max(
            remaining,
            0
        ).toLocaleString(
            "en-IN"
        );


    budgetProgress.style.width =
        progressWidth + "%";


    budgetPercentage.textContent =
        percentage.toFixed(1) +
        "% used";


    if (percentage >= 100) {

        budgetMessage.textContent =
            "⚠️ You have reached your monthly budget.";

    }

    else if (percentage >= 80) {

        budgetMessage.textContent =
            "⚠️ You're getting close to your monthly budget.";

    }

    else {

        budgetMessage.textContent =
            "✅ You're within your monthly budget.";

    }

}


// ===============================
// Monthly Spending Summary
// ===============================

function updateMonthlySummary() {

    const today =
        new Date();


    const currentMonth =
        today.getMonth();


    const currentYear =
        today.getFullYear();


    let income = 0;

    let expenses = 0;


    const categoryTotals = {};


    transactions.forEach(
        function (transaction) {

            if (!transaction.date) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            const isCurrentMonth =

                transactionDate.getMonth() ===
                    currentMonth

                &&

                transactionDate.getFullYear() ===
                    currentYear;


            if (!isCurrentMonth) {
                return;
            }


            if (
                transaction.type ===
                "income"
            ) {

                income +=
                    transaction.amount;

            }


            else if (
                transaction.type ===
                "expense"
            ) {

                expenses +=
                    transaction.amount;


                if (
                    !categoryTotals[
                        transaction.category
                    ]
                ) {

                    categoryTotals[
                        transaction.category
                    ] = 0;

                }


                categoryTotals[
                    transaction.category
                ] +=
                    transaction.amount;

            }

        }
    );


    const savings =
        income - expenses;


    monthlyIncome.textContent =
        "₹" +
        income.toLocaleString(
            "en-IN"
        );


    monthlyExpense.textContent =
        "₹" +
        expenses.toLocaleString(
            "en-IN"
        );


    monthlySavings.textContent =
        "₹" +
        savings.toLocaleString(
            "en-IN"
        );


    // Find highest spending category

    const categories =
        Object.keys(
            categoryTotals
        );


    if (categories.length === 0) {

        topCategory.textContent =
            "None";

    }

    else {

        let highestCategory =
            categories[0];


        categories.forEach(
            function (category) {

                if (
                    categoryTotals[category] >
                    categoryTotals[highestCategory]
                ) {

                    highestCategory =
                        category;

                }

            }
        );


        topCategory.textContent =
            highestCategory;

    }


    // Monthly insight

    if (
        income === 0 &&
        expenses === 0
    ) {

        monthlyInsight.textContent =
            "💡 Add some transactions to see your monthly spending insight.";

    }

    else if (
        savings > 0
    ) {

        monthlyInsight.textContent =
            "💡 You currently have more income than expenses this month.";

    }

    else if (
        savings === 0
    ) {

        monthlyInsight.textContent =
            "💡 Your income and expenses are currently equal this month.";

    }

    else {

        monthlyInsight.textContent =
            "💡 Your expenses are currently higher than your income this month.";

    }

}


// ===============================
// Delete Transaction
// ===============================

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            function (transaction) {

                return (
                    transaction.id !== id
                );

            }
        );


    saveTransactions();

    updateWebsite();

}


// ===============================
// Save Transactions
// ===============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(
            transactions
        )
    );

}


// ===============================
// Savings Calculator
// ===============================

const calculateSavingsButton =
    document.getElementById(
        "calculateSavings"
    );


calculateSavingsButton.addEventListener(
    "click",
    function () {


        const goal =
            Number(
                document.getElementById(
                    "savingsGoal"
                ).value
            );


        const months =
            Number(
                document.getElementById(
                    "savingsMonths"
                ).value
            );


        const result =
            document.getElementById(
                "savingsResult"
            );


        if (
            goal <= 0 ||
            months <= 0
        ) {

            result.textContent =
                "Please enter a valid savings goal.";

            return;

        }


        const monthlySavingsAmount =
            Math.ceil(
                goal / months
            );


        result.textContent =

            "To reach ₹" +

            goal.toLocaleString(
                "en-IN"
            ) +

            " in " +

            months +

            " months, save approximately ₹" +

            monthlySavingsAmount.toLocaleString(
                "en-IN"
            ) +

            " per month.";

    }
);


// ===============================
// Start Website
// ===============================

updateWebsite();