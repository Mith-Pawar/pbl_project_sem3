function setMood(mood) {
  localStorage.setItem("userMood", mood);
  document.querySelectorAll(".mood-options button").forEach(btn => {
    btn.classList.toggle("active", btn.textContent === mood);
  });
  showMood(mood);
}

function showMood(mood) {
  let display = document.getElementById("selectedMood");
  if (!display) {
    display = document.createElement("p");
    display.id = "selectedMood";
    document.querySelector(".mood-options").after(display);
  }
  display.textContent = `Today's mood: ${mood}`;
}

window.onload = () => {
  const savedMood = localStorage.getItem("userMood");
  if (savedMood) showMood(savedMood);
};
document.getElementById("logout-button").onclick = function() {
  window.location.href = "index.html";
}