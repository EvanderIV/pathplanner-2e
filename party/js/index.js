// index.js (for Party Management page)
document.addEventListener('DOMContentLoaded', () => {
    const campaignNameDisplay = document.getElementById('campaignNameDisplay');
    const partyManagementContent = document.getElementById('partyManagementContent');
    const addNewPartyMemberBtn = document.getElementById('addNewPartyMemberBtn');
    const partyMembersContainer = document.getElementById('partyMembersContainer');
    const savePartyChangesBtn = document.getElementById('savePartyChangesBtn');
    const saveStatusParty = document.getElementById('saveStatusParty');

    // No Campaign Loaded Modal (Ensure IDs match your party management HTML)
    const noCampaignModalParty = document.getElementById('newUserModal'); // From your HTML
    const closeModalPartyBtn = noCampaignModalParty ? noCampaignModalParty.querySelector('.close-button') : null;
    const modalCreateNewCampaignBtnParty = document.getElementById('createNewCampaignBtn'); // From your HTML
    const modalImportCampaignBtnParty = document.getElementById('importCampaignBtn'); // From your HTML

    // Advanced Details Modal (Pathbuilder Import Modal)
    const advancedCharacterModal = document.getElementById('advancedCharacterModal');
    const closeAdvancedModalBtn = advancedCharacterModal ? advancedCharacterModal.querySelector('#closeAdvancedModalBtn') : null; // Ensure this ID is on the close button in HTML
    const advancedModalTitle = document.getElementById('advancedModalTitle');
    // Pathbuilder Import specific elements (ensure these are in your advancedCharacterModal HTML)
    const pathbuilderIdInput = document.getElementById('pathbuilderIdInput');
    const fetchPathbuilderDataBtn = document.getElementById('fetchPathbuilderDataBtn');
    const pathbuilderJsonOutput = document.getElementById('pathbuilderJsonOutput');
    
    let currentEditingMemberIdForAdvanced = null; // To know which party member to associate the data with

    // Delete Confirmation Modal Elements
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const closeDeleteConfirmModalBtn = deleteConfirmModal ? document.getElementById('closeDeleteConfirmModalBtn') : null; // Ensure ID
    const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
    const confirmDeleteCharacterBtn = document.getElementById('confirmDeleteCharacterBtn');
    const cancelDeleteCharacterBtn = document.getElementById('cancelDeleteCharacterBtn');
    let memberIdToDelete = null; 


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
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9); // Shortened random part
    }

    // --- Generic Modal Controls ---
    function openModal(modalElement) {
        if (modalElement) modalElement.style.display = 'block';
    }
    function closeModal(modalElement) {
        if (modalElement) modalElement.style.display = 'none';
    }

    // --- "No Campaign" Modal Logic ---
    function openNoCampaignModal() {
        if (noCampaignModalParty) openModal(noCampaignModalParty);
    }
    function closeNoCampaignModal() {
        if (noCampaignModalParty) closeModal(noCampaignModalParty);
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
                partyMembers: [],
                sessions: [] // Ensure sessions array is also initialized
            };
            setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, JSON.stringify(dummyCampaignData), 365);
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365);
            window.location.href = '../index.html'; // Redirect to main campaign details page
        });
    }
    if (modalImportCampaignBtnParty) { // This button's HTML text is "Import from File"
        modalImportCampaignBtnParty.addEventListener('click', () => {
            alert('Import functionality is not yet implemented.');
            closeNoCampaignModal();
        });
    }

    // --- Advanced Modal Logic (Pathbuilder Import) ---
    function openAdvancedModal(memberId) {
        if (!currentCampaignFullData || !currentCampaignFullData.partyMembers) return;
        const member = currentCampaignFullData.partyMembers.find(m => m.id === memberId);
        if (member && advancedCharacterModal) {
            currentEditingMemberIdForAdvanced = memberId;
            if (advancedModalTitle) advancedModalTitle.textContent = `Import Pathbuilder Data for ${member.name || 'Character'}`;
            if (pathbuilderIdInput) pathbuilderIdInput.value = '';
            if (pathbuilderJsonOutput) pathbuilderJsonOutput.textContent = 'Enter Pathbuilder ID and click "Fetch".';
            openModal(advancedCharacterModal);
        } else {
            console.error("Cannot open advanced modal: Member not found or modal element missing. Member ID:", memberId);
        }
    }

    function closeAdvancedModal() {
        if (advancedCharacterModal) closeModal(advancedCharacterModal);
        currentEditingMemberIdForAdvanced = null;
    }

    if (closeAdvancedModalBtn) { // Ensure HTML ID for close button inside #advancedCharacterModal matches
        closeAdvancedModalBtn.addEventListener('click', closeAdvancedModal);
    }
    
    if (fetchPathbuilderDataBtn) {
        fetchPathbuilderDataBtn.addEventListener('click', async () => {
            if (!pathbuilderIdInput || !pathbuilderJsonOutput) return;

            const characterId = pathbuilderIdInput.value.trim();
            if (!characterId) {
                pathbuilderJsonOutput.textContent = 'Please enter a Pathbuilder Character ID.';
                return;
            }

            pathbuilderJsonOutput.textContent = 'Fetching data...';
            const apiUrl = `https://pathbuilder2e.com/json.php?id=${characterId}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Pathbuilder ID might be invalid or private.`);
                }
                const data = await response.json();

                if (data.success && data.build) {
                    pathbuilderJsonOutput.textContent = JSON.stringify(data.build, null, 2);
                    console.log("Pathbuilder data fetched:", data.build);
                    
                    if (currentEditingMemberIdForAdvanced && currentCampaignFullData && currentCampaignFullData.partyMembers) {
                        const memberIndex = currentCampaignFullData.partyMembers.findIndex(m => m.id === currentEditingMemberIdForAdvanced);
                        if (memberIndex > -1) {
                            const memberToUpdate = currentCampaignFullData.partyMembers[memberIndex];
                            const build = data.build;

                            memberToUpdate.name = build.name || memberToUpdate.name;
                            memberToUpdate.level = build.level || memberToUpdate.level;
                            memberToUpdate.characterClass = build.class || memberToUpdate.characterClass;
                            memberToUpdate.ancestry = build.ancestry || memberToUpdate.ancestry;
                            memberToUpdate.sex = build.gender || memberToUpdate.sex; // Pathbuilder uses 'gender'
                            memberToUpdate.age = build.age || memberToUpdate.age;
                            memberToUpdate.deity = build.deity || memberToUpdate.deity;
                            if (build.languages && Array.isArray(build.languages)) {
                                memberToUpdate.languages = build.languages.join(', ');
                            }
                            // You can map more fields here:
                            // memberToUpdate.notes = `Imported from Pathbuilder. Key Ability: ${build.keyability}. Alignment: ${build.alignment}. Background: ${build.background}. Heritage: ${build.heritage}. \n\n${memberToUpdate.notes || ''}`.trim();

                            renderPartyMembers(); 
                            
                            alert(`Data for ${build.name} fetched and basic details updated! Review and click "Save Party Changes" to make it permanent.`);
                            // closeModal(advancedCharacterModal); // Optionally close after successful fetch
                        }
                    }
                } else {
                    pathbuilderJsonOutput.textContent = `Error: Could not retrieve valid build data. Pathbuilder response: ${JSON.stringify(data, null, 2)}`;
                }
            } catch (error) {
                console.error('Error fetching Pathbuilder data:', error);
                pathbuilderJsonOutput.textContent = `Fetch Error: ${error.message}. The API might be down, the ID invalid, or there might be a CORS issue. Check console for more details.`;
            }
        });
    }

    // --- Delete Confirmation Modal Logic ---
    if (deleteConfirmModal) { // Ensure modal element exists
        if (closeDeleteConfirmModalBtn) closeDeleteConfirmModalBtn.addEventListener('click', closeDeleteConfirmModal);
        if (cancelDeleteCharacterBtn) cancelDeleteCharacterBtn.addEventListener('click', closeDeleteConfirmModal);
        if (confirmDeleteCharacterBtn) {
            confirmDeleteCharacterBtn.addEventListener('click', () => {
                if (memberIdToDelete && currentCampaignFullData && currentCampaignFullData.partyMembers) {
                    const memberToDelete = currentCampaignFullData.partyMembers.find(m => m.id === memberIdToDelete);
                    const memberName = memberToDelete ? memberToDelete.name : 'Character';

                    currentCampaignFullData.partyMembers = currentCampaignFullData.partyMembers.filter(m => m.id !== memberIdToDelete);
                    savePartyChanges(true); // Auto-save after delete
                    renderPartyMembers(); 
                    if (saveStatusParty) {
                         saveStatusParty.textContent = `"${memberName}" deleted and party changes saved.`;
                         setTimeout(() => {if(saveStatusParty) saveStatusParty.textContent = ""}, 4000);
                    }
                }
                closeDeleteConfirmModal();
            });
        }
    }

    function openDeleteConfirmModal(id, name) { // Simplified from memberId, memberName
        memberIdToDelete = id;
        if (deleteConfirmMessage) {
            deleteConfirmMessage.textContent = `Are you sure you want to delete "${name || 'this character'}"? This action will save all current party changes immediately.`;
        }
        if (deleteConfirmModal) openModal(deleteConfirmModal);
    }

    function closeDeleteConfirmModal() {
        if (deleteConfirmModal) closeModal(deleteConfirmModal);
        memberIdToDelete = null;
    }

    // --- Campaign and Party Loading ---
    function loadFullCampaignData(campaignName) {
        const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
        if (campaignDataString) {
            try {
                currentCampaignFullData = JSON.parse(campaignDataString);
                if (!currentCampaignFullData.homebrewAssets) currentCampaignFullData.homebrewAssets = { creatures: [], items: [], spells: [] };
                if (!currentCampaignFullData.partyMembers) currentCampaignFullData.partyMembers = [];
                if (!currentCampaignFullData.sessions) currentCampaignFullData.sessions = []; // Ensure sessions array

                currentCampaignFullData.partyMembers.forEach(member => { member.isExpanded = false; });

                originalLoadedCampaignName = currentCampaignFullData.name;
                if (campaignNameDisplay) campaignNameDisplay.textContent = `Party Management for: ${currentCampaignFullData.name}`;
                if (partyManagementContent) partyManagementContent.style.display = 'block';
                renderPartyMembers();
                return true;
            } catch (e) { /* ... error handling ... */ }
        }
        // Fallback if load fails
        openNoCampaignModal();
        if (partyManagementContent) partyManagementContent.style.display = 'none';
        if (campaignNameDisplay) campaignNameDisplay.textContent = `Party Management`;
        return false;
    }

    // Helper for expansion toggle
    const setupExpansionToggle = (cardElement, memberObject) => {
        const header = cardElement.querySelector('.party-member-header');
        const expandIcon = header ? header.querySelector('.expand-icon') : null;
        if (header && expandIcon) {
            header.addEventListener('click', (e) => {
                if (e.target.closest('input, label, select, button') && !e.target.classList.contains('expand-icon') && e.target !== header && !header.contains(e.target.closest('h3'))) {
                     return; // Don't toggle if click is on an interactive element within header (except icon/h3)
                }
                memberObject.isExpanded = !memberObject.isExpanded;
                cardElement.classList.toggle('expanded');
                //expandIcon.textContent = memberObject.isExpanded ? '▼' : '►';
            });
        }
    };

    function renderPartyMembers() {
        if (!partyMembersContainer || !currentCampaignFullData || !currentCampaignFullData.partyMembers) {
             if(partyMembersContainer) partyMembersContainer.innerHTML = '<p>No party members to display.</p>';
            return;
        }
        partyMembersContainer.innerHTML = ''; 

        if (currentCampaignFullData.partyMembers.length === 0) {
            partyMembersContainer.innerHTML = '<p>No party members yet. Click "Add New Party Member" to start!</p>';
        }

        currentCampaignFullData.partyMembers.forEach(member => {
            const card = document.createElement('div');
            card.className = 'party-member-card';
            if (member.isExpanded) card.classList.add('expanded');
            card.dataset.memberId = member.id;

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
                            <option value="Unknown" ${(!member.sex || member.sex === 'Unknown') ? 'selected' : ''}>Unknown</option>
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
                        <button class="btn btn-secondary advanced-btn">Advanced/Import</button>
                        <button class="btn btn-delete-member delete-member-btn">Delete</button>
                    </div>
                </div>
            `;
            
            setupExpansionToggle(card, member);
            
            card.querySelectorAll('input, select, textarea').forEach(inputEl => {
                const eventType = (inputEl.tagName.toLowerCase() === 'select' || inputEl.type === 'number') ? 'change' : 'input';
                inputEl.addEventListener(eventType, (e) => {
                    const field = e.target.dataset.field;
                    let value = e.target.value;
                    if (e.target.type === 'number') {
                        value = parseInt(value, 10);
                        if (isNaN(value)) { value = (field === 'level' && e.target.min) ? parseInt(e.target.min, 10) : 0; }
                    }
                    member[field] = value;
                    if (field === 'name') { 
                        const headerH3 = card.querySelector('.party-member-header h3');
                        if (headerH3) headerH3.textContent = value || 'Unnamed Character';
                    }
                });
            });

            const advancedBtn = card.querySelector('.advanced-btn');
            if (advancedBtn) advancedBtn.addEventListener('click', (e) => { e.stopPropagation(); openAdvancedModal(member.id); });
            
            const deleteBtn = card.querySelector('.delete-member-btn');
            if (deleteBtn) deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteConfirmModal(member.id, member.name); });
            
            partyMembersContainer.appendChild(card);
        });
    }

    if (addNewPartyMemberBtn) {
        addNewPartyMemberBtn.addEventListener('click', () => {
            if (!currentCampaignFullData) { alert("Please load a campaign first."); return; }
            if (!currentCampaignFullData.partyMembers) currentCampaignFullData.partyMembers = []; // Defensive
            
            const newMember = {
                id: generateUniqueId(),
                name: "New Character",
                ancestry: "", characterClass: "", level: 1, sex: "Unknown", age: "",
                deity: "", languages: "", notes: "", isExpanded: true 
            };
            currentCampaignFullData.partyMembers.push(newMember);
            renderPartyMembers();
            // Scroll to new member could be added here
            const newCard = partyMembersContainer.querySelector(`[data-member-id="${newMember.id}"]`);
            if(newCard) newCard.scrollIntoView({behavior: "smooth", block: "center"});
        });
    }

    // --- Save Party Changes ---
    function savePartyChanges(isTriggeredByDelete = false) {
        if (!currentCampaignFullData || !originalLoadedCampaignName) {
            if(saveStatusParty) { saveStatusParty.textContent = "No campaign loaded to save."; setTimeout(() => {if(saveStatusParty)saveStatusParty.textContent = ""}, 3000); }
            return;
        }
        setCookie(CAMPAIGN_DATA_PREFIX + originalLoadedCampaignName, JSON.stringify(currentCampaignFullData), 365);
        setCookie(LAST_VIEWED_CAMPAIGN_KEY, originalLoadedCampaignName, 365);
        
        if (saveStatusParty && !isTriggeredByDelete) {
            saveStatusParty.textContent = `Party changes for "${originalLoadedCampaignName}" saved!`;
            setTimeout(() => {if(saveStatusParty)saveStatusParty.textContent = ""}, 3000);
        }
        console.log("Party changes saved for campaign:", originalLoadedCampaignName);
    }

    if (savePartyChangesBtn) {
        savePartyChangesBtn.addEventListener('click', () => savePartyChanges(false));
    }

    // Ctrl+S Save Shortcut
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
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
            if(partyManagementContent) partyManagementContent.style.display = 'none';
            if(campaignNameDisplay) campaignNameDisplay.textContent = 'Party Management';
        }
    }

    initializePartyPage();

    // Consolidate window click listener for modals
    window.addEventListener('click', (event) => {
        if (noCampaignModalParty && event.target === noCampaignModalParty) closeNoCampaignModal();
        if (advancedCharacterModal && event.target === advancedCharacterModal) closeAdvancedModal();
        if (deleteConfirmModal && event.target === deleteConfirmModal) closeDeleteConfirmModal();
    });
});