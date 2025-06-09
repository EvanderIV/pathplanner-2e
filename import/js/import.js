document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const fileUploadSection = document.getElementById('fileUploadSection');
    const campaignFileInput = document.getElementById('campaignFileInput');
    const importPreviewContainer = document.getElementById('importPreviewContainer');
    const stickyFooter = document.getElementById('stickyFooter');
    const finishImportingBtn = document.getElementById('finishImportingBtn');
    
    // Preview Sections
    const campaignDetailsList = document.querySelector('#campaignDetailsPreview ul');
    const homebrewList = document.getElementById('homebrewList');
    const partyMemberList = document.getElementById('partyMemberList');
    const sessionList = document.getElementById('sessionList');

    // --- Data Storage ---
    let campaignDataToImport = null;

    // --- Storage Keys ---
    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    const CREATURE_DATA_PREFIX = 'ttrpgSuite_creature_';
    const ITEM_DATA_PREFIX = 'ttrpgSuite_item_';
    const SPELL_DATA_PREFIX = 'ttrpgSuite_spell_';

    // --- Helper Functions ---
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                try {
                    const decoded = decodeURIComponent(value);
                    return JSON.parse(decoded);
                } catch (e) {
                    return decodeURIComponent(value); // Return raw value if not JSON
                }
            }
        }
        return null;
    }

    function setCookie(name, value, days, isRawString = false) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        const encodedValue = isRawString ? encodeURIComponent(value) : encodeURIComponent(JSON.stringify(value));
        document.cookie = name + "=" + encodedValue + expires + "; path=/; SameSite=Lax";
    }

    // --- Core Logic ---
    function handleFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // The imported file should be the campaign object itself
                if (!data || !data.name) {
                    throw new Error("Invalid or corrupted campaign file. The file should be a single campaign object containing a 'name' property.");
                }
                
                campaignDataToImport = data;
                displayImportData(data);

            } catch (error) {
                alert(`Error reading file: ${error.message}`);
                console.error("Import Error:", error);
            }
        };
        reader.readAsText(file);
    }

    // --- Event Listeners for File Input and Drag-and-Drop ---
    fileUploadSection.addEventListener('click', () => {
        campaignFileInput.click();
    });

    campaignFileInput.addEventListener('change', (event) => {
        handleFile(event.target.files[0]);
    });

    fileUploadSection.addEventListener('dragover', (event) => {
        event.preventDefault();
        fileUploadSection.classList.add('drag-over');
    });

    fileUploadSection.addEventListener('dragleave', () => {
        fileUploadSection.classList.remove('drag-over');
    });

    fileUploadSection.addEventListener('drop', (event) => {
        event.preventDefault();
        fileUploadSection.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    function displayImportData(campaign) { // The data is the campaign object
        campaignDetailsList.innerHTML = '';
        homebrewList.innerHTML = '';
        partyMemberList.innerHTML = '';
        sessionList.innerHTML = '';

        // Populate Campaign Details
        campaignDetailsList.innerHTML = `
            <li><span>${campaign.name}</span><span class="detail-label">Campaign Name</span></li>
            <li><span>${campaign.genre || 'Not Specified'}</span><span class="detail-label">Genre</span></li>
            <li><span>${campaign.maturityRating || 'Not Specified'}</span><span class="detail-label">Maturity Rating</span></li>
        `;
        
        // Populate Homebrew Assets from within the campaign object
        const homebrew = campaign.homebrewAssets || { creatures: [], items: [], spells: [] };
        const allHomebrew = [
            ...(homebrew.creatures || []).map(c => ({ ...c, type: 'Creature' })),
            ...(homebrew.items || []).map(i => ({ ...i, type: 'Item' })),
            ...(homebrew.spells || []).map(s => ({ ...s, type: 'Spell' }))
        ];

        if (allHomebrew.length > 0) {
            allHomebrew.forEach(asset => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${asset.name}</span><span class="detail-label">${asset.type}</span>`;
                homebrewList.appendChild(li);
            });
        } else {
            homebrewList.innerHTML = '<li><span>No homebrew assets found in this campaign file.</span></li>';
        }

        // Populate Party and Sessions
        const party = campaign.partyMembers || [];
        if (party.length > 0) {
            party.forEach(member => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${member.name}</span><span class="detail-label">Level ${member.level || 1}</span>`;
                partyMemberList.appendChild(li);
            });
        } else {
            partyMemberList.innerHTML = '<li><span>No party members in this campaign.</span></li>';
        }

        const sessions = campaign.sessions || [];
        if (sessions.length > 0) {
            sessions.forEach(session => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${session.title}</span><span class="detail-label">${session.levelUps || 0} Level Ups</span>`;
                sessionList.appendChild(li);
            });
        } else {
            sessionList.innerHTML = '<li><span>No session notes in this campaign.</span></li>';
        }

        importPreviewContainer.style.display = 'block';
        stickyFooter.style.display = 'block';
        fileUploadSection.style.display = 'none';
    }

    // --- Uniqueness Check ---
    function getUniqueCampaignName(originalName) {
        let newName = originalName;
        let counter = 1;
        while (getCookie(CAMPAIGN_DATA_PREFIX + newName) !== null) {
            newName = `${originalName} (${counter})`;
            counter++;
        }
        return newName;
    }

    // --- Final Import Logic ---
    finishImportingBtn.addEventListener('click', () => {
        if (!campaignDataToImport) {
            alert("No campaign data loaded. Please select a file first.");
            return;
        }

        try {
            const importedData = campaignDataToImport;
            
            // 1. Ensure the campaign name is unique to prevent overwriting existing data.
            const uniqueCampaignName = getUniqueCampaignName(importedData.name);
            importedData.name = uniqueCampaignName;

            // 2. Deconstruct homebrew assets: save each to its own cookie and create ID manifests.
            const creatureIds = [];
            const itemIds = [];
            const spellIds = [];

            if (importedData.homebrewAssets) {
                // Process Creatures
                (importedData.homebrewAssets.creatures || []).forEach(creature => {
                    creatureIds.push(creature.id);
                    setCookie(`${CREATURE_DATA_PREFIX}${uniqueCampaignName}_${creature.id}`, creature, 365);
                });
                // Process Items
                (importedData.homebrewAssets.items || []).forEach(item => {
                    itemIds.push(item.id);
                    setCookie(`${ITEM_DATA_PREFIX}${uniqueCampaignName}_${item.id}`, item, 365);
                });
                // Process Spells
                (importedData.homebrewAssets.spells || []).forEach(spell => {
                    spellIds.push(spell.id);
                    setCookie(`${SPELL_DATA_PREFIX}${uniqueCampaignName}_${spell.id}`, spell, 365);
                });
            }
            
            // 3. Create the campaign "shell" object with manifests instead of full asset data.
            const campaignShellToSave = {
                name: importedData.name,
                description: importedData.description,
                genre: importedData.genre,
                maturityRating: importedData.maturityRating,
                partyMembers: importedData.partyMembers || [],
                sessions: importedData.sessions || [],
                homebrewAssets: {
                    creatures: creatureIds,
                    items: itemIds,
                    spells: spellIds
                }
            };
            
            // 4. Save the campaign shell and set it as the last viewed.
            setCookie(CAMPAIGN_DATA_PREFIX + uniqueCampaignName, campaignShellToSave, 365);
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, uniqueCampaignName, 365, true); // Save as raw string

            // 5. Alert the user and redirect to the newly imported campaign.
            //alert(`Campaign "${uniqueCampaignName}" and all its assets have been imported successfully!`);
            window.location.href = '../campaign'; 
            
        } catch (error) {
            alert(`A problem occurred while saving the imported data: ${error.message}`);
            console.error("Final Import Save Error:", error);
        }
    });
});