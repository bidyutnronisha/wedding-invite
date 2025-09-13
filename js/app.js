const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbys-Hp4gLMWIX6ytMaykpmH7tzysTXPkShhGzXhE4yz2Tt6KJYY-d0jJo2ggi9ZH2s-0w/exec"; // replace with your deployment

// --- Venue Slideshow ---
const venueImages = ["images/venue1.jpg", "images/venue2.jpg", "images/venue3.jpg"];
let idx = 0;
function runSlideshow() {
  const img = document.getElementById("venue-img");
  setInterval(() => {
    idx = (idx + 1) % venueImages.length;
    img.src = venueImages[idx];
  }, 3000);
}

// --- Upload Handler with Progress ---
document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("file-input");
  const eventName = document.getElementById("event").value;
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file");
    return;
  }

  const progressBar = document.getElementById("upload-progress");
  const progressText = document.getElementById("progress-text");
  progressBar.style.display = "block";
  progressBar.value = 0;
  progressText.textContent = "Starting upload...";

  const reader = new FileReader();
  reader.onload = () => {
    const base64Content = reader.result.split(",")[1];
    const body = new URLSearchParams({
      eventName,
      fileName: file.name,
      mimeType: file.type,
      fileContent: base64Content,
    });

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open("POST", APPS_SCRIPT_URL, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressBar.value = percent;
        progressText.textContent = `Uploading: ${percent}%`;
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          progressText.textContent = "✅ Upload complete!";
          alert("Uploaded successfully!\n" + response.url);
          fileInput.value = "";
        } else {
          progressText.textContent = "❌ Upload failed.";
          alert("Upload failed: " + response.error);
        }
      } else {
        progressText.textContent = "❌ Server error.";
        alert("Error: " + xhr.status);
      }
    };

    xhr.onerror = () => {
      progressText.textContent = "❌ Network error.";
      alert("Upload failed due to network error.");
    };

    xhr.send(body);
  };

  reader.readAsDataURL(file);
});

// --- Init ---
document.addEventListener("DOMContentLoaded", runSlideshow);
