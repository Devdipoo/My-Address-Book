document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('form');
  const conData = document.querySelector('#data');
  const nameInput = document.querySelector('#name');
  const addInput = document.querySelector('#add');
  const telInput = document.querySelector('#tel');
  const emailInput = document.querySelector('#email');
  const urlInput = document.querySelector('#url');

//Business Logic
  let db;

  function ContactManager() {
    this.init();
  }

  ContactManager.prototype.init = function () {
    let request = window.indexedDB.open('contacts', 1);

    request.onerror = () => {
      console.log('Database failed to open');
    };

    request.onsuccess = () => {
      console.log('Database opened successfully');
      db = request.result;
      this.displayData();
    };

    request.onupgradeneeded = (e) => {
      let db = e.target.result;
      let objectStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });

      objectStore.createIndex('name', 'name', { unique: false });
      objectStore.createIndex('address', 'address', { unique: false });
      objectStore.createIndex('telephone', 'telephone', { unique: false });
      objectStore.createIndex('email', 'email', { unique: false });
      objectStore.createIndex('url', 'url', { unique: false });

      console.log('Database setup complete');
    };
  };

  ContactManager.prototype.addContact = function (contact) {
    let transaction = db.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');
    let request = objectStore.add(contact);

    request.onsuccess = () => {
      form.reset();
    };

    transaction.oncomplete = () => {
      console.log('Transaction completed: database modification finished.');
      this.displayData();
    };

    transaction.onerror = () => {
      console.log('Transaction not opened due to error');
    };
  };


//UI logic
  ContactManager.prototype.displayData = function () {
    while (conData.firstChild) {
      conData.removeChild(conData.firstChild);
    }

    let objectStore = db.transaction('contacts').objectStore('contacts');

    objectStore.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;

      if (cursor) {
        let tr = document.createElement('tr');
        let tdName = document.createElement('td');
        let tdAdd = document.createElement('td');
        let tdTel = document.createElement('td');
        let tdEmail = document.createElement('td');
        let tdUrl = document.createElement('td');

        tr.appendChild(tdName);
        tr.appendChild(tdAdd);
        tr.appendChild(tdTel);
        tr.appendChild(tdEmail);
        tr.appendChild(tdUrl);
        conData.appendChild(tr);

        tdName.textContent = cursor.value.name;
        tdAdd.textContent = cursor.value.address;
        tdTel.textContent = cursor.value.telephone;
        tdEmail.textContent = cursor.value.email;
        tdUrl.textContent = cursor.value.url;

        tr.setAttribute('data-contact-id', cursor.value.id);

        let deleteBtn = document.createElement('button');
        tr.appendChild(deleteBtn);
        deleteBtn.textContent = 'Delete';

        deleteBtn.onclick = () => {
          this.deleteItem(cursor.value.id);
        };

        cursor.continue();
      } else {
        if (!conData.firstChild) {
          let para = document.createElement('p');
          para.textContent = 'No contact stored.';
          conData.appendChild(para);
        }
        console.log('Contacts all displayed');
      }
    };
  };

  ContactManager.prototype.deleteItem = function (contactId) {
    let transaction = db.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');
    let request = objectStore.delete(contactId);

    transaction.oncomplete = () => {
      document.querySelector(`[data-contact-id="${contactId}"]`).remove();
      console.log('Contact ' + contactId + ' deleted.');

      if (!conData.firstChild) {
        let para = document.createElement('p');
        para.textContent = 'No contacts stored.';
        conData.appendChild(para);
      }
    };
  };

  // let contactManager = new ContactManager();

  form.onsubmit = (e) => {
    e.preventDefault();
    let newItem = {
      name: nameInput.value,
      address: addInput.value,
      telephone: telInput.value,
      email: emailInput.value,
      url: urlInput.value
    };
    contactManager.addContact(newItem);
  };
});
