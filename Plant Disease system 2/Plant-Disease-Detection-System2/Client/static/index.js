window.addEventListener('DOMContentLoaded', function() {
    const previewImage = document.getElementById('preview');
    const imageUpload = document.getElementById('imageUpload'); 

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', function() {
                previewImage.src = reader.result;
            });
            reader.readAsDataURL(file);
        }
        document.getElementById('plantName').innerText = '';
        document.getElementById('diseaseName').innerText = '';
        document.getElementById('desc').innerText = '';
    });

    const el = document.getElementById('submit');
    if (el) {
        console.log("Submit button clicked");
        el.addEventListener('click', postImg);
    }  
});

async function postImg() {
    console.log("Post Image function triggered"); 
    const uploadedImage = document.getElementById('imageUpload').files[0];
    const formData = new FormData();
    formData.append('formIMAGE', uploadedImage);
    
    if (uploadedImage) {  
        const response = await fetch("http://127.0.0.1:5000/predict", {     
            method: "POST",
            body: formData
        });

        console.log(response);

        if (response.ok) {
            const result = await response.json();
            document.getElementById('plantName').innerText = `Plant Name: ${result.plantName}`;
            document.getElementById('diseaseName').innerText = `Disease Name: ${result.disease}`;
            document.getElementById('desc').innerText = `Information: ${result.diseaseDesc}`;
        } else {
            console.error("Error:", response.statusText);
        }
    } else {
        console.log("Image not uploaded");
        return;
    }
}
