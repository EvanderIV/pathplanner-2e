// index.js (for Campaign Details Page)
document.addEventListener('DOMContentLoaded', () => {
    const campaignForm = document.getElementById('campaignForm');
    const campaignNameInput = document.getElementById('campaignName');
    const campaignDescriptionInput = document.getElementById('campaignDescription');
    const campaignGenreInput = document.getElementById('campaignGenre');
    const maturityRatingInput = document.getElementById('maturityRating');
    const saveStatus = document.getElementById('saveStatus');

    const exportCampaignBtn = document.getElementById('exportCampaignBtn');

    const newUserModal = document.getElementById('newUserModal');
    const closeModalButton = newUserModal.querySelector('.close-button'); // Ensure this targets the correct modal
    const createNewCampaignBtn = document.getElementById('createNewCampaignBtn');
    const importCampaignBtn = document.getElementById('importCampaignBtn');

    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    const CREATURE_DATA_PREFIX = 'ttrpgSuite_creature_';
    const ITEM_DATA_PREFIX = 'ttrpgSuite_item_';
    const SPELL_DATA_PREFIX = 'ttrpgSuite_spell_';

    let originalLoadedCampaignName = null; // To track the name of the loaded campaign for save/rename logic
    let loadedCampaignFullData = null;

    // --- Cookie Helper Functions ---
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
                    try {
                        return JSON.parse(decoded); // If it's a JSON string, parse it
                    } catch (e) {
                        return decoded; // If not JSON, return the decoded string
                    }
                } catch (e) {
                    console.error('Error decoding cookie value:', value, e);
                    return value; // Return raw value on decoding error
                }
            }
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    }

    // --- Modal Logic ---
    function openModal() {
        if(newUserModal) newUserModal.style.display = 'block';
    }

    function closeModal() {
        if(newUserModal) newUserModal.style.display = 'none';
    }


    // --- Campaign Logic ---
    function loadCampaign(campaignName) {
        if (!campaignName || campaignName.trim() === "") return false;
        
        const campaignData = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);

        if (campaignData && typeof campaignData === 'object') {
            campaignNameInput.value = campaignData.name || '';
            campaignDescriptionInput.value = campaignData.description || '';
            campaignGenreInput.value = campaignData.genre || '';
            maturityRatingInput.value = campaignData.maturityRating || 'TV-14';
            document.title = `${campaignData.name || 'Campaign'} - Campaign Details`;

            if (!campaignData.partyMembers) campaignData.partyMembers = [];
            if (!campaignData.sessions) campaignData.sessions = [];
            
            // Ensure homebrew storage object (manifest) exists for backward compatibility
            if (!campaignData.homebrewAssets) {
                campaignData.homebrewAssets = { creatures: [], items: [], spells: [] };
            }
            if (!Array.isArray(campaignData.homebrewAssets.creatures)) campaignData.homebrewAssets.creatures = [];
            if (!Array.isArray(campaignData.homebrewAssets.items)) campaignData.homebrewAssets.items = [];
            if (!Array.isArray(campaignData.homebrewAssets.spells)) campaignData.homebrewAssets.spells = [];
            
            loadedCampaignFullData = campaignData;
            originalLoadedCampaignName = campaignData.name;
            return true;
        } else {
            return false;
        }
    }

    function saveCampaign() {
        const currentCampaignNameFromInput = campaignNameInput.value.trim();
        if (!currentCampaignNameFromInput) {
            alert('Campaign Name is required.');
            return;
        }

        // Preserve all parts of the campaign data. homebrewAssets will contain the ID manifests.
        const campaignDataToSave = {
            name: currentCampaignNameFromInput,
            description: campaignDescriptionInput.value.trim(),
            genre: campaignGenreInput.value.trim(),
            maturityRating: maturityRatingInput.value,
            partyMembers: (loadedCampaignFullData && loadedCampaignFullData.partyMembers) ? loadedCampaignFullData.partyMembers : [],
            sessions: (loadedCampaignFullData && loadedCampaignFullData.sessions) ? loadedCampaignFullData.sessions : [],
            homebrewAssets: (loadedCampaignFullData && loadedCampaignFullData.homebrewAssets) ? loadedCampaignFullData.homebrewAssets : { creatures: [], items: [], spells: [] }
        };

        // If the campaign has been renamed, we must also rename all its associated asset cookies.
        const isRename = originalLoadedCampaignName && originalLoadedCampaignName !== currentCampaignNameFromInput;
        if (isRename) {
            console.log(`Campaign renamed from "${originalLoadedCampaignName}" to "${currentCampaignNameFromInput}". Migrating asset cookies...`);
            const assetManifest = campaignDataToSave.homebrewAssets || {};
            const migrateAssetType = (ids, typePrefix) => {
                (ids || []).forEach(id => {
                    const oldCookieName = `${typePrefix}${originalLoadedCampaignName}_${id}`;
                    const assetData = getCookie(oldCookieName);
                    if (assetData) {
                        const newCookieName = `${typePrefix}${currentCampaignNameFromInput}_${id}`;
                        setCookie(newCookieName, assetData, 365);
                        deleteCookie(oldCookieName);
                    }
                });
            };

            migrateAssetType(assetManifest.creatures, CREATURE_DATA_PREFIX);
            migrateAssetType(assetManifest.items, ITEM_DATA_PREFIX);
            migrateAssetType(assetManifest.spells, SPELL_DATA_PREFIX);

            // Delete the old main campaign cookie after migrating assets.
            deleteCookie(CAMPAIGN_DATA_PREFIX + originalLoadedCampaignName);
        }

        setCookie(CAMPAIGN_DATA_PREFIX + currentCampaignNameFromInput, campaignDataToSave, 365);
        setCookie(LAST_VIEWED_CAMPAIGN_KEY, currentCampaignNameFromInput, 365, true); // Save as raw string
        
        loadedCampaignFullData = campaignDataToSave;
        originalLoadedCampaignName = currentCampaignNameFromInput;
        document.title = `${currentCampaignNameFromInput} - Campaign Details`;

        saveStatus.textContent = `Campaign "${currentCampaignNameFromInput}" saved successfully!`;
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
    
    function exportCampaign() {
        if (!loadedCampaignFullData || !loadedCampaignFullData.name) {
            alert("Please save the campaign before exporting.");
            return;
        }
        
        // 1. Create a deep clone of the campaign "shell" (which contains the asset ID manifests).
        const exportData = JSON.parse(JSON.stringify(loadedCampaignFullData));
        const campaignName = exportData.name;

        // 2. "Re-hydrate" the homebrew assets by fetching data from individual cookies.
        if (exportData.homebrewAssets) {
            const rehydrate = (ids, typePrefix) => {
                if (!Array.isArray(ids)) return [];
                return ids.map(id => {
                    const assetData = getCookie(`${typePrefix}${campaignName}_${id}`);
                    return assetData || { id: id, name: "Error: Asset data not found", error: true };
                }).filter(asset => asset && !asset.error);
            };
            
            exportData.homebrewAssets.creatures = rehydrate(exportData.homebrewAssets.creatures, CREATURE_DATA_PREFIX);
            exportData.homebrewAssets.items = rehydrate(exportData.homebrewAssets.items, ITEM_DATA_PREFIX);
            exportData.homebrewAssets.spells = rehydrate(exportData.homebrewAssets.spells, SPELL_DATA_PREFIX);
        }

        // 3. Recursively remove the 'isExpanded' UI state property from all nested objects for a clean export.
        const cleanIsExpanded = (obj) => {
            if (obj && typeof obj === 'object') {
                delete obj.isExpanded;
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        cleanIsExpanded(obj[key]);
                    }
                }
            }
        };
        cleanIsExpanded(exportData);

        // 4. Stringify the now fully-hydrated campaign object and trigger the download.
        const campaignJson = JSON.stringify(exportData, null, 2); // Using indentation for readability
        const blob = new Blob([campaignJson], { type: 'application/json' });
        const filename = `${campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pathplanner.json`;
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);

        saveStatus.textContent = `Full campaign exported as "${filename}"!`;
        setTimeout(() => { saveStatus.textContent = ''; }, 4000);
    }

    function importCampaign() {
        // This function now redirects to the dedicated import page for a better UI.
        window.location.href = '../import'; // Assumes an /import/index.html page exists.
    }

    // --- Event Listeners ---
    if (campaignForm) {
        campaignForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveCampaign();
        });
    }

    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            saveCampaign();
        }
    });

    if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
    if (exportCampaignBtn) exportCampaignBtn.addEventListener('click', exportCampaign);
    if (importCampaignBtn) importCampaignBtn.addEventListener('click', importCampaign);

    window.addEventListener('click', (event) => {
        if (newUserModal && event.target === newUserModal) {
            closeModal();
        }
    });

    if (createNewCampaignBtn) {
        createNewCampaignBtn.addEventListener('click', () => {
            if(campaignForm) campaignForm.reset();
            campaignNameInput.value = '';
            campaignDescriptionInput.value = '';
            campaignGenreInput.value = '';
            maturityRatingInput.value = 'TV-14';
            campaignNameInput.focus();
            document.title = `New Campaign - Campaign Details`;

            // Initialize a new campaign object with all necessary structures, including homebrew.
            loadedCampaignFullData = {
                name: '',
                description: '',
                genre: '',
                maturityRating: 'TV-14',
                partyMembers: [],
                sessions: [],
                homebrewAssets: { creatures: [], items: [], spells: [] }
            };
            originalLoadedCampaignName = null;
            closeModal();
            deleteCookie(LAST_VIEWED_CAMPAIGN_KEY);
            if(saveStatus) saveStatus.textContent = 'Ready to create a new campaign.';
            setTimeout(() => { if(saveStatus) saveStatus.textContent = ''; }, 3000);
        });
    }

    // --- Initial Page Load ---
    function initializePage() {
        const lastViewedCampaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (lastViewedCampaignName && typeof lastViewedCampaignName === 'string' && lastViewedCampaignName.trim() !== "") {
            if (!loadCampaign(lastViewedCampaignName)) {
                deleteCookie(LAST_VIEWED_CAMPAIGN_KEY);
                openModal();
            } else {
                closeModal();
            }
        } else {
            if(campaignForm) campaignForm.reset();
            document.title = `New Campaign - Campaign Details`;
            loadedCampaignFullData = null;
            originalLoadedCampaignName = null;
            openModal();
        }
    }

    initializePage();

});