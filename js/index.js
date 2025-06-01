document.addEventListener('DOMContentLoaded', () => {
    const campaignListContainer = document.getElementById('campaignListContainer');

    // Modal elements for home page
    const noCampaignsModal = document.getElementById('noCampaignsModal');
    const closeModalButtonHome = noCampaignsModal.querySelector('.close-button');
    const modalCreateNewCampaignBtn = document.getElementById('modalCreateNewCampaignBtn');
    const modalImportCampaignBtn = document.getElementById('modalImportCampaignBtn');

    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';

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

    function getAllCampaignNames() {
        const campaigns = [];
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name] = cookie.split('=');
            const trimmedName = name.trim();
            if (trimmedName.startsWith(CAMPAIGN_DATA_PREFIX)) {
                campaigns.push(trimmedName.substring(CAMPAIGN_DATA_PREFIX.length));
            }
        }
        return campaigns;
    }

    // --- Modal Logic for Home Page---
    function openNoCampaignsModal() {
        if(noCampaignsModal) noCampaignsModal.style.display = 'block';
    }

    function closeNoCampaignsModal() {
        if(noCampaignsModal) noCampaignsModal.style.display = 'none';
    }

    function displayCampaigns(campaignNames) {
        if (campaignNames.length === 0) {
            openNoCampaignsModal();
            campaignListContainer.innerHTML = '';
            return;
        }

        closeNoCampaignsModal();
        const ul = document.createElement('ul');
        ul.className = 'campaign-list';

        campaignNames.forEach(name => {
            const li = document.createElement('li');
            li.className = 'campaign-item';

            const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + name);
            let description = "No description available.";
            let genre = "N/A";
            if (campaignDataString) {
                try {
                    const campaignData = JSON.parse(campaignDataString);
                    description = campaignData.description ? (campaignData.description.substring(0, 100) + (campaignData.description.length > 100 ? '...' : '')) : "No description.";
                    genre = campaignData.genre || "N/A";
                } catch (e) {
                    console.warn("Could not parse campaign data for:", name);
                }
            }

            li.innerHTML = `
                <div class="campaign-item-content">
                    <h3 class="campaign-title">${name}</h3>
                    <p class="campaign-genre">Genre: ${genre}</p>
                    <p class="campaign-description">${description}</p>
                </div>
                <button class="btn campaign-select-btn">View Details</button>
            `;

            const selectButton = li.querySelector('.campaign-select-btn');
            selectButton.addEventListener('click', (event) => {
                event.stopPropagation();
                setCookie(LAST_VIEWED_CAMPAIGN_KEY, name, 365);
                window.location.href = 'campaign';
            });
            
            li.addEventListener('click', () => {
                setCookie(LAST_VIEWED_CAMPAIGN_KEY, name, 365);
                window.location.href = 'campaign';
            });

            ul.appendChild(li);
        });
        campaignListContainer.innerHTML = '';
        campaignListContainer.appendChild(ul);
    }

    // --- Event Listeners for Modal on Home page ---
    if(closeModalButtonHome) {
        closeModalButtonHome.addEventListener('click', closeNoCampaignsModal);
    }

    if(modalCreateNewCampaignBtn) {
        modalCreateNewCampaignBtn.addEventListener('click', () => {
            // 1. Create a dummy campaign
            // To make it slightly unique if created multiple times without saving,
            // we could append a timestamp, but for simplicity, "New Campaign" is fine.
            // The user is expected to rename it.
            const newCampaignName = "New Campaign";
            const dummyCampaignData = {
                name: newCampaignName,
                description: "My new adventure begins here...",
                genre: "Fantasy",
                maturityRating: "TV-14",
                partyMembers: []
            };

            // 2. Save dummy campaign to cookies
            setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, JSON.stringify(dummyCampaignData), 365);
            
            // 3. Set it as the most recently viewed
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365);

            // 4. Redirect to campaign details page
            window.location.href = 'campaign';
        });
    }

    if(modalImportCampaignBtn) {
        modalImportCampaignBtn.addEventListener('click', () => {
            alert('Import functionality is not yet implemented in this demo. Please create a new campaign on the Campaign Details page.');
            closeNoCampaignsModal();
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === noCampaignsModal) {
            closeNoCampaignsModal();
        }
    });


    // --- Initial Page Load ---
    function initializeHomePage() {
        const campaignNames = getAllCampaignNames();
        displayCampaigns(campaignNames);
    }

    initializeHomePage();
});