// js/sessionnotes.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const campaignNameDisplay = document.getElementById('campaignNameDisplaySessions');
    const sessionNotesPageContent = document.getElementById('sessionNotesPageContent');
    const sessionsContainer = document.getElementById('sessionsContainer');
    const addNewSessionBtn = document.getElementById('addNewSessionBtn');
    const saveAllSessionsBtn = document.getElementById('saveAllSessionsBtn');
    const saveStatusSessions = document.getElementById('saveStatusSessions');

    // No Campaign Modal
    const noCampaignModalSessions = document.getElementById('newUserModal');
    const closeModalSessionsBtn = noCampaignModalSessions.querySelector('.close-button');
    const modalCreateNewCampaignBtnSessions = document.getElementById('createNewCampaignBtn');
    const modalGoToHomeBtnSessions = document.getElementById('importCampaignBtn');

    // Delete Session Confirm Modal
    const deleteSessionConfirmModal = document.getElementById('deleteSessionConfirmModal');
    const closeDeleteSessionModalBtn = deleteSessionConfirmModal.querySelector('.close-delete-session-modal-btn');
    const deleteSessionConfirmMessage = document.getElementById('deleteSessionConfirmMessage');
    const confirmDeleteSessionBtn = document.getElementById('confirmDeleteSessionBtn');
    const cancelDeleteSessionBtn = document.getElementById('cancelDeleteSessionBtn');
    let sessionIdToDelete = null;

    // --- Data & Keys ---
    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    let currentCampaignFullData = null;
    let originalLoadedCampaignName = null;

    // --- Cookie Helpers ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/; SameSite=Lax";
    }
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }

    // --- Modal Controls ---
    function openModal(modalElement) { if (modalElement) modalElement.style.display = 'block'; }
    function closeModal(modalElement) { if (modalElement) modalElement.style.display = 'none'; }

    // --- "No Campaign" Modal Logic ---
    if(closeModalSessionsBtn) closeModalSessionsBtn.addEventListener('click', () => closeModal(noCampaignModalSessions));
    if(modalGoToHomeBtnSessions) modalGoToHomeBtnSessions.addEventListener('click', () => {
        window.location.href = '../'; // Adjust path to your home page
    });
    if (modalCreateNewCampaignBtnSessions) {
        modalCreateNewCampaignBtnSessions.addEventListener('click', () => {
            const newCampaignName = "New Campaign";
            const dummyCampaignData = { name: newCampaignName, description: "A fresh start!", genre: "Any", maturityRating: "TV-PG", partyMembers: [], sessions: [] };
            setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, JSON.stringify(dummyCampaignData), 365);
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365);
            window.location.href = '../campaign'; // Adjust path to Campaign Details
        });
    }

    // --- Delete Session Modal Logic ---
    if(closeDeleteSessionModalBtn) closeDeleteSessionModalBtn.addEventListener('click', () => closeModal(deleteSessionConfirmModal));
    if(cancelDeleteSessionBtn) cancelDeleteSessionBtn.addEventListener('click', () => closeModal(deleteSessionConfirmModal));
    
    function openDeleteSessionConfirmModal(sessionId, sessionTitle) {
        sessionIdToDelete = sessionId;
        if(deleteSessionConfirmMessage) deleteSessionConfirmMessage.textContent = `Are you sure you want to delete the session "${sessionTitle || 'this session'}" and all its notes?`;
        openModal(deleteSessionConfirmModal);
    }

    if(confirmDeleteSessionBtn) {
        confirmDeleteSessionBtn.addEventListener('click', () => {
            if (sessionIdToDelete && currentCampaignFullData && currentCampaignFullData.sessions) {
                const sessionTitle = currentCampaignFullData.sessions.find(s => s.id === sessionIdToDelete)?.title || "Session";
                currentCampaignFullData.sessions = currentCampaignFullData.sessions.filter(s => s.id !== sessionIdToDelete);
                saveAllSessions(true); // Save immediately after delete
                renderSessions();
                if(saveStatusSessions) {
                    saveStatusSessions.textContent = `"${sessionTitle}" deleted and changes saved.`;
                    setTimeout(() => {if(saveStatusSessions) saveStatusSessions.textContent = ''}, 3000);
                }
            }
            closeModal(deleteSessionConfirmModal);
            sessionIdToDelete = null;
        });
    }

    // --- Core Session Logic ---
    function loadCampaignSessionData(campaignName) {
        const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
        if (campaignDataString) {
            try {
                currentCampaignFullData = JSON.parse(campaignDataString);

                if (!currentCampaignFullData.homebrewAssets) {
                    currentCampaignFullData.homebrewAssets = { creatures: [], items: [], spells: [] };
                }
                if (!currentCampaignFullData.sessions) {
                    currentCampaignFullData.sessions = [];
                }
                if (!currentCampaignFullData.partyMembers) { 
                    currentCampaignFullData.partyMembers = [];
                }

                // --- MODIFICATION START ---
                // Ensure all existing sessions are marked as collapsed on initial page load
                currentCampaignFullData.sessions.forEach(session => {
                    session.isExpanded = false; 
                });
                // --- MODIFICATION END ---

                originalLoadedCampaignName = currentCampaignFullData.name;
                if (campaignNameDisplay) campaignNameDisplay.textContent = `Session Notes for: ${currentCampaignFullData.name}`;
                if (sessionNotesPageContent) sessionNotesPageContent.style.display = 'block';
                renderSessions();
                return true;
            } catch (e) {
                console.error("Error parsing campaign data:", e);
                currentCampaignFullData = null;
                originalLoadedCampaignName = null;
                // Fallback if parsing fails
                if (sessionNotesPageContent) sessionNotesPageContent.style.display = 'none';
                if (campaignNameDisplay) campaignNameDisplay.textContent = `Session Notes`;
                if (noCampaignModalSessions) openModal(noCampaignModalSessions);
                return false; // Ensure false is returned here
            }
        }
        // Fallback if campaignDataString is null
        if (sessionNotesPageContent) sessionNotesPageContent.style.display = 'none';
        if (campaignNameDisplay) campaignNameDisplay.textContent = `Session Notes`;
        if (noCampaignModalSessions) openModal(noCampaignModalSessions);
        return false;
    }

    const setupExpansionToggle = (cardElement, sessionObject) => {
        const header = cardElement.querySelector('.session-header');
        const expandIcon = header ? header.querySelector('.expand-icon') : null;
        if (header && expandIcon) {
            header.addEventListener('click', (e) => {
                // Prevent toggle if click is on input elements within header
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
                    return;
                }
                sessionObject.isExpanded = !sessionObject.isExpanded;
                cardElement.classList.toggle('expanded');
                //expandIcon.textContent = sessionObject.isExpanded ? '▼' : '►';
            });
        }
    };

    function renderSessions() {
        if (!sessionsContainer || !currentCampaignFullData || !currentCampaignFullData.sessions) return;
        sessionsContainer.innerHTML = '';

        // Sort sessions, e.g., by a creation date or an order property if you add one
        // For now, rendering in stored order.
        currentCampaignFullData.sessions.forEach(session => {
            const card = document.createElement('div');
            card.className = 'session-card';
            if (session.isExpanded) card.classList.add('expanded');
            card.dataset.sessionId = session.id;

            card.innerHTML = `
                <div class="session-header">
                    <input type="text" class="session-title-input" data-field="title" value="${session.title || 'New Session'}" placeholder="Session Title">
                    <div class="level-up-group">
                        <label for="session-levelups-${session.id}" class="lvlup-label">Level Ups:</label>
                        <input type="number" id="session-levelups-${session.id}" data-field="levelUps" value="${session.levelUps || 0}" min="0">
                    </div>
                    <span class="expand-icon">►</span>
                </div>
                <div class="session-details">
                    <div class="form-group">
                        <label for="session-notes-${session.id}">Session Notes & Planning:</label>
                        <textarea id="session-notes-${session.id}" data-field="notes" rows="8">${session.notes || ''}</textarea>
                    </div>
                    <div class="session-actions">
                        <button class="btn btn-danger btn-delete-session">Delete Session</button>
                    </div>
                </div>
            `;

            setupExpansionToggle(card, session);

            // Event listeners for inline editing
            card.querySelectorAll('input[data-field], textarea[data-field]').forEach(inputEl => {
                const eventType = inputEl.tagName === 'TEXTAREA' ? 'input' : 'change';
                inputEl.addEventListener(eventType, (e) => {
                    const field = e.target.dataset.field;
                    let value = e.target.value;
                    if (e.target.type === 'number') {
                        value = parseInt(value, 10);
                        if (isNaN(value) || value < 0) value = 0;
                    }
                    session[field] = value;
                });
            });
            
            const deleteBtn = card.querySelector('.btn-delete-session');
            if(deleteBtn) deleteBtn.addEventListener('click', () => openDeleteSessionConfirmModal(session.id, session.title));

            sessionsContainer.appendChild(card);
        });
    }

    if(addNewSessionBtn) {
        addNewSessionBtn.addEventListener('click', () => {
            if (!currentCampaignFullData) {
                alert("Please load or create a campaign first.");
                return;
            }
            if (!currentCampaignFullData.sessions) { // Defensive init
                currentCampaignFullData.sessions = [];
            }
            const newSession = {
                id: generateUniqueId(),
                title: `Session ${currentCampaignFullData.sessions.length + 1}`,
                levelUps: 0,
                notes: "",
                isExpanded: true // New sessions start expanded for immediate editing
            };
            currentCampaignFullData.sessions.push(newSession);
            renderSessions();
            // Scroll to the new session card if possible
            const newCard = sessionsContainer.querySelector(`[data-session-id="${newSession.id}"]`);
            if (newCard) newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    function saveAllSessions(isTriggeredByDelete = false) {
        if (!currentCampaignFullData || !originalLoadedCampaignName) {
            if(saveStatusSessions) {
                saveStatusSessions.textContent = "No campaign data loaded to save.";
                setTimeout(() => {if(saveStatusSessions) saveStatusSessions.textContent = ''}, 3000);
            }
            return;
        }
        setCookie(CAMPAIGN_DATA_PREFIX + originalLoadedCampaignName, JSON.stringify(currentCampaignFullData), 365);
        if (saveStatusSessions && !isTriggeredByDelete) { // Avoid double message if delete already showed one
            saveStatusSessions.textContent = `Session notes for "${originalLoadedCampaignName}" saved!`;
            setTimeout(() => {if(saveStatusSessions) saveStatusSessions.textContent = ''}, 3000);
        }
        console.log("Session notes saved for campaign:", originalLoadedCampaignName);
    }

    if(saveAllSessionsBtn) {
        saveAllSessionsBtn.addEventListener('click', () => saveAllSessions(false));
    }

    // Ctrl+S Save Shortcut
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            saveAllSessions(false);
        }
    });
    
    // --- Initial Page Load ---
    function initializeSessionNotesPage() {
        const campaignNameToLoad = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (campaignNameToLoad) {
            if (!loadCampaignSessionData(campaignNameToLoad)) {
                // loadCampaignSessionData shows modal if it returns false
            }
        } else {
            if(sessionNotesPageContent) sessionNotesPageContent.style.display = 'none';
            if(campaignNameDisplay) campaignNameDisplay.textContent = 'Session Notes';
            if(noCampaignModalSessions) openModal(noCampaignModalSessions);
        }
    }

    initializeSessionNotesPage();

    // Window click listener for modals
    window.addEventListener('click', (event) => {
        if (noCampaignModalSessions && event.target === noCampaignModalSessions) closeModal(noCampaignModalSessions);
        if (deleteSessionConfirmModal && event.target === deleteSessionConfirmModal) closeModal(deleteSessionConfirmModal);
    });
});