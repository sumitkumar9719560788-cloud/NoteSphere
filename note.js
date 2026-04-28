// Notes App - JavaScript

// Data Storage
let notes = [];
let archivedNotes = [];
let historyLog = [];
let currentEditId = null;
let currentFilter = 'all';

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// PASSWORD TOGGLE
// ========================================

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// ========================================
// LOCAL STORAGE
// ========================================

function saveToLocalStorage() {
    localStorage.setItem('notesApp_notes', JSON.stringify(notes));
    localStorage.setItem('notesApp_archivedNotes', JSON.stringify(archivedNotes));
    localStorage.setItem('notesApp_history', JSON.stringify(historyLog));
    localStorage.setItem('notesApp_darkMode', document.body.classList.contains('dark-mode') ? 'true' : 'false');
}

function loadFromLocalStorage() {
    const savedNotes = localStorage.getItem('notesApp_notes');
    const savedArchived = localStorage.getItem('notesApp_archivedNotes');
    const savedHistory = localStorage.getItem('notesApp_history');
    const darkMode = localStorage.getItem('notesApp_darkMode');

    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
    if (savedArchived) {
        archivedNotes = JSON.parse(savedArchived);
    }
    if (savedHistory) {
        historyLog = JSON.parse(savedHistory);
    }
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }

    updateCounts();
}

// ========================================
// LOGIN FUNCTIONALITY
// ========================================

function login() {
    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("password").value.trim();
    const rememberMe = document.getElementById("rememberMe").checked;

    if (loginId && password) {
        // Remember me functionality
        if (rememberMe) {
            localStorage.setItem('notesApp_rememberedUser', loginId);
        } else {
            localStorage.removeItem('notesApp_rememberedUser');
        }

        // Hide login page, show app
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        // Update greeting
        const userGreeting = document.getElementById("userGreeting");
        const sidebarUserName = document.getElementById("sidebarUserName");
        userGreeting.textContent = `Hello, ${loginId}!`;
        sidebarUserName.textContent = loginId;

        // Log the activity
        addToHistory("User logged in successfully");

        // Clear form
        document.getElementById("loginId").value = "";
        document.getElementById("password").value = "";

        // Load saved data
        loadFromLocalStorage();
        displayNotes();
        displayPinnedNotes();
        displayArchivedNotes();
        displayHistory();

        showToast('Welcome back!', 'success');
    } else {
        // Show error with animation
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);

        showToast('Please enter both Email/Mobile and Password', 'error');
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
    Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Yes, logout!',
        background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
        color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#334155'
    }).then((result) => {
        if (result.isConfirmed) {
            addToHistory("User logged out");

            // Clear app data
            document.getElementById("app").classList.add("hidden");
            document.getElementById("loginPage").classList.remove("hidden");

            // Reset notes and history for demo
            notes = [];
            archivedNotes = [];
            historyLog = [];
            displayNotes();
            displayPinnedNotes();
            displayArchivedNotes();
            displayHistory();

            // Close sidebar on mobile
            closeSidebar();

            showToast('Logged out successfully', 'info');
        }
    });
}

// ========================================
// SIDEBAR TOGGLE (MOBILE)
// ========================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
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

    // Close sidebar on mobile when tab is clicked
    closeSidebar();

    // Log tab switch
    const tabNames = {
        'home': 'Home',
        'pinned': 'Pinned Notes',
        'archived': 'Archived Notes',
        'profile': 'Profile',
        'history': 'History',
        'about': 'About',
        'settings': 'Settings'
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
    const category = document.getElementById("noteCategory").value;
    const priority = document.getElementById("notePriority").value;
    const dueDate = document.getElementById("noteDueDate").value;

    if (!title || !content) {
        showToast('Please enter both title and content', 'warning');
        return;
    }

    // Create note object
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        color: color,
        category: category,
        priority: priority,
        dueDate: dueDate || null,
        pinned: false,
        archived: false,
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
    document.getElementById("noteCategory").value = "General";
    document.getElementById("notePriority").value = "medium";
    document.getElementById("noteDueDate").value = "";

    // Display notes
    displayNotes();
    updateCounts();

    // Save to localStorage
    saveToLocalStorage();

    showToast('Note added successfully!', 'success');
}

function displayNotes(filteredNotes = null) {
    const notesDiv = document.getElementById("notes");
    const emptyState = document.getElementById("emptyState");
    notesDiv.innerHTML = "";

    const displayNotes = filteredNotes || notes.filter(n => !n.archived);

    // Sort: pinned notes first, then by priority
    const sortedNotes = [...displayNotes].sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    if (sortedNotes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    sortedNotes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesDiv.appendChild(noteCard);
    });
}

