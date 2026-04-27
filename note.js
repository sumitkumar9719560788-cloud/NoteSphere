// Notes App - JavaScript

// Data Storage
let notes = [];
let historyLog = [];

// ========================================
// LOGIN FUNCTIONALITY
// ========================================

function login() {
    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("password").value.trim();

    if (loginId && password) {
        // Hide login page, show app
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        // Update greeting
        const userGreeting = document.getElementById("userGreeting");
        userGreeting.textContent = `Hello, ${loginId}!`;

        // Log the activity
        addToHistory("User logged in successfully");

        // Clear form
        document.getElementById("loginId").value = "";
        document.getElementById("password").value = "";
    } else {
        // Show error with animation
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);

        alert("Please enter both Email/Mobile and Password");
    }
}

// Add shake animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        addToHistory("User logged out");

        // Clear app data
        document.getElementById("app").classList.add("hidden");
        document.getElementById("loginPage").classList.remove("hidden");

        // Reset notes and history for demo
        notes = [];
        historyLog = [];
        displayNotes();
        displayHistory();
    }
}

// ========================================
// TAB NAVIGATION
// ========================================

function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    // Remove active class from all nav items
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    // Show selected tab
    document.getElementById(tabId).classList.add("active");

    // Add active class to corresponding nav item
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navItem) {
        navItem.classList.add("active");
    }

    // Log tab switch
    const tabNames = {
        'home': 'Home',
        'profile': 'Profile',
        'history': 'History',
        'about': 'About'
    };
    addToHistory(`Navigated to ${tabNames[tabId] || tabId}`);
}

// ========================================
// NOTES FUNCTIONALITY
// ========================================

function addNote() {
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();
    const color = document.getElementById("noteColor").value;

    if (!title || !content) {
        alert("Please enter both title and content for your note");
        return;
    }

    // Create note object
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        color: color,
        time: new Date().toLocaleString()
    };

    // Add to notes array
    notes.unshift(note); // Add to beginning of array

    // Log the activity
    addToHistory(`Added note: "${title}"`);

    // Clear form
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    document.getElementById("noteColor").value = "#fff3cd";

    // Display notes
    displayNotes();
}

function displayNotes() {
    const notesDiv = document.getElementById("notes");
    notesDiv.innerHTML = "";

    if (notes.length === 0) {
        notesDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>No notes yet</h3>
                <p>Create your first note above!</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";
        noteCard.style.backgroundColor = note.color;

        // Determine text color based on background brightness
        const textColor = getContrastColor(note.color);

        noteCard.innerHTML = `
            <button class="delete-btn" onclick="deleteNote(${note.id})" title="Delete note">
                <i class="fas fa-trash"></i>
            </button>
            <h3 style="color: ${textColor}">${escapeHtml(note.title)}</h3>
            <p style="color: ${adjustColor(textColor, 40)}">${escapeHtml(note.content)}</p>
            <span class="note-time" style="color: ${adjustColor(textColor, 30)}">
                <i class="fas fa-clock"></i> ${note.time}
            </span>
        `;

        notesDiv.appendChild(noteCard);
    });
}

function deleteNote(noteId) {
    if (confirm("Are you sure you want to delete this note?")) {
        const note = notes.find(n => n.id === noteId);
        notes = notes.filter(n => n.id !== noteId);

        if (note) {
            addToHistory(`Deleted note: "${note.title}"`);
        }

        displayNotes();
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to determine text color based on background
function getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1e293b' : '#ffffff';
}

// Helper function to adjust color brightness
function adjustColor(hexColor, amount) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const newR = Math.min(255, Math.max(0, r + amount));
    const newG = Math.min(255, Math.max(0, g + amount));
    const newB = Math.min(255, Math.max(0, b + amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// ========================================
// HISTORY FUNCTIONALITY
// ========================================

function addToHistory(action) {
    const timestamp = new Date().toLocaleString();
    historyLog.unshift({ action, time: timestamp }); // Add to beginning
    displayHistory();
}

function displayHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    if (historyLog.length === 0) {
        list.innerHTML = `
            <li class="empty-history">
                <i class="fas fa-history"></i>
                <span>No activity yet</span>
            </li>
        `;
        return;
    }

    historyLog.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${escapeHtml(item.action)}</span>
            <small style="margin-left: auto; color: var(--gray-500);">${item.time}</small>
        `;
        list.appendChild(li);
    });
}

// ========================================
// PROFILE FUNCTIONALITY
// ========================================

function uploadAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatar = document.getElementById("avatar");
            avatar.src = e.target.result;
            addToHistory("Profile picture updated");
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const name = document.getElementById("editName").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;

    if (!name) {
        alert("Please enter your name");
        return;
    }

    // Display profile info
    const profileDisplay = document.getElementById("profileDisplay");
    let profileInfo = `<strong>Name:</strong> ${escapeHtml(name)}`;

    if (dob) {
        profileInfo += ` | <strong>DOB:</strong> ${dob}`;
    }

    if (gender) {
        profileInfo += ` | <strong>Gender:</strong> ${gender}`;
    }

    profileDisplay.innerHTML = profileInfo;

    // Update greeting with name
    document.getElementById("userGreeting").textContent = `Hello, ${name}!`;

    // Log the activity
    addToHistory("Profile updated");

    // Show success message
    alert("Profile saved successfully!");
}

// ========================================
// INITIALIZATION
// ========================================

// Add some initial history for demo purposes
addToHistory("App initialized");

// Display notes on page load (in case there are any)
document.addEventListener("DOMContentLoaded", function() {
    displayNotes();
    displayHistory();
});