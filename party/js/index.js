document.addEventListener('DOMContentLoaded', () => {
    const campaignNameDisplay = document.getElementById('campaignNameDisplay');
    const partyManagementContent = document.getElementById('partyManagementContent');
    const addNewPartyMemberBtn = document.getElementById('addNewPartyMemberBtn');
    const partyMembersContainer = document.getElementById('partyMembersContainer');
    const savePartyChangesBtn = document.getElementById('savePartyChangesBtn');
    const saveStatusParty = document.getElementById('saveStatusParty');

    // No Campaign Loaded Modal
    const noCampaignModalParty = document.getElementById('newUserModal');
    const closeModalPartyBtn = noCampaignModalParty.querySelector('.close-button');
    const modalCreateNewCampaignBtnParty = document.getElementById('modalCreateNewCampaignBtnParty');
    const modalImportCampaignBtnParty = document.getElementById('modalImportCampaignBtnParty');

    // Advanced Details Modal
    const advancedCharacterModal = document.getElementById('advancedCharacterModal');
    const closeAdvancedModalBtn = advancedCharacterModal.querySelector('.close-advanced-modal-btn');
    const advancedModalTitle = document.getElementById('advancedModalTitle');
    const advancedModalBody = document.getElementById('advancedModalBody');
    const saveAdvancedDetailsBtn = document.getElementById('saveAdvancedDetailsBtn');
    let currentEditingMemberIdForAdvanced = null;

    // Delete Confirmation Modal Elements
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const closeDeleteConfirmModalBtn = document.getElementById('closeDeleteConfirmModalBtn');
    const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
    const confirmDeleteCharacterBtn = document.getElementById('confirmDeleteCharacterBtn');
    const cancelDeleteCharacterBtn = document.getElementById('cancelDeleteCharacterBtn');
    let memberIdToDelete = null; // To store the ID of the member to be deleted


    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';

    let currentCampaignFullData = null;
    let originalLoadedCampaignName = null;

    // --- Cookie Helper Functions ---
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
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // --- "No Campaign" Modal Logic ---
    function openNoCampaignModal() {
        if (noCampaignModalParty) noCampaignModalParty.style.display = 'block';
    }
    function closeNoCampaignModal() {
        if (noCampaignModalParty) noCampaignModalParty.style.display = 'none';
    }

    if (closeModalPartyBtn) closeModalPartyBtn.addEventListener('click', closeNoCampaignModal);
    if (modalCreateNewCampaignBtnParty) {
        modalCreateNewCampaignBtnParty.addEventListener('click', () => {
            const newCampaignName = "New Campaign";
            const dummyCampaignData = {
                name: newCampaignName,
                description: "My new adventure begins here...",
                genre: "Fantasy",
                maturityRating: "TV-14",
                partyMembers: []
            };
            setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, JSON.stringify(dummyCampaignData), 365);
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365);
            window.location.href = 'index.html'; // Redirect to campaign details
        });
    }
    if (modalImportCampaignBtnParty) {
        modalImportCampaignBtnParty.addEventListener('click', () => {
            alert('Import functionality is not yet implemented.');
            closeNoCampaignModal();
        });
    }

    // --- Advanced Modal Logic ---
    function openAdvancedModal(memberId) {
        const member = currentCampaignFullData.partyMembers.find(m => m.id === memberId);
        if (member) {
            currentEditingMemberIdForAdvanced = memberId;
            advancedModalTitle.textContent = `Advanced Details for ${member.name || 'Unnamed Character'}`;
            // Populate advancedModalBody with member.advancedDetails later
            advancedModalBody.innerHTML = `<p>Details for ${member.name}. Advanced features coming soon!</p>`; // Placeholder
            if (advancedCharacterModal) advancedCharacterModal.style.display = 'block';
        }
    }
    function closeAdvancedModal() {
        if (advancedCharacterModal) advancedCharacterModal.style.display = 'none';
        currentEditingMemberIdForAdvanced = null;
    }
    if (closeAdvancedModalBtn) closeAdvancedModalBtn.addEventListener('click', closeAdvancedModal);
    if (saveAdvancedDetailsBtn) {
        saveAdvancedDetailsBtn.addEventListener('click', () => {
            // Save advanced details logic here, update currentCampaignFullData
            console.log("Saving advanced details for member ID:", currentEditingMemberIdForAdvanced);
            closeAdvancedModal();
            // Potentially trigger main save or indicate changes are pending
        });
    }
     window.addEventListener('click', (event) => { // Close modals on outside click
        if (event.target === noCampaignModalParty) closeNoCampaignModal();
        if (event.target === advancedCharacterModal) closeAdvancedModal();
    });

    // --- Delete Confirmation Modal Logic ---
    function openDeleteConfirmModal(memberId, memberName) {
        memberIdToDelete = memberId;
        if (deleteConfirmMessage) {
            deleteConfirmMessage.textContent = `Are you sure you want to delete "${memberName || 'this character'}"? This action will save all current party changes immediately.`;
        }
        if (deleteConfirmModal) deleteConfirmModal.style.display = 'block';
    }

    function closeDeleteConfirmModal() {
        if (deleteConfirmModal) deleteConfirmModal.style.display = 'none';
        memberIdToDelete = null; // Clear the stored ID
    }

    if (closeDeleteConfirmModalBtn) {
        closeDeleteConfirmModalBtn.addEventListener('click', closeDeleteConfirmModal);
    }
    if (cancelDeleteCharacterBtn) {
        cancelDeleteCharacterBtn.addEventListener('click', closeDeleteConfirmModal);
    }
    // Add window click to close delete modal too
    window.addEventListener('click', (event) => {
        // ... (existing window click for other modals) ...
        if (event.target === deleteConfirmModal) {
            closeDeleteConfirmModal();
        }
    });

    if (confirmDeleteCharacterBtn) {
        confirmDeleteCharacterBtn.addEventListener('click', () => {
            if (memberIdToDelete && currentCampaignFullData) {
                const memberToDelete = currentCampaignFullData.partyMembers.find(m => m.id === memberIdToDelete);
                const memberName = memberToDelete ? memberToDelete.name : 'Character';

                currentCampaignFullData.partyMembers = currentCampaignFullData.partyMembers.filter(m => m.id !== memberIdToDelete);
                
                // Directly call savePartyChanges which also saves to cookies
                savePartyChanges(true); // Pass a flag to indicate it's a delete-triggered save for custom message

                renderPartyMembers(); // Re-render the list to update DOM

                // Update save status (savePartyChanges will set its own, but we can be more specific)
                if (saveStatusParty) {
                     saveStatusParty.textContent = `"${memberName}" deleted and party changes saved.`;
                     setTimeout(() => saveStatusParty.textContent = "", 4000);
                }
                
                closeDeleteConfirmModal();
            }
        });
    }


    // --- Campaign and Party Loading ---
    function loadFullCampaignData(campaignName) {
    const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
    if (campaignDataString) {
        try {
            currentCampaignFullData = JSON.parse(campaignDataString);
            if (!currentCampaignFullData.partyMembers) {
                currentCampaignFullData.partyMembers = [];
            }

            // Ensure all members are collapsed on initial page load
            currentCampaignFullData.partyMembers.forEach(member => {
                member.isExpanded = false; // <<< ADD THIS LOOP
            });

            originalLoadedCampaignName = currentCampaignFullData.name;
            if (campaignNameDisplay) campaignNameDisplay.textContent = `Party Management for: ${currentCampaignFullData.name}`;
            if (partyManagementContent) partyManagementContent.style.display = 'block';
            renderPartyMembers();
            return true;
        } catch (e) {
            console.error("Error parsing campaign data:", e);
            currentCampaignFullData = null;
            originalLoadedCampaignName = null;
            // Ensure content is hidden and modal shown if error occurs
            if (partyManagementContent) partyManagementContent.style.display = 'none';
            if (campaignNameDisplay) campaignNameDisplay.textContent = `Party Management`;
        }
    }
    // This part runs if campaignDataString is null OR if try-catch fails and doesn't return true
    openNoCampaignModal();
    if (partyManagementContent) partyManagementContent.style.display = 'none';
    if (campaignNameDisplay) campaignNameDisplay.textContent = `Party Management`;
    return false;
}

    function renderPartyMembers() {
        currentCampaignFullData.partyMembers.forEach(member => {
            const card = document.createElement('div');
            card.className = 'party-member-card';
            card.dataset.memberId = member.id;
            if (member.isExpanded) {
                card.classList.add('expanded');
            }

            // MODIFIED PART: Buttons are now inside party-member-details
            card.innerHTML = `
                <div class="party-member-header">
                    <h3>${member.name || 'Unnamed Character'}</h3>
                    <span class="expand-icon">${member.isExpanded ? '▼' : '►'}</span>
                </div>
                <div class="party-member-details">
                    <div class="form-group">
                        <label for="pm-name-${member.id}">Name:</label>
                        <input type="text" id="pm-name-${member.id}" data-field="name" value="${member.name || ''}">
                    </div>
                    <div class="form-group">
                        <label for="pm-ancestry-${member.id}">Ancestry:</label>
                        <input type="text" id="pm-ancestry-${member.id}" data-field="ancestry" value="${member.ancestry || ''}">
                    </div>
                    <div class="form-group">
                        <label for="pm-class-${member.id}">Class:</label>
                        <input type="text" id="pm-class-${member.id}" data-field="characterClass" value="${member.characterClass || ''}">
                    </div>
                    <div class="form-group">
                        <label for="pm-level-${member.id}">Level:</label>
                        <input type="number" id="pm-level-${member.id}" data-field="level" value="${member.level || 1}" min="1">
                    </div>
                    <div class="form-group">
                        <label for="pm-sex-${member.id}">Sex:</label>
                        <select id="pm-sex-${member.id}" data-field="sex">
                            <option value="Male" ${member.sex === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${member.sex === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Unknown" ${member.sex === 'Unknown' || !member.sex ? 'selected' : ''}>Unknown</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="pm-age-${member.id}">Age:</label>
                        <input type="text" id="pm-age-${member.id}" data-field="age" value="${member.age || ''}">
                    </div>
                    <div class="form-group">
                        <label for="pm-deity-${member.id}">Deity:</label>
                        <input type="text" id="pm-deity-${member.id}" data-field="deity" value="${member.deity || ''}">
                    </div>
                    <div class="form-group">
                        <label for="pm-languages-${member.id}">Languages:</label>
                        <input type="text" id="pm-languages-${member.id}" data-field="languages" value="${member.languages || ''}">
                    </div>
                    <div class="form-group full-width">
                        <label for="pm-notes-${member.id}">Notes:</label>
                        <textarea id="pm-notes-${member.id}" data-field="notes" rows="3">${member.notes || ''}</textarea>
                    </div>
                    <div class="form-group full-width party-member-inline-actions">
                        <button class="btn btn-secondary advanced-btn">Advanced</button>
                        <button class="btn btn-delete-member delete-member-btn">Delete</button>
                    </div>
                </div>
            `;
            // The div class="party-member-actions" that was previously here is now removed.

            // ... (rest of the event listeners for header, inputs, advanced-btn, delete-member-btn remain the same) ...
            // The querySelectors for '.advanced-btn' and '.delete-member-btn' will still work as they search within the `card`.
            
            // Update data model on input change
            card.querySelectorAll('input, select, textarea').forEach(inputEl => {
                // Use 'input' event for text fields and textareas for more immediate updates.
                // Use 'change' for select and number inputs.
                const eventType = (inputEl.tagName.toLowerCase() === 'select' || inputEl.type === 'number') 
                                ? 'change' 
                                : 'input';

                inputEl.addEventListener(eventType, (e) => {
                    const field = e.target.dataset.field;
                    let value = e.target.value;

                    if (e.target.type === 'number') {
                        value = parseInt(value, 10);
                        // Handle NaN, e.g., if user deletes number or types non-numeric
                        if (isNaN(value)) {
                            value = (field === 'level' && e.target.min) ? parseInt(e.target.min, 10) : 0; 
                        }
                    }
                    
                    member[field] = value; // Update the member object directly
                    if (field === 'name') { // Update header if name changes
                        card.querySelector('.party-member-header h3').textContent = value || 'Unnamed Character';
                    }
                    // Optional: log to see immediate updates in the JS model
                    // console.log(`Updated member ${member.id} - ${field}: ${value}`);
                });
            });

            const header = card.querySelector('.party-member-header');
            header.addEventListener('click', () => {
                member.isExpanded = !member.isExpanded; // Update the state
                card.classList.toggle('expanded');      // Toggle the class for CSS
                header.querySelector('.expand-icon').textContent = member.isExpanded ? '▼' : '►'; // Update icon
            });

            
            // MODIFIED Delete Button: Now opens the confirmation modal
            const deleteBtn = card.querySelector('.delete-member-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    openDeleteConfirmModal(member.id, member.name);
                });
            }
            partyMembersContainer.appendChild(card);
        });
         // Fallback: Force re-check if partyMembersContainer is empty after render if it shouldn't be
        if (currentCampaignFullData.partyMembers.length > 0 && partyMembersContainer.children.length === 0) {
            console.warn("Party members array has items, but DOM container is empty after render. Forcing one more render.");
            // This is a heavy-handed fallback, ideally not needed.
            // setTimeout(renderPartyMembers, 0); // Re-render on next tick
        } else if (currentCampaignFullData.partyMembers.length === 0 && partyMembersContainer.children.length > 0) {
            console.warn("Party members array is empty, but DOM container has children. Clearing.");
            partyMembersContainer.innerHTML = '';
        }
    }

    if (addNewPartyMemberBtn) {
        addNewPartyMemberBtn.addEventListener('click', () => {
            if (!currentCampaignFullData) {
                alert("Please load a campaign first.");
                return;
            }
            const newMember = {
                id: generateUniqueId(),
                name: "New Character",
                ancestry: "",
                characterClass: "",
                level: 1,
                sex: "Unknown",
                age: "",
                deity: "",
                languages: "",
                notes: "",
                isExpanded: true // Expand new members by default
            };
            currentCampaignFullData.partyMembers.push(newMember);
            renderPartyMembers();
        });
        
    }

    // Modified savePartyChanges to accept an optional flag for message customization
    function savePartyChanges(isTriggeredByDelete = false) {
        if (!currentCampaignFullData || !originalLoadedCampaignName) {
            if(saveStatusParty) {
                saveStatusParty.textContent = "No campaign loaded to save.";
                setTimeout(() => saveStatusParty.textContent = "", 3000);
            }
            return;
        }
        setCookie(CAMPAIGN_DATA_PREFIX + originalLoadedCampaignName, JSON.stringify(currentCampaignFullData), 365);
        setCookie(LAST_VIEWED_CAMPAIGN_KEY, originalLoadedCampaignName, 365);
        
        if (saveStatusParty && !isTriggeredByDelete) { // Only show generic save if not from delete
            saveStatusParty.textContent = `Party changes for "${originalLoadedCampaignName}" saved!`;
            setTimeout(() => saveStatusParty.textContent = "", 3000);
        }
        console.log("Party changes saved for campaign:", originalLoadedCampaignName, currentCampaignFullData);
    }

    if (savePartyChangesBtn) {
        savePartyChangesBtn.addEventListener('click', () => savePartyChanges(false));
    }

    // Ctrl+S Save Shortcut
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            console.log("Ctrl+S pressed, saving party changes...");
            savePartyChanges(false);
        }
    });

    // --- Initial Page Load ---
    function initializePartyPage() {
        const campaignNameToLoad = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (campaignNameToLoad) {
            loadFullCampaignData(campaignNameToLoad);
        } else {
            openNoCampaignModal();
            partyManagementContent.style.display = 'none';
            campaignNameDisplay.textContent = 'Party Management';
        }
         // Navigation highlighting
        document.querySelectorAll('.top-bar nav ul li a').forEach(link => {
            if (link.getAttribute('href') === 'partymanagement.html') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    initializePartyPage();
});