function displayPinnedNotes() {
    const pinnedDiv = document.getElementById("pinnedNotes");
    const emptyState = document.getElementById("pinnedEmptyState");
    pinnedDiv.innerHTML = "";

    const pinnedNotes = notes.filter(n => n.pinned && !n.archived);

    if (pinnedNotes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    pinnedNotes.forEach(note => {
        const noteCard = createNoteCard(note);
        pinnedDiv.appendChild(noteCard);
    });
}

function displayArchivedNotes() {
    const archivedDiv = document.getElementById("archivedNotes");
    const emptyState = document.getElementById("archivedEmptyState");
    archivedDiv.innerHTML = "";

    const displayArchived = [...notes.filter(n => n.archived), ...archivedNotes];

    if (displayArchived.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    displayArchived.forEach(note => {
        const noteCard = createNoteCard(note, true);
        archivedDiv.appendChild(noteCard);
    });
}

function createNoteCard(note, isArchived = false) {
    const noteCard = document.createElement("div");
    noteCard.className = `note-card priority-${note.priority} ${note.pinned ? 'pinned' : ''}`;
    noteCard.style.backgroundColor = note.color;

    // Determine text color based on background brightness
    const textColor = getContrastColor(note.color);
    const mutedColor = adjustColor(textColor, 40);

    // Check if due date is overdue
    let dueDateHtml = '';
    if (note.dueDate) {
        const dueDate = new Date(note.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = dueDate < today && !isArchived;
        dueDateHtml = `
            <span class="due-date ${isOverdue ? 'overdue' : ''}">
                <i class="fas fa-calendar"></i> ${formatDate(note.dueDate)}
            </span>
        `;
    }

    noteCard.innerHTML = `
        <div class="note-actions">
            ${!isArchived ? `
            <button class="pin-btn ${note.pinned ? 'active' : ''}" onclick="togglePin(${note.id})" title="${note.pinned ? 'Unpin' : 'Pin'} note">
                <i class="fas fa-thumbtack"></i>
            </button>
            <button onclick="archiveNote(${note.id})" title="Archive note">
                <i class="fas fa-archive"></i>
            </button>
            ` : `
            <button onclick="unarchiveNote(${note.id})" title="Restore note">
                <i class="fas fa-trash-restore"></i>
            </button>
            `}
            <button onclick="editNote(${note.id})" title="Edit note">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="deleteNote(${note.id})" title="Delete note">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <h3 style="color: ${textColor}">${escapeHtml(note.title)}</h3>
        <p style="color: ${mutedColor}">${escapeHtml(note.content)}</p>
        <div class="note-meta">
            <span class="priority-badge ${note.priority}">${note.priority}</span>
            <span style="color: ${mutedColor}; font-size: 12px;">
                <i class="fas fa-tag"></i> ${note.category}
            </span>
            ${dueDateHtml}
            <span class="note-time" style="color: ${mutedColor}">
                <i class="fas fa-clock"></i> ${note.time}
            </span>
        </div>
    `;

    return noteCard;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function deleteNote(noteId) {
    Swal.fire({
        title: 'Delete Note',
        text: 'Are you sure you want to delete this note?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, delete it!',
        background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
        color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#334155'
    }).then((result) => {
        if (result.isConfirmed) {
            const note = notes.find(n => n.id === noteId);
            notes = notes.filter(n => n.id !== noteId);
            archivedNotes = archivedNotes.filter(n => n.id !== noteId);

            if (note) {
                addToHistory(`Deleted note: "${note.title}"`);
            }

            displayNotes();
            displayPinnedNotes();
            displayArchivedNotes();
            updateCounts();
            saveToLocalStorage();
            showToast('Note deleted', 'success');
        }
    });
}

function togglePin(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.pinned = !note.pinned;
        addToHistory(note.pinned ? `Pinned note: "${note.title}"` : `Unpinned note: "${note.title}"`);
        displayNotes();
        displayPinnedNotes();
        updateCounts();
        saveToLocalStorage();
        showToast(note.pinned ? 'Note pinned' : 'Note unpinned', 'info');
    }
}

function archiveNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.archived = true;
        addToHistory(`Archived note: "${note.title}"`);
        displayNotes();
        displayArchivedNotes();
        updateCounts();
        saveToLocalStorage();
        showToast('Note archived', 'info');
    }
}

function unarchiveNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.archived = false;
        addToHistory(`Restored note: "${note.title}"`);
        displayNotes();
        displayArchivedNotes();
        updateCounts();
        saveToLocalStorage();
        showToast('Note restored', 'success');
    }
}

function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        currentEditId = noteId;
        document.getElementById("editNoteId").value = noteId;
        document.getElementById("editNoteTitle").value = note.title;
        document.getElementById("editNoteContent").value = note.content;
        document.getElementById("editNoteColor").value = note.color;
        document.getElementById("editNoteCategory").value = note.category || 'General';
        document.getElementById("editNotePriority").value = note.priority || 'medium';
        document.getElementById("editNoteDueDate").value = note.dueDate || '';
        document.getElementById("editModal").classList.add("active");
    }
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("active");
    currentEditId = null;
}

