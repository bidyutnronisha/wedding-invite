const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbys-Hp4gLMWIX6ytMaykpmH7tzysTXPkShhGzXhE4yz2Tt6KJYY-d0jJo2ggi9ZH2s-0w/exec"; // Replace with Apps Script link

// Generic Slideshow function
function runSlideshow(slideshowId, interval = 3000) {
  const slideshow = document.getElementById(slideshowId);
  if (!slideshow) return;

  const images = slideshow.getElementsByTagName("img");
  let idx = 0;

  images[idx].classList.add("active");

  setInterval(() => {
    images[idx].classList.remove("active");
    idx = (idx + 1) % images.length;
    images[idx].classList.add("active");
  }, interval);
}

// Upload handler with progress
document.getElementById("upload-form").addEventListener("submit", (e) => {
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

  const formData = new FormData();
  formData.append("eventName", eventName);
  formData.append("file", file);

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
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          progressText.textContent = "✅ Upload complete!";
          setTimeout(() => {
            progressBar.style.display = "none";
            progressText.textContent = "";
          }, 2000);
          loadGallery();
        } else {
          progressText.textContent = "❌ Upload failed.";
        }
      } catch {
        progressText.textContent = "❌ Server error.";
      }
    }
  };

  xhr.onerror = () => {
    progressText.textContent = "❌ Network error.";
  };

  xhr.send(formData);
});

// Load Gallery (from Drive)
async function loadGallery() {
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=listEvents");
    const data = await res.json();

    if (!data.success) {
      document.getElementById("gallery-container").innerHTML = "<p>❌ Failed to load gallery.</p>";
      return;
    }

    const container = document.getElementById("gallery-container");
    container.innerHTML = "";

    data.events.forEach(ev => {
      const section = document.createElement("div");
      section.style.marginBottom = "40px";

      const title = document.createElement("h3");
      const link = document.createElement("a");
      link.href = ev.url;
      link.target = "_blank";
      link.textContent = ev.name;
      title.appendChild(link);

      section.appendChild(title);

      // Slideshow container for gallery images
      const slideshow = document.createElement("div");
      slideshow.className = "slideshow";

      ev.images.forEach((url, i) => {
        const img = document.createElement("img");
        img.src = url;
        if (i === 0) img.classList.add("active");
        slideshow.appendChild(img);
      });

      section.appendChild(slideshow);
      container.appendChild(section);

      // Start slideshow
      setTimeout(() => runSlideshow(slideshow.id = "gallery-" + ev.name, 4000), 0);
    });
  } catch (err) {
    console.error("Gallery load error:", err);
    document.getElementById("gallery-container").innerHTML = "<p>❌ Error loading gallery.</p>";
  }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  runSlideshow("venue-slideshow", 3000);
  runSlideshow("party-slideshow", 3000);
  loadGallery();
});
