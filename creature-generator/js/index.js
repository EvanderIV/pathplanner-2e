document.addEventListener('DOMContentLoaded', () => {

    let currentEditingCreatureIdFromURL = null;

    // --- DOM Elements ---
    const creatureForm = document.getElementById('creatureForm');
    const creatureNameInput = document.getElementById('creatureName');
    const randomNameBtn = document.getElementById('randomNameBtn');
    const creatureLevelInput = document.getElementById('creatureLevel');
    const currentLevelDisplay = document.getElementById('currentLevelDisplay');
    
    const isMagicalSelect = document.getElementById('isMagical');
    const magicalStatsContainer = document.getElementById('magicalStatsContainer');

    const suggestionsPanelContent = document.getElementById('suggestionsContent');
    const saveCreatureBtn = document.getElementById('saveCreatureBtn');
    const saveStatusCreature = document.getElementById('saveStatusCreature');

    // Incomplete Save Modal
    const incompleteCreatureModal = document.getElementById('incompleteCreatureModal');
    const closeIncompleteModalBtn = document.getElementById('closeIncompleteModalBtn');
    const confirmSaveIncompleteBtn = document.getElementById('confirmSaveIncompleteBtn');
    const cancelSaveIncompleteBtn = document.getElementById('cancelSaveIncompleteBtn');

    const creatureGeneratorPageContent = document.getElementById('creatureGeneratorPageContent'); // Wrapper for main content

    // No Campaign Loaded Modal Elements
    const noCampaignModalCreatureGen = document.getElementById('newUserModal');
    const closeNoCampaignModalCreatureGenBtn = noCampaignModalCreatureGen.querySelector('.close-button');
    const modalCreateNewCampaignBtnCreatureGen = document.getElementById('createNewCampaignBtn');
    const modalImportCampaignBtnCreatureGen = document.getElementById('importCampaignBtn');


    // --- Cookie Constants ---
    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    const HOMEBREW_CREATURES_KEY = 'ttrpgSuite_homebrewCreatures';

    // --- Creature Stat Data (Ported from DMA.java) ---
    // Note: Java array index = level + 1. So level -1 is index 0.
    const DCREATURE_DATA = {
        attrMod: {
            Low: [0,0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7],
            Moderate: [2,2,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,8,8,9],
            High: [3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,10,10,12],
            Extreme: [4,4,5,5,5,6,6,7,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,12,12,13]
        },
        perception: {
            Terrible: [0,1,2,3,4,6,7,8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32],
            Low: [2,3,4,5,6,8,9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36],
            Moderate: [5,6,7,8,9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38],
            High: [8,9,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42],
            Extreme: [9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46],
            Obscene: [10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46,49]
        },
        skills: { // Assuming same tiers as perception based on Java structure
            Terrible: [1,2,3,4,5,7,8,9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33],
            Low: [2,3,4,5,7,8,10,11,13,14,16,17,19,20,22,23,25,26,28,29,31,32,34,35,36,38],
            Moderate: [4,5,6,7,9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,38,40],
            High: [5,6,7,8,10,12,13,15,17,18,20,22,23,25,27,28,30,32,33,35,37,38,40,42,43,45],
            Extreme: [8,9,10,11,13,15,16,18,20,21,23,25,26,28,30,31,33,35,36,38,40,41,43,45,46,48],
            Obscene: [10,11,13,15,16,18,20,21,23,25,26,28,30,31,33,35,36,38,40,41,43,45,46,48,51,55]
        },
        armorClass: {
            Terrible: [10,11,12,13,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45],
            Low: [12,13,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48],
            Moderate: [14,15,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44,45,47,48,50],
            High: [15,16,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51],
            Extreme: [18,19,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51,52,54],
            Obscene: [19,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51,52,54,58]
        },
        savingThrows: { // Assuming same tiers as perception
            Terrible: [0,1,2,3,4,6,7,8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32],
            Low: [2,3,4,5,6,8,9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36],
            Moderate: [5,6,7,8,9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38],
            High: [8,9,10,11,12,14,16,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42],
            Extreme: [9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46],
            Obscene: [10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46,48]
        },
        hitPoints: {
            Terrible: [2,5,11,14,21,31,42,53,67,82,97,112,127,142,157,172,187,202,217,232,247,262,277,295,317,339],
            Low: [5,11,14,21,31,42,53,67,82,97,112,127,142,157,172,187,202,217,232,247,262,277,295,317,339,367],
            Moderate: [7,14,19,28,42,57,72,91,111,131,151,171,191,211,231,251,271,291,311,331,351,371,395,424,454,492],
            High: [9,17,24,36,53,72,91,115,140,165,190,215,240,265,290,315,340,365,390,415,440,465,495,532,569,617],
            Extreme: [17,24,36,53,72,91,115,140,165,190,215,240,265,290,315,340,365,390,415,440,465,495,532,569,617,665]
        },
        resistAndWeak: { // For value of resist/weakness
            Low: [1,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,9,9,10,10,11,11,12,12,13,13],
            Moderate: [1,2,2,3,4,5,6,7,7,8,9,10,11,11,11,12,13,14,14,15,16,16,17,18,19,20],
            High: [1,3,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,19,20,21,22,23,24,25,26]
        },
        speed: { // Java uses single values, not arrays by level. We'll make tiers point to these.
            Low: 20, Moderate: 25, High: 30, Extreme: 35
        },
        strikeAtkBonus: {
            Terrible: [3,4,4,5,7,8,9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,34],
            Low: [4,4,5,7,8,9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,35,36],
            Moderate: [6,6,7,9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42],
            High: [8,8,9,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,49,41,42,44], // Typo in Java data (49), should be 39 or 40. Assuming 39 for now.
            Extreme: [10,10,11,13,14,16,17,19,20,22,23,25,27,28,29,31,32,34,35,37,38,40,41,43,44,46],
            Obscene: [10,11,13,14,16,17,19,20,22,23,25,27,28,29,31,32,34,35,37,38,40,41,43,44,46,48]
        },
        strikeDmg: { // String values
            Low: ["1d4 (2)","1d4+1 (3)","1d4+2 (4)","1d6+3 (6)","1d6+5 (8)","2d4+4 (9)","2d4+6 (11)","2d4+7 (12)","2d6+6 (13)","2d6+8 (15)","2d6+9 (16)","2d6+10 (17)","2d8+10 (19)","3d6+10 (20)","3d6+11 (21)","3d6+13 (23)","3d6+14 (24)","3d6+15 (25)","3d6+16 (26)","3d6+17 (27)","4d6+14 (28)","4d6+15 (29)","4d6+17 (31)","4d6+18 (32)","4d6+19 (33)","4d6+21 (35)"],
            Moderate: ["1d4 (3)","1d4+2 (4)","1d6+2 (5)","1d8+4 (8)","1d8+6 (10)","2d6+5 (12)","2d6+6 (13)","2d6+8 (15)","2d8+8 (17)","2d8+9 (18)","2d8+11 (20)","2d10+11 (22)","2d10+12 (23)","3d8+12 (25)","3d8+14 (27)","3d8+15 (28)","3d10+14 (30)","3d10+15 (31)","3d10+16 (32)","3d10+17 (33)","4d8+17 (35)","4d8+19 (37)","4d8+20 (38)","4d8+22 (40)","4d10+20 (42)","4d10+22 (44)"],
            High: ["1d4+1 (3)","1d6+2 (5)","1d6+3 (6)","1d10+4 (9)","1d10+6 (12)","2d8+5 (14)","2d8+7 (16)","2d8+9 (18)","2d10+9 (20)","2d10+11 (22)","2d10+13 (24)","2d12+13 (26)","2d12+15 (28)","3d10+14 (30)","3d10+16 (32)","3d10+18 (34)","3d12+17 (36)","3d12+18 (37)","3d12+19 (38)","3d12+20 (40)","4d10+20 (42)","4d10+22 (44)","4d10+24 (46)","4d10+26 (48)","4d12+24 (50)","4d12+26 (52)"],
            Extreme: ["1d6+1 (4)","1d6+3 (6)","1d8+4 (8)","1d12+4 (11)","1d12+8 (15)","2d10+7 (18)","2d12+7 (20)","2d12+10 (23)","2d12+12 (25)","2d12+15 (28)","2d12+17 (30)","2d12+20 (33)","2d12+22 (35)","3d12+19 (38)","3d12+21 (40)","3d12+24 (43)","3d12+26 (45)","3d12+29 (48)","3d12+31 (50)","3d12+34 (53)","4d12+29 (55)","4d12+32 (58)","4d12+34 (60)","4d12+37 (63)","4d12+39 (65)","4d12+42 (68)"]
        },
        spellDC: {
            Moderate: [13,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37,38,39,41,42,43,45],
            High: [16,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40,41,42,44,45,46,48],
            Extreme: [19,19,20,22,23,25,26,27,29,30,32,33,34,36,37,39,40,41,43,44,46,47,48,50,51,52]
        },
        spellAtkMod: {
            Moderate: [5,5,6,7,9,10,11,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37],
            High: [8,8,9,10,12,13,14,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40],
            Extreme: [11,11,12,14,15,17,18,19,21,22,24,25,26,28,29,31,32,33,35,36,38,39,40,42,43,44]
        },
        areaDmg: { // String values
            UnlimitedUse: ["1d4 (2)","1d6 (4)","2d4 (5)","2d6 (7)","2d8 (9)","3d6 (11)","2d10 (12)","4d6 (14)","4d6 (15)","5d6 (17)","5d6 (18)","6d6 (20)","6d6 (21)","5d8 (23)","7d6 (24)","4d12 (26)","6d8 (27)","8d6 (28)","8d6 (29)","9d6 (30)","7d8 (32)","6d10 (33)","10d6 (35)","8d8 (36)","11d6 (38)","11d6 (39)"],
            LimitedUse: ["1d6 (4)","1d10 (6)","2d6 (7)","3d6 (11)","4d6 (14)","5d6 (18)","6d6 (21)","7d6 (25)","8d6 (28)","9d6 (32)","10d6 (35)","11d6 (39)","12d6 (42)","13d6 (46)","14d6 (49)","15d6 (53)","16d6 (56)","17d6 (60)","18d6 (63)","19d6 (67)","20d6 (70)","21d6 (74)","22d6 (77)","23d6 (81)","24d6 (84)","25d6 (88)"]
        },
        randomNames: ["Aatrox","Cragg","Pitbull","Zombeast","Krait","Brock","Xerox","Noxis","Verstabben","Ilfang","Iterous","Falcious","Silco","Pomptous","Bratt","Grouss","Wrafta","Optimus","Scrungle","Klink","Molduga"]
    };
    // Corrected the typo in DCREATURE_DATA.strikeAtkBonus.High, assuming 39 instead of 49 for level 22 (index 23)
    DCREATURE_DATA.strikeAtkBonus.High[22] = 39;

    const STAT_DISPLAY_NAMES = {
        attrMod: "Attribute Modifiers (Primary)",
        perception: "Perception",
        skills: "Skills (General)",
        armorClass: "Armor Class",
        savingThrows: "Saving Throws (General)",
        hitPoints: "Hit Points",
        resistAndWeak: "Resistances/Weaknesses Value", // This refers to the numeric value tier
        speed: "Speed",
        strikeAtkBonus: "Strike Attack Bonus",
        strikeDmg: "Strike Damage",
        spellDC: "Spell DC",
        spellAtkMod: "Spell Attack Modifier",
        areaDmg: "Area Damage"
    };



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


    // --- "No Campaign" Modal Logic for Creature Generator ---
    function openNoCampaignModalCreatureGen() {
        if (noCampaignModalCreatureGen) noCampaignModalCreatureGen.style.display = 'block';
        if (creatureGeneratorPageContent) creatureGeneratorPageContent.style.display = 'none'; // Keep content hidden
    }

    function closeNoCampaignModalCreatureGen() {
        if (noCampaignModalCreatureGen) noCampaignModalCreatureGen.style.display = 'none';
        // If closed without action, the page remains mostly blank. User should navigate or create.
    }

    if (closeNoCampaignModalCreatureGenBtn) {
        closeNoCampaignModalCreatureGenBtn.addEventListener('click', closeNoCampaignModalCreatureGen);
    }

    if (modalCreateNewCampaignBtnCreatureGen) {
        modalCreateNewCampaignBtnCreatureGen.addEventListener('click', () => {
            const newCampaignName = "New Campaign"; // Consistent dummy name
            const dummyCampaignData = {
                name: newCampaignName,
                description: "A new adventure awaits!",
                genre: "Fantasy",
                maturityRating: "TV-14",
                partyMembers: [] // Essential for party-level calculations
            };
            // Campaigns are stored in cookies as per current project structure for campaign details
            setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, JSON.stringify(dummyCampaignData), 365);
            setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365);
            window.location.href = 'index.html'; // Redirect to Campaign Details page
        });
    }

    if (modalImportCampaignBtnCreatureGen) {
        modalImportCampaignBtnCreatureGen.addEventListener('click', () => {
            alert('Import campaign functionality is not yet implemented.');
            closeNoCampaignModalCreatureGen();
        });
    }
    
    // Update window click listener to include this new modal
    window.addEventListener('click', (event) => {
        if (event.target === incompleteCreatureModal) { // Assuming this is your other modal
            if(incompleteCreatureModal) incompleteCreatureModal.style.display = 'none';
            creatureDataToSave = null;
        }
        if (event.target === noCampaignModalCreatureGen) { // New check for this modal
            closeNoCampaignModalCreatureGen();
        }
    });


    // --- Core Logic ---
    function getStatValue(statCategoryKey, tierKey, level) {
        const levelIndex = parseInt(level, 10) + 1;
        if (levelIndex < 0 || levelIndex >= 26) {
            console.warn(`Level ${level} is out of bounds for stat lookup.`);
            return "N/A";
        }

        const statGroup = DCREATURE_DATA[statCategoryKey];
        if (!statGroup) return "Invalid Stat";
        
        if (statCategoryKey === 'speed') { // Speed is a direct value per tier, not by level
            return statGroup[tierKey] !== undefined ? statGroup[tierKey] : "N/A";
        }

        const tierArray = statGroup[tierKey];
        if (!tierArray || tierArray[levelIndex] === undefined) return "N/A";
        
        return tierArray[levelIndex];
    }

    function populateTierSelect(selectElement, statCategoryKey, includeCustom = true) {
        if (!selectElement) return;
        selectElement.innerHTML = ''; // Clear existing
        const statGroup = DCREATURE_DATA[statCategoryKey];
        if (!statGroup) return;

        for (const tier in statGroup) {
            const option = document.createElement('option');
            option.value = tier;
            option.textContent = tier.replace(/([A-Z])/g, ' $1').trim(); // Add spaces for camelCase
            selectElement.appendChild(option);
        }
        if (includeCustom) {
            const customOption = document.createElement('option');
            customOption.value = "Custom";
            customOption.textContent = "Custom";
            selectElement.appendChild(customOption);
        }
    }
    
    function updateAllStatDisplaysAndSuggestions() {
        const currentLevel = parseInt(creatureLevelInput.value, 10);
        if (isNaN(currentLevel)) return;

        if(currentLevelDisplay) currentLevelDisplay.textContent = currentLevel;

        document.querySelectorAll('select[data-stat]').forEach(select => {
            updateStatDisplay(select, currentLevel);
        });
        // Update suggestions panel if a specific stat is focused or just general update
        updateSuggestionsPanel(null, currentLevel); 
    }

    function updateStatDisplay(selectElement, currentLevel) {
        const statKey = selectElement.dataset.stat;
        const selectedTier = selectElement.value;
        const displaySpan = document.getElementById(`${statKey}_value_display`);
        const customInput = document.getElementById(`${statKey}_custom`);

        if (selectedTier === "Custom") {
            if (displaySpan) displaySpan.style.display = 'none';
            if (customInput) customInput.style.display = 'inline-block';
            // If custom input has a value, that's the "display"
        } else {
            if (displaySpan) displaySpan.style.display = 'inline-block';
            if (customInput) customInput.style.display = 'none';
            const value = getStatValue(statKey, selectedTier, currentLevel);
            if (displaySpan) displaySpan.textContent = value;
        }
    }

    function updateSuggestionsPanel(statCategoryKey, level) {
    if (!suggestionsPanelContent) return;
    if (level === null || isNaN(level)) {
        suggestionsPanelContent.innerHTML = '<p>Please set a valid creature level.</p>';
        return;
    }
    if(currentLevelDisplay) currentLevelDisplay.textContent = level;

    let html = '';
    // If a specific statCategoryKey is provided, only show that one. Otherwise, show all.
    const statGroupToDisplay = statCategoryKey ? { [statCategoryKey]: DCREATURE_DATA[statCategoryKey] } : DCREATURE_DATA;

    for (const statCat in statGroupToDisplay) {
        // Skip non-stat data like randomNames or if the key somehow doesn't exist in DCREATURE_DATA
        if (statCat === 'randomNames' || !DCREATURE_DATA[statCat] || typeof DCREATURE_DATA[statCat] !== 'object') continue;

        // Use the mapping for the display title, fallback to a formatted version of the key
        const displayTitle = STAT_DISPLAY_NAMES[statCat] || statCat.replace(/([A-Z])/g, ' $1').trim();
        
        html += `<h4>${displayTitle}:</h4><ul>`;
        const tiers = DCREATURE_DATA[statCat];
        for (const tier in tiers) {
            const value = getStatValue(statCat, tier, level);
            const prettyTier = tier.replace(/([A-Z])/g, ' $1').trim(); // Make tier names like "Low", "Unlimited Use"
            html += `<li><strong>${prettyTier}:</strong> ${value}</li>`;
        }
        html += `</ul>`;
        // If a specific statCategoryKey was given, we've displayed it, so break the loop.
        if (statCategoryKey) break; 
    }
    suggestionsPanelContent.innerHTML = html || "<p>Select a stat category or change level to see suggestions.</p>";
}

    // --- Event Listeners ---
    if(creatureLevelInput) {
        creatureLevelInput.addEventListener('change', () => {
            const level = parseInt(creatureLevelInput.value, 10);
            if(level < -1) creatureLevelInput.value = -1;
            if(level > 24) creatureLevelInput.value = 24;
            updateAllStatDisplaysAndSuggestions();
        });
        creatureLevelInput.addEventListener('focus', () => updateSuggestionsPanel(null, parseInt(creatureLevelInput.value, 10)));
    }

    document.querySelectorAll('select[data-stat]').forEach(select => {
        populateTierSelect(select, select.dataset.stat);
        select.addEventListener('change', () => {
            updateStatDisplay(select, parseInt(creatureLevelInput.value, 10));
        });
        select.addEventListener('focus', () => {
             updateSuggestionsPanel(select.dataset.stat, parseInt(creatureLevelInput.value, 10));
        });
         // Initial display update based on default selection
        updateStatDisplay(select, parseInt(creatureLevelInput.value, 10));
    });
    
    if(isMagicalSelect) {
        isMagicalSelect.addEventListener('change', (e) => {
            magicalStatsContainer.style.display = e.target.value === 'yes' ? 'block' : 'none';
        });
    }

    if(randomNameBtn && creatureNameInput) {
        randomNameBtn.addEventListener('click', () => {
            const names = DCREATURE_DATA.randomNames;
            if (names && names.length > 0) {
                creatureNameInput.value = names[Math.floor(Math.random() * names.length)];
            }
        });
    }

    // --- Save Logic ---
    let creatureDataToSave = null; // To hold data for the incomplete modal
    function validateAndPrepareCreatureData() {
        let isValid = true;
        const data = { id: currentEditingCreatureIdFromURL || generateUniqueId() };
        const requiredFieldsForFullCompletion = []; // Define which fields make it "complete"

        data.name = creatureNameInput.value.trim();
        if (!data.name) { 
            isValid = false; 
            // creatureNameInput.classList.add('input-error'); // Example: highlight error
        }
        data.level = parseInt(creatureLevelInput.value, 10);
        if (isNaN(data.level)) isValid = false;

        document.querySelectorAll('select[data-stat]').forEach(select => {
            const statKey = select.dataset.stat;
            const tier = select.value;
            const customInput = document.getElementById(`${statKey}_custom`);
            let value;

            if (tier === "Custom") {
                value = customInput.type === 'number' ? parseInt(customInput.value, 10) : customInput.value.trim();
                if (customInput.type === 'number' && isNaN(value)) {
                    if (statKey !== 'strikeDmg' && statKey !== 'areaDmg') value = 0; // Default for numbers
                    else value = ""; // Default for damage strings
                }
                 if (!value && value !==0 ) isValid = false; // Custom field empty is incomplete
            } else {
                value = getStatValue(statKey, tier, data.level);
            }
            data[`${statKey}_tier`] = tier;
            data[`${statKey}_value`] = value;
            if(value === "N/A" || value === undefined || (typeof value === 'string' && !value.trim())) isValid = false;
        });
        
        data.isMagical = isMagicalSelect.value === 'yes';
        if (data.isMagical) {
            // Similar logic for magical stats if they are selected/custom
            ['spellAtkMod', 'spellDC', 'areaDmg'].forEach(statKey => {
                 const select = document.getElementById(`${statKey}_tier`);
                 const customInput = document.getElementById(`${statKey}_custom`);
                 const tier = select.value;
                 let value;
                 if (tier === "Custom") {
                    value = customInput.type === 'number' ? parseInt(customInput.value, 10) : customInput.value.trim();
                    if (customInput.type === 'number' && isNaN(value)) value = 0;
                    else if (typeof value === 'string' && !value) value = "";
                    if (!value && value !==0) isValid = false;
                 } else {
                    value = getStatValue(statKey, tier, data.level);
                 }
                 data[`${statKey}_tier`] = tier;
                 data[`${statKey}_value`] = value;
                 if(value === "N/A" || value === undefined || (typeof value === 'string' && !value.trim())) isValid = false;
            });
        } else {
            data.spellAtkMod_tier = "N/A"; data.spellAtkMod_value = 0;
            data.spellDC_tier = "N/A"; data.spellDC_value = 0;
            data.areaDmg_tier = "N/A"; data.areaDmg_value = "";
        }
        data.notes = document.getElementById('creatureNotes').value.trim();
        
        return { isValid, data };
    }

    function actualSaveCreature(creatureData) {
        let creatures = [];
        try {
            const existingCreaturesJSON = localStorage.getItem(HOMEBREW_CREATURES_KEY);
            if (existingCreaturesJSON) {
                creatures = JSON.parse(existingCreaturesJSON);
            }
        } catch (e) {
            console.error("Error parsing existing creatures from localStorage:", e);
            creatures = []; // Default to empty array on error
        }

        console.log("[SaveDebug] actualSaveCreature called.");
        console.log("[SaveDebug] currentEditingCreatureIdFromURL:", currentEditingCreatureIdFromURL);
        console.log("[SaveDebug] creatureData received (includes ID):", JSON.parse(JSON.stringify(creatureData)));
        // For detailed debugging, you might want to log the list of IDs in the 'creatures' array:
        // console.log("[SaveDebug] IDs in localStorage before save:", creatures.map(c => c.id));

        let creatureUpdated = false;

        if (currentEditingCreatureIdFromURL) {
            // This implies an edit was intended.
            // creatureData.id should match currentEditingCreatureIdFromURL if validateAndPrepareCreatureData worked as expected.
            const idToMatch = currentEditingCreatureIdFromURL; // Use the ID we know came from the URL.
            const existingCreatureIndex = creatures.findIndex(c => c.id === idToMatch);
            
            console.log(`[SaveDebug] Attempting to edit. ID from URL: ${idToMatch}. Index found in localStorage: ${existingCreatureIndex}`);

            if (existingCreatureIndex > -1) {
                // Found the creature, update it. Ensure the ID remains the original one.
                creatures[existingCreatureIndex] = { ...creatureData, id: idToMatch };
                console.log("[SaveDebug] Creature updated in array:", creatures[existingCreatureIndex]);
                if(saveStatusCreature) saveStatusCreature.textContent = `Creature "${creatureData.name}" updated successfully!`;
                creatureUpdated = true;
            } else {
                // An ID was passed in the URL, but no creature with that ID exists in localStorage.
                // This could happen if the creature was deleted in another tab, or the URL is stale.
                // In this case, save it as a NEW creature, but assign a NEW ID to avoid conflicts if the old ID was somehow erroneous.
                const oldAttemptedId = creatureData.id; // This was currentEditingCreatureIdFromURL
                creatureData.id = generateUniqueId(); // Generate a completely new ID
                creatures.push(creatureData);
                console.warn(`[SaveDebug] Edit target ID "${oldAttemptedId}" not found in storage. Saved as NEW creature with fresh ID "${creatureData.id}".`);
                if(saveStatusCreature) saveStatusCreature.textContent = `Creature "${creatureData.name}" (edit target not found) saved as new.`;
            }
        } else {
            // No currentEditingCreatureIdFromURL, so this is a brand new creature.
            // creatureData.id should have been generated by validateAndPrepareCreatureData.
            if (!creatureData.id) { // Defensive: Ensure ID exists
                console.warn("[SaveDebug] New creatureData was missing an ID, generating one.");
                creatureData.id = generateUniqueId();
            }
            creatures.push(creatureData);
            console.log("[SaveDebug] New creature saved:", creatureData);
            if(saveStatusCreature) saveStatusCreature.textContent = `Creature "${creatureData.name}" saved to Homebrew Catalog!`;
        }
        
        try {
            localStorage.setItem(HOMEBREW_CREATURES_KEY, JSON.stringify(creatures));
            // The success message is already set above, just manage the timeout
            if(saveStatusCreature && saveStatusCreature.textContent) {
                setTimeout(() => { if(saveStatusCreature) saveStatusCreature.textContent = ''; }, 3000);
            }
        } catch (e) {
            console.error("Error saving creatures to localStorage:", e);
            if(saveStatusCreature) {
                saveStatusCreature.textContent = `Error saving creature. Storage might be full.`;
                setTimeout(() => { if(saveStatusCreature) saveStatusCreature.textContent = ''; }, 3000);
            }
        }
        
        // Reset the editing context after any save attempt
        currentEditingCreatureIdFromURL = null;

        // Optional: redirect back to catalog after saving an edit
        // if (creatureUpdated) {
        //     setTimeout(() => { window.location.href = 'homebrewcatalog.html'; }, 1000);
        // }
    }

    // Also, in your validateAndPrepareCreatureData function in creaturegenerator_script.js:
    // Make sure it includes the ID if it's an edit.
    

    if(creatureForm) {
        creatureForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const validationResult = validateAndPrepareCreatureData();
            if (validationResult.isValid) {
                actualSaveCreature(validationResult.data);
            } else {
                creatureDataToSave = validationResult.data; // Store for modal confirmation
                if(incompleteCreatureModal) incompleteCreatureModal.style.display = 'block';
            }
        });
    }
    
    if(confirmSaveIncompleteBtn) {
        confirmSaveIncompleteBtn.addEventListener('click', () => {
            if (creatureDataToSave) {
                actualSaveCreature(creatureDataToSave);
            }
            if(incompleteCreatureModal) incompleteCreatureModal.style.display = 'none';
            creatureDataToSave = null;
        });
    }
    if(cancelSaveIncompleteBtn) cancelSaveIncompleteBtn.addEventListener('click', () => {
        if(incompleteCreatureModal) incompleteCreatureModal.style.display = 'none';
        creatureDataToSave = null;
    });
    if(closeIncompleteModalBtn) closeIncompleteModalBtn.addEventListener('click', () => {
         if(incompleteCreatureModal) incompleteCreatureModal.style.display = 'none';
        creatureDataToSave = null;
    });


    // Ctrl+S Save
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            saveCreatureBtn.click(); // Trigger form submit
        }
    });

    // --- URL Parameter Loading & Default Level ---
    function getAveragePartyLevel() {
        const campaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (!campaignName) return null;
        const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
        if (!campaignDataString) return null;

        try {
            const campaignData = JSON.parse(campaignDataString);
            if (campaignData.partyMembers && campaignData.partyMembers.length > 0) {
                let totalLevel = 0;
                campaignData.partyMembers.forEach(member => {
                    totalLevel += parseInt(member.level, 10) || 0;
                });
                return Math.round(totalLevel / campaignData.partyMembers.length);
            }
        } catch (e) {
            console.error("Error getting average party level:", e);
        }
        return null;
    }
    
    function loadCreatureFromURLParams() {
        const params = new URLSearchParams(window.location.search);
        let dataLoadedFromParams = false;
        
        if (params.has('id')) {
            currentEditingCreatureIdFromURL = params.get('id'); // Store the ID
            dataLoadedFromParams = true; // If ID is present, assume it's an edit
            console.log("Editing creature with ID:", currentEditingCreatureIdFromURL);
        } else {
            currentEditingCreatureIdFromURL = null; // Ensure it's null for new creatures
        }

        if (params.has('name')) creatureNameInput.value = params.get('name');
        // ... (rest of your parameter loading logic for all fields) ...

        if(dataLoadedFromParams) {
            console.log("Creature data loaded from URL parameters for editing/viewing.");
        }
        return dataLoadedFromParams;
    }

    // --- Initial Page Setup ---
    function initializeForm() {
        const campaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        let campaignDataExists = false;
        if (campaignName) {
            const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
            if (campaignDataString) {
                campaignDataExists = true;
            }
        }

        if (!campaignDataExists) {
            openNoCampaignModalCreatureGen();
            return; // Stop further initialization if no campaign
        }

        // If campaign exists, proceed with normal page setup
        if (creatureGeneratorPageContent) creatureGeneratorPageContent.style.display = 'block'; // Show main content

        const loadedFromParams = loadCreatureFromURLParams();
        if (!loadedFromParams && creatureLevelInput) {
            const avgLevel = getAveragePartyLevel();
            if (avgLevel !== null && !isNaN(avgLevel)) {
                let defaultLevel = avgLevel;
                if (defaultLevel < -1) defaultLevel = -1;
                if (defaultLevel > 24) defaultLevel = 24;
                creatureLevelInput.value = defaultLevel;
            } else {
                creatureLevelInput.value = 1;
            }
        }
        
        document.querySelectorAll('select[data-stat]').forEach(select => {
            populateTierSelect(select, select.dataset.stat);
            if (DCREATURE_DATA[select.dataset.stat] && DCREATURE_DATA[select.dataset.stat].Moderate !== undefined) {
                 if(select.dataset.stat === 'speed') {
                    select.value = 'Moderate';
                 } else {
                    select.value = 'Moderate';
                 }
            } else if (select.options.length > 0) {
                select.value = select.options[0].value;
            }
        });
        
        if(isMagicalSelect && magicalStatsContainer) magicalStatsContainer.style.display = isMagicalSelect.value === 'yes' ? 'block' : 'none';
        
        updateAllStatDisplaysAndSuggestions(); 
        
        document.querySelectorAll('.top-bar nav ul li a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === 'creaturegenerator.html') {
                link.classList.add('active');
            }
        });
    }

    initializeForm();
});