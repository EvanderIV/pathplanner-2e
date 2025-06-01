// index.js (for Campaign Details Page)
document.addEventListener('DOMContentLoaded', () => {
    const campaignForm = document.getElementById('campaignForm');
    const campaignNameInput = document.getElementById('campaignName');
    const campaignDescriptionInput = document.getElementById('campaignDescription');
    const campaignGenreInput = document.getElementById('campaignGenre');
    const maturityRatingInput = document.getElementById('maturityRating');
    const saveStatus = document.getElementById('saveStatus');

    const newUserModal = document.getElementById('newUserModal');
    const closeModalButton = newUserModal.querySelector('.close-button'); // Ensure this targets the correct modal
    const createNewCampaignBtn = document.getElementById('createNewCampaignBtn');
    const importCampaignBtn = document.getElementById('importCampaignBtn');

    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';

    let originalLoadedCampaignName = null; // To track the name of the loaded campaign for save/rename logic
    let loadedCampaignFullData = null;

    // --- Cookie Helper Functions ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        const encodedValue = value ? encodeURIComponent(JSON.stringify(value)) : ""; // Ensure complex objects are stringified
        document.cookie = name + "=" + encodedValue + expires + "; path=/; SameSite=Lax";
    }

    function setCookieHomeVer(name, value, days) {
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
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                try {
                    // Attempt to decode and parse, but return raw if it's not JSON
                    const decoded = decodeURIComponent(value);
                    try {
                        return JSON.parse(decoded); // If it's a JSON string, parse it
                    } catch (e) {
                        return decoded; // If not JSON, return the decoded string (for simple cookies like LAST_VIEWED_CAMPAIGN_KEY)
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
        console.log(`Attempted to delete cookie: ${name}`);
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
        console.log(`Attempting to load campaign: "${campaignName}"`);
        if (!campaignName || campaignName.trim() === "") {
            console.warn("LoadCampaign called with empty or null campaign name.");
            loadedCampaignFullData = null;
            originalLoadedCampaignName = null;
            return false;
        }
        const campaignDataCookieName = CAMPAIGN_DATA_PREFIX + campaignName;
        console.log(`Looking for campaign data cookie: "${campaignDataCookieName}"`);
        const campaignData = getCookie(campaignDataCookieName); // getCookie now returns a parsed object

        if (campaignData && typeof campaignData === 'object') { // Ensure it's a valid object
            // *** START FIX: Populate form inputs ***
            campaignNameInput.value = campaignData.name || '';
            campaignDescriptionInput.value = campaignData.description || '';
            campaignGenreInput.value = campaignData.genre || '';
            maturityRatingInput.value = campaignData.maturityRating || 'TV-14'; // Default if not set
            // *** END FIX ***

            document.title = `${campaignData.name || 'Campaign'} - Campaign Details`;

            if (!campaignData.partyMembers) { // Initialize if not present
                campaignData.partyMembers = [];
            }
            if (!campaignData.sessions) {
                campaignData.sessions = [];
            }
            loadedCampaignFullData = campaignData; // Store the full data

            originalLoadedCampaignName = campaignData.name;
            console.log('Campaign loaded successfully:', campaignData.name, 'Original name set to:', originalLoadedCampaignName);
            return true;
        } else {
            console.warn(`Campaign data not found or not an object for cookie: "${campaignDataCookieName}". Data:`, campaignData);
            if(campaignForm) campaignForm.reset(); // Clear form if data is invalid/missing
            document.title = 'Campaign Details';
            loadedCampaignFullData = null;
            originalLoadedCampaignName = null;
            return false;
        }
    }

    function saveCampaign() {
        const currentCampaignNameFromInput = campaignNameInput.value.trim();
        if (!currentCampaignNameFromInput) {
            alert('Campaign Name is required.');
            campaignNameInput.focus();
            return;
        }

        const campaignDataToSave = {
            name: currentCampaignNameFromInput,
            description: campaignDescriptionInput.value.trim(),
            genre: campaignGenreInput.value.trim(),
            maturityRating: maturityRatingInput.value,
            // Preserve existing party members or initialize if they don't exist
            partyMembers: (loadedCampaignFullData && loadedCampaignFullData.partyMembers) ? loadedCampaignFullData.partyMembers : [],
            sessions: loadedCampaignFullData ? loadedCampaignFullData.sessions : []
        };

        if (originalLoadedCampaignName && originalLoadedCampaignName !== currentCampaignNameFromInput) {
            deleteCookie(CAMPAIGN_DATA_PREFIX + originalLoadedCampaignName);
            console.log(`Campaign Renamed: Deleted old cookie for "${originalLoadedCampaignName}". New name: "${currentCampaignNameFromInput}"`);
        } else if (!originalLoadedCampaignName) {
            console.log(`Saving new campaign: "${currentCampaignNameFromInput}"`);
        } else {
            console.log(`Saving existing campaign (no rename): "${currentCampaignNameFromInput}"`);
        }

        setCookie(CAMPAIGN_DATA_PREFIX + currentCampaignNameFromInput, campaignDataToSave, 365);
        setCookieHomeVer(LAST_VIEWED_CAMPAIGN_KEY, currentCampaignNameFromInput, 365); // LAST_VIEWED_CAMPAIGN_KEY stores only the name string
        
        loadedCampaignFullData = campaignDataToSave;
        originalLoadedCampaignName = currentCampaignNameFromInput;
        document.title = `${currentCampaignNameFromInput} - Campaign Details`;

        saveStatus.textContent = `Campaign "${currentCampaignNameFromInput}" saved successfully!`;
        console.log('Campaign saved with data:', campaignDataToSave);
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }

    // --- Event Listeners ---
    if (campaignForm) {
        campaignForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveCampaign();
        });
    }

    document.addEventListener('keydown', function(event) {
        // Check for Ctrl+S or Cmd+S
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault(); // Prevent the browser's default save action
            console.log('Ctrl+S pressed, attempting to save campaign...');
            saveCampaign();
        }
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

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

            loadedCampaignFullData = { // Initialize with empty party for a new campaign
                name: '',
                description: '',
                genre: '',
                maturityRating: 'TV-14',
                partyMembers: [],
                sessions: []
            };
            originalLoadedCampaignName = null;

            closeModal();

            // Clear the last viewed campaign cookie to signify a "new" state,
            // or set it to a temporary placeholder if you want the new, unsaved campaign to be "active"
            deleteCookie(LAST_VIEWED_CAMPAIGN_KEY); // Or setCookie(LAST_VIEWED_CAMPAIGN_KEY, '', 365) if an empty string represents the new one
            if(saveStatus) saveStatus.textContent = 'Ready to create a new campaign.';
            setTimeout(() => { if(saveStatus) saveStatus.textContent = ''; }, 3000);
        });
    }

    if (importCampaignBtn) {
        importCampaignBtn.addEventListener('click', () => {
            alert('Import functionality is not yet implemented in this demo. You can manually create a campaign.');
            console.log('Import campaign clicked - feature placeholder.');
            closeModal();
        });
    }

    // --- Initial Page Load ---
    function initializePage() {
        const lastViewedCampaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY); // This will be a string or null
        console.log(`Last viewed campaign name from cookie: "${lastViewedCampaignName}"`);

        if (lastViewedCampaignName && typeof lastViewedCampaignName === 'string' && lastViewedCampaignName.trim() !== "") {
            if (!loadCampaign(lastViewedCampaignName)) {
                console.warn(`Could not load campaign data for "${lastViewedCampaignName}". Modal will be shown.`);
                deleteCookie(LAST_VIEWED_CAMPAIGN_KEY); // Clear invalid last viewed key
                openModal();
            } else {
                console.log(`Campaign "${lastViewedCampaignName}" loaded. Modal should NOT be shown.`);
                closeModal();
            }
        } else {
            if (lastViewedCampaignName === null) {
                console.log('No last viewed campaign key found. Modal will be shown.');
            } else {
                console.log('Last viewed campaign key was empty or not a string. Modal will be shown.');
            }
            if(campaignForm) campaignForm.reset(); // Ensure form is clear if no campaign is loaded
            document.title = `New Campaign - Campaign Details`; // Or 'Campaign Details' if you prefer
            loadedCampaignFullData = null; // Explicitly set no campaign data
            originalLoadedCampaignName = null;
            openModal();
        }
    }

    initializePage();

});