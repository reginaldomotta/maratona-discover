// Funcionalidades para o MODAL
const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        // fechar modal
        // remover a classe active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

// Salvar no browser
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

// Funcionalidades para as transações
const Transaction = {

    // Define o vetor transactions na variável all
    all: Storage.get(),

    // Adiciona a transação do vetor na tela
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    // Remove a transação do vetor na tela
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    // Efetua o cálculo da soma das entradas
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    // Efetua o cálculo da soma das despesas
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    // Efetua o cálculo do total
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Funcionalidades do Modelo de Objeto de Documento
const DOM = {

    // Define o objeto a ser manipulado
    transactionsContainer: document.querySelector('#data-table tbody'),

    // Adiciona a transação vazia
    addTransaction(transaction, index) {

        const tr = document.createElement('tr')

        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },

    // Preenche o HTML na transação vazia
    innerHTMLTransaction(transaction, index) {

        // condição para tipo de transação
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        // formata o valor
        const amount = Utils.formatCurrency(transaction.amount)

        // estrutura de preenchimento do HTML dentro da transação
        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    // Formata o balanço
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // Limpa as transações da tela
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Utilidades para formatar os valores
const Utils = {

    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {

        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

// Funcionalidades do Formulário
const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // Recebe os valores dos campos
    getValues() {

        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // Valida os campos
    validadeFields() {

        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {

            throw new Error("Por favor, preencha todos os campos!")

        }

    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    // Submit do botão salvar
    submit(event) {

        event.preventDefault()
        try {
            Form.validadeFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            swal(error.message)
            
        }
    }
}

// Inicializar a aplicação = App
const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()