function saveEditedNote() {
    const title = document.getElementById("editNoteTitle").value.trim();
    const content = document.getElementById("editNoteContent").value.trim();
    const color = document.getElementById("editNoteColor").value;
    const category = document.getElementById("editNoteCategory").value;
    const priority = document.getElementById("editNotePriority").value;
    const dueDate = document.getElementById("editNoteDueDate").value;

    if (!title || !content) {
        showToast('Please enter both title and content', 'warning');
        return;
    }

    const note = notes.find(n => n.id === currentEditId);
    if (note) {
        note.title = title;
        note.content = content;
        note.color = color;
        note.category = category;
        note.priority = priority;
        note.dueDate = dueDate || null;
        note.time = new Date().toLocaleString();

        addToHistory(`Updated note: "${title}"`);
        displayNotes();
        displayPinnedNotes();
        displayArchivedNotes();
        saveToLocalStorage();
        closeEditModal();
        showToast('Note updated successfully!', 'success');
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function toggleSearch() {
    const container = document.getElementById('searchContainer');
    container.classList.toggle('active');
    if (container.classList.contains('active')) {
        container.style.display = 'block';
    }
}

function clearSearch() {
    document.getElementById('searchNotes').value = '';
    displayNotes();
}

function searchNotes() {
    const searchTerm = document.getElementById("searchNotes").value.toLowerCase().trim();

    if (!searchTerm) {
        displayNotes();
        return;
    }

    const filteredNotes = notes.filter(note =>
        !note.archived && (
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm) ||
            note.category.toLowerCase().includes(searchTerm)
        )
    );

    displayNotes(filteredNotes);
}

// ========================================
// FILTER BY CATEGORY
// ========================================

function filterByCategory(category) {
    currentFilter = category;

    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.category-btn[data-category="${category}"]`)?.classList.add('active');

    if (category === 'all') {
        displayNotes();
    } else {
        const filteredNotes = notes.filter(note => !note.archived && note.category === category);
        displayNotes(filteredNotes);
    }
}

// ========================================
// QUICK ADD TOGGLE
// ========================================

function toggleNoteForm() {
    const section = document.querySelector('.quick-add-section');
    const icon = document.getElementById('formToggleIcon');
    section.classList.toggle('collapsed');
    
    if (section.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// ========================================
// COLOR PICKER
// ========================================

function setColor(color) {
    document.getElementById('noteColor').value = color;
}

// ========================================
// TEMPLATES
// ========================================

function showTemplates() {
    document.getElementById('templatesModal').classList.add('active');
}

function closeTemplates() {
    document.getElementById('templatesModal').classList.remove('active');
}

function useTemplate(templateType) {
    const templates = {
        meeting: {
            title: 'Meeting Notes',
            content: 'Attendees:\n\nAgenda:\n1. \n2. \n3. \n\nAction Items:\n- \n\nNext Steps:'
        },
        todo: {
            title: 'To-Do List',
            content: '□ Task 1\n□ Task 2\n□ Task 3\n□ Task 4\n□ Task 5'
        },
        idea: {
            title: 'New Idea',
            content: 'Problem:\n\nSolution:\n\nBenefits:\n- \n- \n\nNext Steps:'
        },
        journal: {
            title: 'Daily Journal',
            content: 'Date: \n\nHighlights:\n\nChallenges:\n\nGratitude:\n\nTomorrow\'s Goals:'
        }
    };

    const template = templates[templateType];
    if (template) {
        document.getElementById('noteTitle').value = template.title;
        document.getElementById('noteContent').value = template.content;
        document.getElementById('noteCategory').value = 'Ideas';
        closeTemplates();
        toggleNoteForm();
        showToast('Template applied!', 'success');
    }
}

// ========================================
// UPDATE COUNTS
// ========================================

function updateCounts() {
    const activeNotes = notes.filter(n => !n.archived);
    const pinnedCount = activeNotes.filter(n => n.pinned).length;
    const archivedCount = notes.filter(n => n.archived).length + archivedNotes.length;
    
    document.getElementById('notesCount').textContent = activeNotes.length;
    document.getElementById('pinnedCount').textContent = pinnedCount;
    document.getElementById('archivedCount').textContent = archivedCount;
    document.getElementById('totalNotes').textContent = `${activeNotes.length} Notes`;
}

// ========================================
// HISTORY FUNCTIONALITY
// ========================================

function addToHistory(action) {
    const timestamp = new Date().toLocaleString();
    historyLog.unshift({ action, time: timestamp }); // Add to beginning
    displayHistory();
    saveToLocalStorage();
}

function displayHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    if (historyLog.length === 0) {
        list.innerHTML = `
            <li class="empty-history" style="display: flex; align-items: center; gap: 12px; padding: 20px; color: var(--gray-500);">
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
            <small style="margin-left: auto; color: var(--gray-500); font-size: 12px;">${item.time}</small>
        `;
        list.appendChild(li);
    });
}

function clearHistory() {
    Swal.fire({
        title: 'Clear History',
        text: 'Are you sure you want to clear all activity history?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, clear it!',
        background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
        color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#334155'
    }).then((result) => {
        if (result.isConfirmed) {
            historyLog = [];
            displayHistory();
            saveToLocalStorage();
            showToast('History cleared', 'success');
        }
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
            const miniAvatar = document.getElementById("miniAvatar");
            avatar.src = e.target.result;
            miniAvatar.style.backgroundImage = `url(${e.target.result})`;
            miniAvatar.innerHTML = '';
            miniAvatar.style.backgroundSize = 'cover';
            addToHistory("Profile picture updated");
            // Save avatar to localStorage
            localStorage.setItem('notesApp_avatar', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const name = document.getElementById("editName").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const bio = document.getElementById("bio").value.trim();

    if (!name) {
        showToast('Please enter your name', 'warning');
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
    document.getElementById("sidebarUserName").textContent = name;

    // Log the activity
    addToHistory("Profile updated");

    // Save profile to localStorage
    localStorage.setItem('notesApp_profile', JSON.stringify({ name, dob, gender, bio }));

    showToast('Profile saved successfully!', 'success');
}

// ========================================
// SETTINGS FUNCTIONALITY
// ========================================

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    addToHistory(isDark ? "Dark mode enabled" : "Dark mode disabled");
    saveToLocalStorage();
    showToast(isDark ? 'Dark mode enabled' : 'Dark mode disabled', 'info');
}

function changeLanguage() {
    const language = document.getElementById("languageSelect").value;
    addToHistory(`Language changed to: ${language}`);
    showToast(`Language set to: ${language.toUpperCase()}`, 'info');
}

function exportNotes() {
    const activeNotes = notes.filter(n => !n.archived);
    const dataStr = JSON.stringify(activeNotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToHistory("Notes exported successfully");
    showToast('Notes exported successfully!', 'success');
}

function exportHistory() {
    const dataStr = JSON.stringify(historyLog, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `history-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToHistory("History exported successfully");
    showToast('History exported successfully!', 'success');
}

function clearAllData() {
    Swal.fire({
        title: 'Clear All Data',
        text: 'Are you sure you want to clear ALL data? This action cannot be undone!',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, clear all!',
        background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
        color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#334155'
    }).then((result) => {
        if (result.isConfirmed) {
            notes = [];
            archivedNotes = [];
            historyLog = [];
            localStorage.removeItem('notesApp_notes');
            localStorage.removeItem('notesApp_archivedNotes');
            localStorage.removeItem('notesApp_history');
            localStorage.removeItem('notesApp_profile');
            localStorage.removeItem('notesApp_avatar');
            displayNotes();
            displayPinnedNotes();
            displayArchivedNotes();
            displayHistory();
            updateCounts();
            addToHistory("All data cleared");
            showToast('All data has been cleared!', 'success');
        }
    });
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1e293b' : '#ffffff';
}

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
// INITIALIZATION
// ========================================

// Add some initial history for demo purposes
addToHistory("App initialized");

// Display notes on page load (in case there are any)
document.addEventListener("DOMContentLoaded", function() {
    // Load saved data
    loadFromLocalStorage();

    // Load saved avatar
    const savedAvatar = localStorage.getItem('notesApp_avatar');
    if (savedAvatar) {
        document.getElementById("avatar").src = savedAvatar;
        const miniAvatar = document.getElementById("miniAvatar");
        miniAvatar.style.backgroundImage = `url(${savedAvatar})`;
        miniAvatar.innerHTML = '';
        miniAvatar.style.backgroundSize = 'cover';
    }

    // Load saved profile
    const savedProfile = localStorage.getItem('notesApp_profile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById("editName").value = profile.name || '';
        document.getElementById("dob").value = profile.dob || '';
        document.getElementById("gender").value = profile.gender || '';
        document.getElementById("bio").value = profile.bio || '';

        if (profile.name) {
            document.getElementById("userGreeting").textContent = `Hello, ${profile.name}!`;
            document.getElementById("sidebarUserName").textContent = profile.name;
        }
    }
    
    // Check for remembered user
    const rememberedUser = localStorage.getItem('notesApp_rememberedUser');
    if (rememberedUser) {
        document.getElementById("loginId").value = rememberedUser;
        document.getElementById("rememberMe").checked = true;
    }

    displayNotes();
    displayPinnedNotes();
    displayArchivedNotes();
    displayHistory();
    updateCounts();
});
