document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#one-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#one-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const element = document.createElement('div');
        element.innerHTML = `${email.sender} : ${email.subject} <br> ${email.timestamp} <hr>`;
        element.addEventListener('click', function() {
            console.log('This element has been clicked!');
            each_email(email.id, mailbox);
        });
        if (email.read == true) {
          element.style.backgroundColor = 'silver';
        }
        document.querySelector('#emails-view').append(element);
      })
  });
}

function send_email(event) {
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch("/emails", {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    load_mailbox('sent')
  })
  .catch((error) => console.log(error));
}

function each_email(id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#one-email-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      document.querySelector('#sender').value = `${email.sender}`;
      document.querySelector('#recipients').value = `${email.recipients}`;
      document.querySelector('h1').innerHTML = `Subject: ${email.subject}`
      document.querySelector('h5').innerHTML = `Timestamp: ${email.timestamp}`
      document.querySelector('p').innerHTML = `${email.body}`
      console.log(email);
      
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
  });

  const archive = document.querySelector('#archive')
  if (mailbox === 'inbox') {
    archive.style.display = 'inline';
    archive.style.float = 'right';
    archive.innerHTML = 'Archive';
    archive.addEventListener('click', () => {
      console.log("culo se")
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })    
      .then(load_mailbox('inbox'));  
    });
  } else if (mailbox === 'archive') {
    archive.style.display = 'inline';
    archive.style.float = 'right';
    archive.innerHTML = 'Unarchive';
    archive.addEventListener('click', () => {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
      .then(load_mailbox('inbox'));  
    });
  } else {
    archive.style.display = 'none';
  }
}