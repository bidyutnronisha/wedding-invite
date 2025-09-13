const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxIYc36dUB2_dPnyEIIpiIhjdW9f49XSbV1I0e7MBE8dTPslw5ADnd4FUm8vIMrgbPwiQ/exec"; // paste from deployment

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

      const imgRow = document.createElement("div");
      imgRow.style.display = "flex";
      imgRow.style.gap = "10px";
      ev.images.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.width = "150px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        imgRow.appendChild(img);
      });

      section.appendChild(imgRow);
      container.appendChild(section);
    });
  } catch (err) {
    console.error("Gallery load error:", err);
    document.getElementById("gallery-container").innerHTML = "<p>❌ Error loading gallery.</p>";
  }
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  runSlideshow();
  loadGallery();
});
