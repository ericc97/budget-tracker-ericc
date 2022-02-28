// utilize indexDB to hold offline queries until connection is restored

let db;

// make request to act as event listener for the database
const request = indexedDB.open('budgetapp', 1);

// if db version is changed
request.onupgradeneeded = (e) => {
    // save db ref
    db = e.target.result;

    // create an object to store pk
    db.createObjectStore('new_transaction', { autoIncrement: true });
};


// upon successful connection
request.onsuccess = (e) => {
    db = e.target.result;

    // check to see if app has connection, if yes run uploadTransaction() to update database
    if (navigator.onLine){
        uploadTransaction();
    }
};

request.onerror = (e) => {
    console.log(e.target.errorCode)
};

// run if new transaction is submitted offline
function saveRecord(record) {
    // create new transaction with db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to store
    transactionObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    // if getAll(); = successful
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('api/transaction', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {'Content-Type': 'application/json'},
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    throw new Error(data);
                }

                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_transaction');


                // clear items in objectStore
                transactionObjectStore.clear();

                alert('Saved transactions have now been uploaded');

                location.reload();
            })
            .catch(err => {
                console.log(err)
            });
        }
    }
}