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
        // Fetch and display user statistics (focus time, attempts, avg score, best score)
        fetchUserStats(backendUserData.id).catch(err => console.error(err));
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

// Fetch user statistics from backend and update the DOM
async function fetchUserStats(userId) {
  try {
    const res = await fetch(`/api/user/${userId}/stats`);
    const data = await res.json();
    if (!data.ok) {
      console.warn('No stats available for user', data.error);
      return null;
    }

    // Prefer structured user_stats row if present
    const stats = data.stats || null;
    const quizSummary = data.quiz_summary || [];

    // Compute fallback aggregated values if stats row missing
    let totalTimeSeconds = 0;
    let totalAttempts = 0;
    let avgScore = 0;
    let bestScore = 0;

    if (stats) {
      totalTimeSeconds = stats.total_time_spent_seconds || 0;
      totalAttempts = stats.total_attempts || 0;
      avgScore = stats.average_score != null ? Number(stats.average_score) : 0;
      bestScore = stats.best_score != null ? Number(stats.best_score) : 0;
    } else if (quizSummary.length > 0) {
      // aggregate across quiz types
      let sumAttempts = 0;
      let weightedAvgSum = 0; // avg * attempts
      let maxScore = 0;
      for (const q of quizSummary) {
        const attempts = Number(q.total_attempts) || 0;
        const a = Number(q.avg_score) || 0;
        const b = Number(q.best_score) || 0;
        sumAttempts += attempts;
        weightedAvgSum += a * attempts;
        if (b > maxScore) maxScore = b;
      }
      totalAttempts = sumAttempts;
      avgScore = sumAttempts > 0 ? (weightedAvgSum / sumAttempts) : 0;
      bestScore = maxScore;
      totalTimeSeconds = 0; // no reliable time info in summary
    }

    // Convert totalTimeSeconds to minutes (rounded)
    const totalMinutes = Math.round((totalTimeSeconds || 0) / 60);

    // Update DOM — note some element ids in the HTML include spaces, so use attribute selector
    const focusEl = document.getElementById('focus-time');
    const attemptsEl = document.querySelector('[id="Attempts taken"]') || document.getElementById('Attempts taken');
    const avgEl = document.getElementById('average-score');
    const bestEl = document.querySelector('[id="Best score"]') || document.getElementById('Best score');

    if (focusEl) focusEl.textContent = totalMinutes;
    if (attemptsEl) attemptsEl.textContent = totalAttempts;
    if (avgEl) avgEl.textContent = Number(avgScore).toFixed(2);
    if (bestEl) bestEl.textContent = Number(bestScore).toFixed(2);

    return { totalMinutes, totalAttempts, avgScore, bestScore };
  } catch (err) {
    console.error('Error fetching user stats:', err);
    return null;
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
