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

// Fetch user data from backend
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/user/${userId}`);
    const data = await response.json();
    
    if (data.ok && data.user) {
      return data.user;
    } else {
      console.error('Failed to fetch user data:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Check if user is logged in and update UI accordingly
async function checkLoginState() {
  const user = localStorage.getItem('user');
  const logoutButton = document.getElementById('logout-button');
  
  if (user) {
    // User is logged in - show logout button
    if (logoutButton) {
      logoutButton.style.display = 'block';
    }
    
    try {
      const userData = JSON.parse(user);
      
      // Fetch fresh user data from backend
      const backendUserData = await fetchUserData(userData.id);
      
      if (backendUserData) {
        // Populate read-only fields with backend data
        document.getElementById('username').value = backendUserData.name || '';
        document.getElementById('email').value = backendUserData.email || '';
        document.getElementById('age').value = backendUserData.age || '';
      } else {
        // Fallback to localStorage data if backend fetch fails
        document.getElementById('username').value = userData.name || userData.email || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('age').value = userData.age || '';
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  } else {
    // User is not logged in - hide logout button and clear fields
    if (logoutButton) {
      logoutButton.style.display = 'none';
    }
    
    // Clear all fields when not logged in
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('age').value = '';
  }
}

// Handle logout functionality
function handleLogout() {
  // Clear user data from localStorage
  localStorage.removeItem('user');
  
  // Redirect to home page
  window.location.href = "index.html";
}

// Handle home button click
function handleHome() {
  window.location.href = "index.html";
}

window.onload = async () => {
  const savedMood = localStorage.getItem("userMood");
  if (savedMood) showMood(savedMood);
  
  // Check login state and update UI
  await checkLoginState();
  
  // Add event listeners
  const logoutButton = document.getElementById("logout-button");
  const homeButton = document.getElementById("home-button");
  
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  if (homeButton) {
    homeButton.addEventListener('click', handleHome);
  }
};
  gsap.from("form", {
    opacity: 0,
    duration: 1,
    delay: 0.3,
    stagger: 1
  });
  gsap.from("form h2", {
    opacity: 0,
    duration: 1,
    delay: 0.3
  });
  gsap.from("form input", {
    opacity: 0,
    duration: 1,
    delay: 0.3,
    stagger: 0.2
  });
  
  gsap.from(".focusstats", {
    opacity: 0,
    duration: 1,
    delay: 0.3,
    stagger: 0.2
  });
  gsap.from(".focusstats h2", {
    opacity: 0,
    duration: 1,
    delay: 0.3
  }); 
  gsap.from(".focusstats p", {
    opacity: 0,
    duration: 1,  
    delay: 0.3,
    stagger: 0.2
  });
  gsap.from(".mood-tracker", {
    opacity: 0,
    duration: 1,
    delay: 0.3
  });
  gsap.from(".mood-tracker h2", {
    opacity: 0,
    duration: 1,  
    delay: 0.3
  });
  gsap.from(".mood-options", {
    opacity: 0,
    duration: 1,
    delay: 0.3,
    stagger: 0.2
  });

gsap.from(".motivation-section", {
    opacity: 0,
    duration: 1,
    delay: 0.3
});

gsap.from(".motivation-section h2", {
    opacity: 0,
    duration: 1,
    delay: 0.3
});

const SuggestionButton = document.getElementById('Suggestion');
if (SuggestionButton) {
  SuggestionButton.addEventListener('click', () => {
    window.location.href = 'suggestion.html';
  });
}
// Pehle buttons gayab rakho
gsap.set(".navigation-buttons button", { opacity: 0 });

// Fade-in animation with stagger
gsap.to(".navigation-buttons button", {
  opacity: 1,
  duration: 1,       // har button 1 second me fade-in
  ease: "power2.inOut",
  stagger: 0.3       // ek button ke baad 0.3s gap se next fade-in
});
