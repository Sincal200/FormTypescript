const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const files = document.getElementById("files");


    if (files.files.length > 2) {
        alert("You can only upload a maximum of 2 files");
        return;
    }

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("email", email.value);

    for(let i =0; i < 2; i++) {
        formData.append("files", files.files[i]);
    }

    console.log(...formData)

    fetch('http://127.0.0.1:4000/upload', {
        method: 'POST',
        body: formData, 
    })
    .then(res => res.json())
    .then(data => console.log(data));
})