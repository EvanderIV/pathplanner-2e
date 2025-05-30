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
        const encodedValue = value ? encodeURIComponent(value) : "";
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
                    return decodeURIComponent(value);
                } catch (e) {
                    console.error('Error decoding cookie value:', value, e);
                    return value;
                }
            }
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
        console.log(`Attempted to delete cookie: ${name}`);
    }

    // --- Modal Logic --- (Ensure these are defined if not already)
    function openModal() {
        if(newUserModal) newUserModal.style.display = 'block';
    }

    function closeModal() {
        if(newUserModal) newUserModal.style.display = 'none';
    }


    // --- Campaign Logic ---
    function loadCampaign(campaignName) {
        console.log(`Attempting to load campaign: "${campaignName}"`);
        const campaignDataCookieName = CAMPAIGN_DATA_PREFIX + campaignName;
        console.log(`Looking for campaign data cookie: "${campaignDataCookieName}"`);
        const campaignDataString = getCookie(campaignDataCookieName);

        if (campaignDataString) {
            try {
                const campaignData = JSON.parse(campaignDataString);
                // ... (populate form inputs) ...
                document.title = `${campaignData.name || 'Campaign'} - Campaign Details`;
                
                if (!campaignData.partyMembers) { // Initialize if not present
                    campaignData.partyMembers = [];
                }
                loadedCampaignFullData = campaignData; // Store the full data, including partyMembers
                
                originalLoadedCampaignName = campaignData.name;
                console.log('Campaign loaded successfully:', campaignData.name, 'Original name set to:', originalLoadedCampaignName);
                return true;
            } catch (e) {
                // ... (error handling) ...
                loadedCampaignFullData = null; // Reset on error
                originalLoadedCampaignName = null;
                return false;
            }
        } else {
            // ... (cookie not found handling) ...
            loadedCampaignFullData = null; // Reset if not found
            originalLoadedCampaignName = null;
            return false;
        }
    }

    function saveCampaign() {
        const currentCampaignNameFromInput = campaignNameInput.value.trim(); // Name currently in the input field
        if (!currentCampaignNameFromInput) {
            alert('Campaign Name is required.');
            campaignNameInput.focus();
            return;
        }

        const campaignDataToSave = { // Use a distinct variable name
            name: currentCampaignNameFromInput,
            description: campaignDescriptionInput.value.trim(),
            genre: campaignGenreInput.value.trim(),
            maturityRating: maturityRatingInput.value,
            partyMembers: loadedCampaignFullData ? loadedCampaignFullData.partyMembers : [] // Preserve existing party members
        };

        // Check if an existing campaign was loaded and if its name has been changed
        if (originalLoadedCampaignName && originalLoadedCampaignName !== currentCampaignNameFromInput) {
            // This means the campaign is being RENAMED.
            // Delete the cookie associated with the old campaign name.
            deleteCookie(CAMPAIGN_DATA_PREFIX + originalLoadedCampaignName); //
            console.log(`Campaign Renamed: Deleted old cookie for "${originalLoadedCampaignName}". New name: "${currentCampaignNameFromInput}"`);
        } else if (!originalLoadedCampaignName) {
            // This is a brand new campaign being saved for the first time from this page
            console.log(`Saving new campaign: "${currentCampaignNameFromInput}"`);
        } else {
            // This is saving an existing campaign without a name change
            console.log(`Saving existing campaign (no rename): "${currentCampaignNameFromInput}"`);
        }

        // Save the campaign data under the current (possibly new) name
        setCookie(CAMPAIGN_DATA_PREFIX + currentCampaignNameFromInput, JSON.stringify(campaignDataToSave), 365);
        // Update the last viewed campaign key to the current (possibly new) name
        setCookie(LAST_VIEWED_CAMPAIGN_KEY, currentCampaignNameFromInput, 365);

        loadedCampaignFullData = campaignDataToSave; // Update the stored full data after saving
        originalLoadedCampaignName = currentCampaignNameFromInput;
        document.title = `${currentCampaignNameFromInput} - Campaign Details`;

        saveStatus.textContent = `Campaign "${currentCampaignNameFromInput}" saved successfully!`;
        console.log('Campaign saved with data:', campaignData);
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }

    // --- Event Listeners ---
    if (campaignForm) {
        campaignForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveCampaign();
        });
    }

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
            
            document.title = `New Campaign - Campaign Details`;

            loadedCampaignFullData = { // Initialize with empty party for a new campaign from this modal
                name: '', // Will be filled by user input before saving
                description: '',
                genre: '',
                maturityRating: 'TV-14',
                partyMembers: []
            };
            originalLoadedCampaignName = null; // This is a new campaign

            closeModal();
            
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, '', -1); 
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
        const lastViewedCampaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        console.log(`Last viewed campaign name from cookie: "${lastViewedCampaignName}"`);

        if (lastViewedCampaignName && lastViewedCampaignName.trim() !== "") {
            if (!loadCampaign(lastViewedCampaignName)) {
                console.warn(`Could not load campaign data for "${lastViewedCampaignName}". Modal will be shown.`);
                setCookie(LAST_VIEWED_CAMPAIGN_KEY, '', -1);
                openModal();
            } else {
                console.log(`Campaign "${lastViewedCampaignName}" loaded. Modal should NOT be shown.`);
                closeModal(); 
            }
        } else {
            if (lastViewedCampaignName === null) {
                console.log('No last viewed campaign key found. Modal will be shown.');
            } else {
                console.log('Last viewed campaign key was empty. Modal will be shown.');
            }
            originalLoadedCampaignName = null; // No campaign loaded initially
            openModal();
        }
    }

    initializePage();

    // Navigation highlighting
    const navLinks = document.querySelectorAll('.top-bar nav ul li a');
    // Correctly identify the current page for Campaign Details
    // Assuming index.html is the Campaign Details page.
    const campaignDetailsPath = 'index.html'; 
    const currentPath = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentPath && currentPath === campaignDetailsPath) {
            link.classList.add('active');
        } else if (link.getAttribute('href') === '' && currentPath === campaignDetailsPath) { // Fallback if path check is tricky
             link.classList.add('active');
        }
    });
     // More specific for campaign details page:
     document.querySelectorAll('.top-bar nav ul li a').forEach(link => {
        if (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === 'campaign') { // Considering the original href
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });


});