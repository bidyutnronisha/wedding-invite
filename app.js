const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbys-Hp4gLMWIX6ytMaykpmH7tzysTXPkShhGzXhE4yz2Tt6KJYY-d0jJo2ggi9ZH2s-0w/exec"; // paste from deployment

// --- Venue Slideshow ---
const venueImages = ["venue1.jpg", "venue2.jpg", "venue3.jpg"];
let idx = 0;
function runSlideshow() {
  const img = document.getElementById("venue-img");
  setInterval(() => {
    idx = (idx + 1) % venueImages.length;
    img.src = venueImages[idx];
  }, 3000);
}

// --- Upload Handler ---
document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("file-input");
  const eventName = document.getElementById("event").value;
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file");
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Content = reader.result.split(",")[1];

    const body = new URLSearchParams({
      eventName,
      fileName: file.name,
      mimeType: file.type,
      fileContent: base64Content,
    });

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Uploaded successfully!\n" + data.url);
        fileInput.value = "";
      } else {
        alert("❌ Upload failed: " + data.error);
      }
    } catch (err) {
      alert("❌ Error uploading: " + err.message);
    }
  };
  reader.readAsDataURL(file);
});

// --- Init ---
document.addEventListener("DOMContentLoaded", runSlideshow);
