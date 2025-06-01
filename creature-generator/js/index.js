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
    const exportCreatureBtn = document.getElementById('exportCreatureBtn'); // Export Button
    const saveStatusCreature = document.getElementById('saveStatusCreature');

    const incompleteCreatureModal = document.getElementById('incompleteCreatureModal');
    const closeIncompleteModalBtn = document.getElementById('closeIncompleteModalBtn');
    const confirmSaveIncompleteBtn = document.getElementById('confirmSaveIncompleteBtn');
    const cancelSaveIncompleteBtn = document.getElementById('cancelSaveIncompleteBtn');

    const creatureGeneratorPageContent = document.getElementById('creatureGeneratorPageContent'); 

    const noCampaignModalCreatureGen = document.getElementById('newUserModal');
    const closeNoCampaignModalCreatureGenBtn = noCampaignModalCreatureGen ? noCampaignModalCreatureGen.querySelector('.close-button') : null;
    const modalCreateNewCampaignBtnCreatureGen = document.getElementById('createNewCampaignBtn');
    const modalImportCampaignBtnCreatureGen = document.getElementById('importCampaignBtn');

    const statsTriangle = document.getElementById('statsTriangle');
    const diagSpeedActualDisplay = document.getElementById('diagSpeedActual');
    const diagSpeedScoreDisplay = document.getElementById('diagSpeedScore');
    const diagOffenseScoreDisplay = document.getElementById('diagOffenseScore');
    const diagVitalityScoreDisplay = document.getElementById('diagVitalityScore');
    
    const speedTierSelect = document.getElementById('speed_tier');
    const speedValueDisplay = document.getElementById('speed_value_display');
    const speedCustomInput = document.getElementById('speed_custom');
    const strikeAtkBonusTierSelect = document.getElementById('strikeAtkBonus_tier');
    const strikeDmgTierSelect = document.getElementById('strikeDmg_tier');
    const spellAtkModTierSelect = document.getElementById('spellAtkMod_tier');
    const areaDmgTierSelect = document.getElementById('areaDmg_tier'); 
    const hitPointsTierSelect = document.getElementById('hitPoints_tier');
    const armorClassTierSelect = document.getElementById('armorClass_tier');
    const savingThrowsTierSelect = document.getElementById('savingThrows_tier');

    const ttkDisplayElement = document.getElementById('ttkDisplay');
    const warningBox = document.getElementById('warningBox');
    const warningList = document.getElementById('warningList');


    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    const HOMEBREW_CREATURES_KEY = 'ttrpgSuite_homebrewCreatures';

    const DCREATURE_DATA = {
        attrMod: { Low: [0,0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7], Moderate: [2,2,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,8,8,9], High: [3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,10,10,12], Extreme: [4,4,5,5,5,6,6,7,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,12,12,13]},
        perception: { Terrible: [0,1,2,3,4,6,7,8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32], Low: [2,3,4,5,6,8,9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36], Moderate: [5,6,7,8,9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38], High: [8,9,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42], Extreme: [9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46], Obscene: [10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46,49]},
        skills: { Terrible: [1,2,3,4,5,7,8,9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33], Low: [2,3,4,5,7,8,10,11,13,14,16,17,19,20,22,23,25,26,28,29,31,32,34,35,36,38], Moderate: [4,5,6,7,9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,38,40], High: [5,6,7,8,10,12,13,15,17,18,20,22,23,25,27,28,30,32,33,35,37,38,40,42,43,45], Extreme: [8,9,10,11,13,15,16,18,20,21,23,25,26,28,30,31,33,35,36,38,40,41,43,45,46,48], Obscene: [10,11,13,15,16,18,20,21,23,25,26,28,30,31,33,35,36,38,40,41,43,45,46,48,51,55]},
        armorClass: { Terrible: [10,11,12,13,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45], Low: [12,13,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48], Moderate: [14,15,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44,45,47,48,50], High: [15,16,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51], Extreme: [18,19,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51,52,54], Obscene: [19,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42,43,45,46,48,49,51,52,54,58]},
        savingThrows: { Terrible: [0,1,2,3,4,6,7,8,10,11,12,14,15,16,18,19,20,22,23,24,26,27,28,30,31,32], Low: [2,3,4,5,6,8,9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36], Moderate: [5,6,7,8,9,11,12,14,15,16,18,19,21,22,23,25,26,28,29,30,32,33,35,36,37,38], High: [8,9,10,11,12,14,16,17,18,19,21,22,24,25,26,28,29,30,32,33,35,36,38,39,40,42], Extreme: [9,10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46], Obscene: [10,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,43,44,46,48]},
        hitPoints: { Terrible: [2,5,11,14,21,31,42,53,67,82,97,112,127,142,157,172,187,202,217,232,247,262,277,295,317,339], Low: [5,11,14,21,31,42,53,67,82,97,112,127,142,157,172,187,202,217,232,247,262,277,295,317,339,367], Moderate: [7,14,19,28,42,57,72,91,111,131,151,171,191,211,231,251,271,291,311,331,351,371,395,424,454,492], High: [9,17,24,36,53,72,91,115,140,165,190,215,240,265,290,315,340,365,390,415,440,465,495,532,569,617], Extreme: [17,24,36,53,72,91,115,140,165,190,215,240,265,290,315,340,365,390,415,440,465,495,532,569,617,665]},
        resistAndWeak: { Low: [1,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,9,9,10,10,11,11,12,12,13,13], Moderate: [1,2,2,3,4,5,6,7,7,8,9,10,11,11,11,12,13,14,14,15,16,16,17,18,19,20], High: [1,3,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,19,20,21,22,23,24,25,26]},
        speed: { Terrible: 15, Low: 20, Moderate: 25, High: 30, Extreme: 35}, 
        strikeAtkBonus: { Terrible: [3,4,4,5,7,8,9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,34], Low: [4,4,5,7,8,9,11,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,35,36], Moderate: [6,6,7,9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34,36,37,39,40,42], High: [8,8,9,11,12,14,15,17,18,20,21,23,24,26,27,29,30,32,33,35,36,38,39,41,42,44], Extreme: [10,10,11,13,14,16,17,19,20,22,23,25,27,28,29,31,32,34,35,37,38,40,41,43,44,46], Obscene: [10,11,13,14,16,17,19,20,22,23,25,27,28,29,31,32,34,35,37,38,40,41,43,44,46,48]},
        strikeDmg: { Low: ["1d4 (2)","1d4+1 (3)","1d4+2 (4)","1d6+3 (6)","1d6+5 (8)","2d4+4 (9)","2d4+6 (11)","2d4+7 (12)","2d6+6 (13)","2d6+8 (15)","2d6+9 (16)","2d6+10 (17)","2d8+10 (19)","3d6+10 (20)","3d6+11 (21)","3d6+13 (23)","3d6+14 (24)","3d6+15 (25)","3d6+16 (26)","3d6+17 (27)","4d6+14 (28)","4d6+15 (29)","4d6+17 (31)","4d6+18 (32)","4d6+19 (33)","4d6+21 (35)"], Moderate: ["1d4 (3)","1d4+2 (4)","1d6+2 (5)","1d8+4 (8)","1d8+6 (10)","2d6+5 (12)","2d6+6 (13)","2d6+8 (15)","2d8+8 (17)","2d8+9 (18)","2d8+11 (20)","2d10+11 (22)","2d10+12 (23)","3d8+12 (25)","3d8+14 (27)","3d8+15 (28)","3d10+14 (30)","3d10+15 (31)","3d10+16 (32)","3d10+17 (33)","4d8+17 (35)","4d8+19 (37)","4d8+20 (38)","4d8+22 (40)","4d10+20 (42)","4d10+22 (44)"], High: ["1d4+1 (3)","1d6+2 (5)","1d6+3 (6)","1d10+4 (9)","1d10+6 (12)","2d8+5 (14)","2d8+7 (16)","2d8+9 (18)","2d10+9 (20)","2d10+11 (22)","2d10+13 (24)","2d12+13 (26)","2d12+15 (28)","3d10+14 (30)","3d10+16 (32)","3d10+18 (34)","3d12+17 (36)","3d12+18 (37)","3d12+19 (38)","3d12+20 (40)","4d10+20 (42)","4d10+22 (44)","4d10+24 (46)","4d10+26 (48)","4d12+24 (50)","4d12+26 (52)"], Extreme: ["1d6+1 (4)","1d6+3 (6)","1d8+4 (8)","1d12+4 (11)","1d12+8 (15)","2d10+7 (18)","2d12+7 (20)","2d12+10 (23)","2d12+12 (25)","2d12+15 (28)","2d12+17 (30)","2d12+20 (33)","2d12+22 (35)","3d12+19 (38)","3d12+21 (40)","3d12+24 (43)","3d12+26 (45)","3d12+29 (48)","3d12+31 (50)","3d12+34 (53)","4d12+29 (55)","4d12+32 (58)","4d12+34 (60)","4d12+37 (63)","4d12+39 (65)","4d12+42 (68)"]},
        spellDC: { Moderate: [13,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37,38,39,41,42,43,45], High: [16,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40,41,42,44,45,46,48], Extreme: [19,19,20,22,23,25,26,27,29,30,32,33,34,36,37,39,40,41,43,44,46,47,48,50,51,52]},
        spellAtkMod: { Moderate: [5,5,6,7,9,10,11,13,14,15,17,18,19,21,22,23,25,26,27,29,30,31,33,34,35,37], High: [8,8,9,10,12,13,14,16,17,18,20,21,22,24,25,26,28,29,30,32,33,34,36,37,38,40], Extreme: [11,11,12,14,15,17,18,19,21,22,24,25,26,28,29,31,32,33,35,36,38,39,40,42,43,44]},
        areaDmg: { UnlimitedUse: ["1d4 (2)","1d6 (4)","2d4 (5)","2d6 (7)","2d8 (9)","3d6 (11)","2d10 (12)","4d6 (14)","4d6 (15)","5d6 (17)","5d6 (18)","6d6 (20)","6d6 (21)","5d8 (23)","7d6 (24)","4d12 (26)","6d8 (27)","8d6 (28)","8d6 (29)","9d6 (30)","7d8 (32)","6d10 (33)","10d6 (35)","8d8 (36)","11d6 (38)","11d6 (39)"], LimitedUse: ["1d6 (4)","1d10 (6)","2d6 (7)","3d6 (11)","4d6 (14)","5d6 (18)","6d6 (21)","7d6 (25)","8d6 (28)","9d6 (32)","10d6 (35)","11d6 (39)","12d6 (42)","13d6 (46)","14d6 (49)","15d6 (53)","16d6 (56)","17d6 (60)","18d6 (63)","19d6 (67)","20d6 (70)","21d6 (74)","22d6 (77)","23d6 (81)","24d6 (84)","25d6 (88)"]},
        randomNames: ["Aatrox","Cragg","Pitbull","Zombeast","Krait","Brock","Xerox","Noxis","Verstabben","Ilfang","Iterous","Falcious","Silco","Pomptous","Bratt","Grouss","Wrafta","Optimus","Scrungle","Klink","Molduga"]
    };
    DCREATURE_DATA.strikeAtkBonus.High[22] = 39;

    const STAT_DISPLAY_NAMES = {
        attrMod: "Attribute Modifiers (Primary)", perception: "Perception", skills: "Skills (General)", armorClass: "Armor Class", savingThrows: "Saving Throws (General)", hitPoints: "Hit Points", resistAndWeak: "Resistances/Weaknesses Value", speed: "Speed", strikeAtkBonus: "Strike Attack Bonus", strikeDmg: "Strike Damage", spellDC: "Spell DC", spellAtkMod: "Spell Attack Modifier", areaDmg: "Area Damage"
    };
    
    const TIER_VALUE_MAP = { "Terrible": 0, "Low": 1, "Moderate": 2, "High": 3, "Extreme": 4, "Obscene": 5, "Custom": null, "UnlimitedUse": 2, "LimitedUse": 3};
    const SPEED_TIER_PROGRESSION = { "Terrible": 0, "Low": 1, "Moderate": 2, "High": 3, "Extreme": 4 }; 
    const MAX_STANDARD_TIER_VALUE_FROM_MAP = 5;
    const MAX_DIAGNOSTIC_TIER_NORMALIZATION = 5; 


    // --- Cookie Helper Functions ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) { const date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); expires = "; expires=" + date.toUTCString(); }
        document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/; SameSite=Lax";
    }
    function getCookie(name) {
        const nameEQ = name + "="; const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) { let c = ca[i]; while (c.charAt(0) === ' ') c = c.substring(1, c.length); if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));}
        return null;
    }
    function generateUniqueId() { return Date.now().toString(36) + Math.random().toString(36).substring(2); }

    // --- "No Campaign" Modal Logic ---
    function openNoCampaignModalCreatureGen() { if (noCampaignModalCreatureGen) noCampaignModalCreatureGen.style.display = 'block'; if (creatureGeneratorPageContent) creatureGeneratorPageContent.style.display = 'none';}
    function closeNoCampaignModalCreatureGen() { if (noCampaignModalCreatureGen) noCampaignModalCreatureGen.style.display = 'none'; }
    if (closeNoCampaignModalCreatureGenBtn) closeNoCampaignModalCreatureGenBtn.addEventListener('click', closeNoCampaignModalCreatureGen);
    if (modalCreateNewCampaignBtnCreatureGen) modalCreateNewCampaignBtnCreatureGen.addEventListener('click', () => { const n = "New Campaign"; const d = {name:n,description:"A new adventure awaits!",genre:"Fantasy",maturityRating:"TV-14",partyMembers:[],sessions:[]}; setCookie(CAMPAIGN_DATA_PREFIX+n,JSON.stringify(d),365); setCookie(LAST_VIEWED_CAMPAIGN_KEY,n,365); window.location.href='../index.html';}); // Redirect to main home which can lead to campaign page
    if (modalImportCampaignBtnCreatureGen) modalImportCampaignBtnCreatureGen.addEventListener('click', () => { alert('Import campaign functionality is not yet implemented.'); closeNoCampaignModalCreatureGen(); });
    window.addEventListener('click', (event) => { if (event.target === incompleteCreatureModal) { if(incompleteCreatureModal) incompleteCreatureModal.style.display = 'none'; creatureDataToSave = null;} if (event.target === noCampaignModalCreatureGen) closeNoCampaignModalCreatureGen();});

    // --- Core Logic ---
    function getStatValue(statCategoryKey, tierKey, level) {
        const levelIndex = parseInt(level, 10) + 1; if (levelIndex < 0 || levelIndex >= 26) return "N/A";
        const statGroup = DCREATURE_DATA[statCategoryKey]; if (!statGroup) return "Invalid Stat";
        if (statCategoryKey === 'speed') return statGroup[tierKey] !== undefined ? statGroup[tierKey] : "N/A";
        const tierArray = statGroup[tierKey]; if (!tierArray || tierArray[levelIndex] === undefined) return "N/A";
        return tierArray[levelIndex];
    }
    function populateTierSelect(selectElement, statCategoryKey, includeCustom = true) {
        if (!selectElement) return; selectElement.innerHTML = ''; const statGroup = DCREATURE_DATA[statCategoryKey]; if (!statGroup) return;
        for (const tier in statGroup) { const option = document.createElement('option'); option.value = tier; option.textContent = tier.replace(/([A-Z])/g, ' $1').trim(); selectElement.appendChild(option);}
        if (includeCustom) { const customOption = document.createElement('option'); customOption.value = "Custom"; customOption.textContent = "Custom"; selectElement.appendChild(customOption);}
    }
    function updateAllStatDisplaysAndSuggestions() {
        const currentLevel = parseInt(creatureLevelInput.value, 10); if (isNaN(currentLevel)) return;
        if(currentLevelDisplay) currentLevelDisplay.textContent = currentLevel;
        document.querySelectorAll('select[data-stat]').forEach(select => updateStatDisplay(select, currentLevel));
        updateSuggestionsPanel(null, currentLevel); 
        updateDiagnosticsDisplay(); 
    }
    function updateStatDisplay(selectElement, currentLevel) {
        const statKey = selectElement.dataset.stat; const selectedTier = selectElement.value;
        const displaySpan = document.getElementById(`${statKey}_value_display`); const customInput = document.getElementById(`${statKey}_custom`);
        if (selectedTier === "Custom") { if (displaySpan) displaySpan.style.display = 'none'; if (customInput) customInput.style.display = 'inline-block';}
        else { if (displaySpan) displaySpan.style.display = 'inline-block'; if (customInput) customInput.style.display = 'none'; const value = getStatValue(statKey, selectedTier, currentLevel); if (displaySpan) displaySpan.textContent = value;}
    }
    function updateSuggestionsPanel(statCategoryKey, level) {
        if (!suggestionsPanelContent) return; if (level === null || isNaN(level)) { suggestionsPanelContent.innerHTML = '<p>Please set a valid creature level.</p>'; return; }
        if(currentLevelDisplay) currentLevelDisplay.textContent = level; let html = '';
        const statGroupToDisplay = statCategoryKey ? { [statCategoryKey]: DCREATURE_DATA[statCategoryKey] } : DCREATURE_DATA;
        for (const statCat in statGroupToDisplay) { if (statCat==='randomNames' || !DCREATURE_DATA[statCat] || typeof DCREATURE_DATA[statCat]!=='object') continue; const displayTitle = STAT_DISPLAY_NAMES[statCat] || statCat.replace(/([A-Z])/g,' $1').trim(); html += `<h4>${displayTitle}:</h4><ul>`; const tiers = DCREATURE_DATA[statCat]; for (const tier in tiers) { const value = getStatValue(statCat,tier,level); const prettyTier = tier.replace(/([A-Z])/g,' $1').trim(); html += `<li><strong>${prettyTier}:</strong> ${value}</li>`;} html += `</ul>`; if (statCategoryKey) break;}
        suggestionsPanelContent.innerHTML = html || "<p>Select a stat category or change level to see suggestions.</p>";
    }

    // --- Campaign Party Data Retrieval ---
    function getCampaignPartyStats() {
        const campaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (!campaignName) return { avgLevel: 1, numMembers: 4, memberMaxHPs: [] }; 
        const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
        if (!campaignDataString) return { avgLevel: 1, numMembers: 4, memberMaxHPs: [] }; 
        try {
            const campaignData = JSON.parse(campaignDataString);
            const partyMembers = campaignData.partyMembers || [];
            const numMembers = partyMembers.length > 0 ? partyMembers.length : 4; 
            let totalLevel = 0; const memberMaxHPs = [];
            partyMembers.forEach(member => { const level = parseInt(member.level, 10); if (!isNaN(level)) totalLevel += level; const maxHP = parseInt(member.maxHp, 10); if (!isNaN(maxHP)) memberMaxHPs.push(maxHP);});
            const avgLevel = numMembers > 0 && totalLevel > 0 ? Math.round(totalLevel / numMembers) : 1; 
            return { avgLevel: avgLevel || 1, numMembers: numMembers, memberMaxHPs: memberMaxHPs };
        } catch (e) { console.error("Error parsing campaign party data:", e); return { avgLevel: 1, numMembers: 4, memberMaxHPs: [] };}
    }
    
    // --- Damage Calculation Helpers ---
    function parseAverageFromDamageString(damageStatString) {
        if (typeof damageStatString !== 'string') return null; const match = damageStatString.match(/\((\d+(\.\d+)?)\)/); return match ? parseFloat(match[1]) : null;
    }
    function calculateAverageDamageFromString(damageString) {
        if (!damageString || typeof damageString !== 'string') return 0; let totalAverageDamage = 0;
        const standardizedString = damageString.replace(/\s*([+-])\s*/g, " $1 ").trim(); const parts = standardizedString.split(' ');
        let currentOperator = '+'; let i = 0;
        while(i < parts.length) { let term = parts[i].trim(); if (term === "") { i++; continue; } if (term === '+' || term === '-') { currentOperator = term; i++; if (i >= parts.length) break; term = parts[i].trim(); }
            let value = 0; const diceMatch = term.match(/^(\d+)d(\d+)$/i);
            if (diceMatch) { const numDice = parseInt(diceMatch[1],10); const dieFaces = parseInt(diceMatch[2],10); if (dieFaces > 0) value = numDice * (dieFaces/1.9); }
            else { const numValue = parseFloat(term); if (!isNaN(numValue)) value = numValue; }
            if (currentOperator === '+') totalAverageDamage += value; else if (currentOperator === '-') totalAverageDamage -= value;
            currentOperator = '+'; i++;
        } return totalAverageDamage;
    }
    function calculateMaxDamage(damageString) {
        if (!damageString || typeof damageString !== 'string') return 0; let totalMaxDamage = 0;
        const standardizedString = damageString.replace(/\s*([+-])\s*/g, " $1 ").trim(); const parts = standardizedString.split(' ');
        let currentOperator = '+'; let i = 0;
        while(i < parts.length) { let term = parts[i].trim(); if (term === "") { i++; continue; } if (term === '+' || term === '-') { currentOperator = term; i++; if (i >= parts.length) break; term = parts[i].trim(); }
            let value = 0; const diceMatch = term.match(/^(\d+)d(\d+)$/i);
            if (diceMatch) { const numDice = parseInt(diceMatch[1],10); const dieFaces = parseInt(diceMatch[2],10); value = numDice * dieFaces; }
            else { const numValue = parseFloat(term); if (!isNaN(numValue)) value = numValue; }
            if (currentOperator === '+') totalMaxDamage += value; else if (currentOperator === '-') totalMaxDamage -= value;
            currentOperator = '+'; i++;
        } return totalMaxDamage;
    }

    // --- Tier Evaluation Helpers ---
    function getHighestStandardTierInfo(statKey, currentLevel) {
        const statTiersDefinition = DCREATURE_DATA[statKey]; if (!statTiersDefinition) return null;
        let highestTierNameFound = ''; let highestTierNumericValueFound = -1;
        for (const tierName in statTiersDefinition) { const numericVal = TIER_VALUE_MAP[tierName]; if (numericVal !== undefined && numericVal !== null) { if (numericVal > highestTierNumericValueFound) { highestTierNumericValueFound = numericVal; highestTierNameFound = tierName;}}}
        if (!highestTierNameFound) return null;
        let benchmarkStatValue = getStatValue(statKey, highestTierNameFound, currentLevel);
        if (statKey === 'strikeDmg' || statKey === 'areaDmg') benchmarkStatValue = parseAverageFromDamageString(benchmarkStatValue); else benchmarkStatValue = parseFloat(benchmarkStatValue);
        if (isNaN(benchmarkStatValue) || benchmarkStatValue === null) return null;
        return { tierName: highestTierNameFound, tierNumericValue: highestTierNumericValueFound, statValue: benchmarkStatValue };
    }
    function getEffectiveTierForStat(statKey, selectedTierString, customValueString, currentLevel) {
        const baseTierNumeric = TIER_VALUE_MAP[selectedTierString];
        if (selectedTierString !== "Custom" || customValueString === null || customValueString.trim() === "") { return (baseTierNumeric === null || isNaN(baseTierNumeric)) ? TIER_VALUE_MAP["Moderate"] : baseTierNumeric; }
        const highestTierInfo = getHighestStandardTierInfo(statKey, currentLevel); if (!highestTierInfo) return TIER_VALUE_MAP["Moderate"];
        let currentCustomStatValue;
        if (statKey === 'strikeDmg' || statKey === 'areaDmg') currentCustomStatValue = calculateAverageDamageFromString(customValueString); else currentCustomStatValue = parseFloat(customValueString);
        if (isNaN(currentCustomStatValue)) return TIER_VALUE_MAP["Moderate"];
        let effectiveTier;
        if (highestTierInfo.statValue >= 0 && currentCustomStatValue > highestTierInfo.statValue * 1.35) effectiveTier = highestTierInfo.tierNumericValue + 2;
        else if (currentCustomStatValue > highestTierInfo.statValue) effectiveTier = highestTierInfo.tierNumericValue + 1;
        else { let mappedTier = TIER_VALUE_MAP["Terrible"] !== undefined ? TIER_VALUE_MAP["Terrible"] : 0; const sortedTierNames = Object.keys(DCREATURE_DATA[statKey] || {}).filter(tn => TIER_VALUE_MAP[tn] !== undefined && TIER_VALUE_MAP[tn] !== null).sort((a,b)=>(TIER_VALUE_MAP[a])-(TIER_VALUE_MAP[b]));
            for (const tierName of sortedTierNames) { let tierBenchmarkValue = getStatValue(statKey, tierName, currentLevel); if (statKey === 'strikeDmg' || statKey === 'areaDmg') tierBenchmarkValue = parseAverageFromDamageString(tierBenchmarkValue); else tierBenchmarkValue = parseFloat(tierBenchmarkValue); if (isNaN(tierBenchmarkValue)) continue; if (currentCustomStatValue >= tierBenchmarkValue) mappedTier = TIER_VALUE_MAP[tierName]; else break; }
            effectiveTier = mappedTier;
        } return Math.min(effectiveTier, MAX_DIAGNOSTIC_TIER_NORMALIZATION);
    }

    // --- TTK and Warnings Logic ---
    function updateWarningBoxAndTTK(normalizedStats, campaignPartyStats) {
        if (!warningBox || !warningList || !ttkDisplayElement || !creatureLevelInput) { return; }
        const currentLevel = parseInt(creatureLevelInput.value, 10); const warnings = [];
        let creatureHP, acTierNumericForTTK, speedTierNumericForTTK;

        const currentHPTier = hitPointsTierSelect.value; const customHPInput = document.getElementById('hitPoints_custom'); const hpValueDisplay = document.getElementById('hitPoints_value_display');
        if (currentHPTier === "Custom" && customHPInput) creatureHP = parseFloat(customHPInput.value); else if (hpValueDisplay) creatureHP = parseFloat(hpValueDisplay.textContent);
        if (isNaN(creatureHP)) creatureHP = 0;

        const acCustomVal = document.getElementById('armorClass_custom')?.value;
        acTierNumericForTTK = getEffectiveTierForStat('armorClass', armorClassTierSelect.value, acCustomVal, currentLevel);
        acTierNumericForTTK = Math.min(acTierNumericForTTK, MAX_STANDARD_TIER_VALUE_FROM_MAP);

        const speedTierSelectedVal = speedTierSelect.value;
        const localSpeedCustomInput = document.getElementById('speed_custom'); 
        if (speedTierSelectedVal === "Custom" && localSpeedCustomInput && localSpeedCustomInput.value.trim() !== "") {
            const speedCustomInputVal = document.getElementById('speed_custom'); 
            if (speedCustomInputVal && speedCustomInputVal.value) { 
                const customSpeedValue = parseFloat(speedCustomInputVal.value); 
                speedTierNumericForTTK = customSpeedValue >= 10 ? Math.floor((customSpeedValue / 5) - 2) : 1; 
            }
        } else if (speedTierSelectedVal !== "Custom") {
            speedTierNumericForTTK = SPEED_TIER_PROGRESSION[speedTierSelectedVal] || SPEED_TIER_PROGRESSION.Moderate;
        } else { speedTierNumericForTTK = SPEED_TIER_PROGRESSION.Moderate; }
        
        const stCustomVal = document.getElementById('savingThrows_custom')?.value;
        let stTierNumericForTTK = TIER_VALUE_MAP["Moderate"]; 
        if (savingThrowsTierSelect && !isNaN(currentLevel)) { 
             stTierNumericForTTK = getEffectiveTierForStat('savingThrows', savingThrowsTierSelect.value, stCustomVal, currentLevel);
        }
        
        const savingThrowsFactor = (stTierNumericForTTK > 0 && !isNaN(stTierNumericForTTK)) ? (stTierNumericForTTK / 1.5) : (1 / 1.5);

        let estimatedTTK = 0;
        const partyDamageFactor = ((1.2 * campaignPartyStats.avgLevel) + 6) * campaignPartyStats.numMembers;

        if (campaignPartyStats.numMembers > 0 && creatureHP > 0 && partyDamageFactor > 0) { 
            const acFactor = acTierNumericForTTK > 0 ? (acTierNumericForTTK / 1.5) : (1 / 1.5); 
            const speedFactor = speedTierNumericForTTK > 0 ? (speedTierNumericForTTK / 2.5) : (1 / 2.5); 
            estimatedTTK = (creatureHP / partyDamageFactor) * acFactor * speedFactor * savingThrowsFactor * 120; // TTK in seconds
        }
        ttkDisplayElement.textContent = estimatedTTK > 0 ? `${(estimatedTTK/60).toFixed(1)} min` : "N/A";

        if (normalizedStats) { 
            const { speed, offense, vitality } = normalizedStats; let highStatCount = 0;
            if (speed > 0.68) highStatCount++; if (offense > 0.68) highStatCount++; if (vitality > 0.68) highStatCount++;
            if (highStatCount >= 2) warnings.push("Powerful enemies (including bosses) should adhere to the 3-2-1 design rule.");
            if (speed > 0.63 && offense > 0.63 && vitality > 0.63) warnings.push("This creature is overpowered for its level. Consider increasing its level and decreasing its stats.");
            if (speed < 0.33 && offense < 0.33 && vitality < 0.33) warnings.push("This creature is likely weak for its level. Consider decreasing its level and increasing its stats.");
        }
        if (estimatedTTK > 5400) warnings.push("This creature may take over 1.5 hours for the current party to defeat. Consider decreasing AC.");
        let maxCreatureHit = 0; const strikeDmgTierVal = strikeDmgTierSelect.value; const strikeDmgCustomVal = document.getElementById('strikeDmg_custom')?.value;
        let strikeDmgString = (strikeDmgTierVal === "Custom") ? strikeDmgCustomVal : document.getElementById('strikeDmg_value_display')?.textContent;
        if (strikeDmgString) maxCreatureHit = Math.max(maxCreatureHit, calculateMaxDamage(strikeDmgString));
        if (isMagicalSelect.value === 'yes') { const areaDmgTierVal = areaDmgTierSelect.value; const areaDmgCustomVal = document.getElementById('areaDmg_custom')?.value; let areaDmgString = (areaDmgTierVal === "Custom") ? areaDmgCustomVal : document.getElementById('areaDmg_value_display')?.textContent; if (areaDmgString) maxCreatureHit = Math.max(maxCreatureHit, calculateMaxDamage(areaDmgString));}
        if (maxCreatureHit > 0 && campaignPartyStats.memberMaxHPs.length > 0) { for (const memberMaxHP of campaignPartyStats.memberMaxHPs) { if (maxCreatureHit > (memberMaxHP * 0.85)) { warnings.push("This creature's max hit may one-shot a party member (deals >85% max HP)."); break; }}}
        
        warningList.innerHTML = '';
        if (warnings.length > 0) { warnings.forEach(warningText => { const li = document.createElement('li'); li.textContent = warningText; warningList.appendChild(li); }); warningBox.style.display = 'block'; } 
        else { warningBox.style.display = 'none'; }
    }

    // --- Diagnostics Panel Logic ---
    function updateDiagnosticsDisplay() {
        if (!statsTriangle || !speedTierSelect || !strikeAtkBonusTierSelect || !strikeDmgTierSelect || !spellAtkModTierSelect || !areaDmgTierSelect || !hitPointsTierSelect || !armorClassTierSelect || !savingThrowsTierSelect || !diagSpeedActualDisplay || !diagSpeedScoreDisplay || !diagOffenseScoreDisplay || !diagVitalityScoreDisplay) { return; }
        const currentLevel = parseInt(creatureLevelInput.value, 10); if (isNaN(currentLevel)) return;
        const centerX = 50, centerY = 50, maxR = 45; let actualSpeed; const speedTierVal = speedTierSelect.value;
        const localSpeedCustomInput = document.getElementById('speed_custom'); 
        if (speedTierVal === "Custom" && localSpeedCustomInput) actualSpeed = parseFloat(localSpeedCustomInput.value); else actualSpeed = parseFloat(getStatValue('speed', speedTierVal, currentLevel));
        let normalizedSpeed = 0; if (!isNaN(actualSpeed)) { diagSpeedActualDisplay.textContent = actualSpeed; normalizedSpeed = Math.max(0, Math.min(1, actualSpeed / 50)); diagSpeedScoreDisplay.textContent = normalizedSpeed.toFixed(2); } else { diagSpeedActualDisplay.textContent = "N/A"; diagSpeedScoreDisplay.textContent = "N/A"; }
        const getCustomInputValue = (statKey) => { const el = document.getElementById(`${statKey}_custom`); return el ? el.value : ""; }
        let offenseTierSum = 0; let offenseTierWeights = 0; const isMagical = isMagicalSelect.value === 'yes';
        const sabTier = getEffectiveTierForStat('strikeAtkBonus', strikeAtkBonusTierSelect.value, getCustomInputValue('strikeAtkBonus'), currentLevel);
        const sdTier = getEffectiveTierForStat('strikeDmg', strikeDmgTierSelect.value, getCustomInputValue('strikeDmg'), currentLevel);
        let smaTier = null; let adTier = null;
        if (isMagical) { smaTier = getEffectiveTierForStat('spellAtkMod', spellAtkModTierSelect.value, getCustomInputValue('spellAtkMod'), currentLevel); adTier = getEffectiveTierForStat('areaDmg', areaDmgTierSelect.value, getCustomInputValue('areaDmg'), currentLevel); }
        const offenseComponents = [];
        if (sabTier !== null && !isNaN(sabTier)) offenseComponents.push({ name: 'sab', value: sabTier, type: 'attack' });
        if (sdTier !== null && !isNaN(sdTier)) offenseComponents.push({ name: 'sd', value: sdTier, type: 'damage' });
        if (isMagical) { if (smaTier !== null && !isNaN(smaTier)) offenseComponents.push({ name: 'sma', value: smaTier, type: 'attack' }); if (adTier !== null && !isNaN(adTier)) offenseComponents.push({ name: 'ad', value: adTier, type: 'damage' });}
        if (offenseComponents.length > 0) { const damageComps = offenseComponents.filter(c => c.type === 'damage'); let highestDamageCompName = null; if (damageComps.length > 0) { damageComps.sort((a, b) => b.value - a.value); highestDamageCompName = damageComps[0].name; }
            offenseComponents.forEach(comp => { let weight = 1; if (comp.type === 'damage' && comp.name === highestDamageCompName) weight = 3; offenseTierSum += comp.value * weight; offenseTierWeights += weight; }); }
        let normalizedOffense = 0; if (offenseTierWeights > 0) { const avgOffenseTier = offenseTierSum / offenseTierWeights; normalizedOffense = Math.max(0, Math.min(1, avgOffenseTier / MAX_DIAGNOSTIC_TIER_NORMALIZATION)); diagOffenseScoreDisplay.textContent = `${avgOffenseTier.toFixed(1)} of ${MAX_DIAGNOSTIC_TIER_NORMALIZATION} (norm: ${normalizedOffense.toFixed(2)})`; } else { diagOffenseScoreDisplay.textContent = "N/A"; }
        let vitalityTierSum = 0; let vitalityTierCount = 0;
        let hpTier = getEffectiveTierForStat('hitPoints', hitPointsTierSelect.value, getCustomInputValue('hitPoints'), currentLevel);
        let acTier = getEffectiveTierForStat('armorClass', armorClassTierSelect.value, getCustomInputValue('armorClass'), currentLevel);
        let stTier = getEffectiveTierForStat('savingThrows', savingThrowsTierSelect.value, getCustomInputValue('savingThrows'), currentLevel);
        if (hpTier !== null && !isNaN(hpTier)) { vitalityTierSum += hpTier; vitalityTierCount++; } if (acTier !== null && !isNaN(acTier)) { vitalityTierSum += acTier; vitalityTierCount++; } if (stTier !== null && !isNaN(stTier)) { vitalityTierSum += stTier; vitalityTierCount++; }
        let normalizedVitality = 0; if (vitalityTierCount > 0) { const avgVitalityTier = vitalityTierSum / vitalityTierCount; normalizedVitality = Math.max(0, Math.min(1, avgVitalityTier / MAX_DIAGNOSTIC_TIER_NORMALIZATION)); diagVitalityScoreDisplay.textContent = `${avgVitalityTier.toFixed(1)} of ${MAX_DIAGNOSTIC_TIER_NORMALIZATION} (norm: ${normalizedVitality.toFixed(2)})`; } else { diagVitalityScoreDisplay.textContent = "N/A"; }
        const angleSpeed = -Math.PI/2; const angleOffense = 5*Math.PI/6; const angleVitality = Math.PI/6;
        const pSx = centerX + normalizedSpeed * maxR * Math.cos(angleSpeed); const pSy = centerY + normalizedSpeed * maxR * Math.sin(angleSpeed); const pOx = centerX + normalizedOffense * maxR * Math.cos(angleOffense); const pOy = centerY + normalizedOffense * maxR * Math.sin(angleOffense); const pVx = centerX + normalizedVitality * maxR * Math.cos(angleVitality); const pVy = centerY + normalizedVitality * maxR * Math.sin(angleVitality);
        if(statsTriangle) statsTriangle.setAttribute('points', `${pSx.toFixed(2)},${pSy.toFixed(2)} ${pOx.toFixed(2)},${pOy.toFixed(2)} ${pVx.toFixed(2)},${pVy.toFixed(2)}`);
        const campaignPartyStats = getCampaignPartyStats(); updateWarningBoxAndTTK({ speed: normalizedSpeed, offense: normalizedOffense, vitality: normalizedVitality }, campaignPartyStats);
    }

    // --- Event Listeners ---
    if(creatureLevelInput) { creatureLevelInput.addEventListener('change', updateAllStatDisplaysAndSuggestions); creatureLevelInput.addEventListener('focus', () => updateSuggestionsPanel(null, parseInt(creatureLevelInput.value,10)));}
    document.querySelectorAll('select[data-stat]').forEach(select => { populateTierSelect(select, select.dataset.stat); select.addEventListener('change', () => { updateStatDisplay(select, parseInt(creatureLevelInput.value,10)); updateDiagnosticsDisplay(); }); select.addEventListener('focus', () => { updateSuggestionsPanel(select.dataset.stat, parseInt(creatureLevelInput.value,10));});});
    document.querySelectorAll('.custom-stat-input').forEach(input => { input.addEventListener('change', updateDiagnosticsDisplay); input.addEventListener('keyup', updateDiagnosticsDisplay);});
    if(isMagicalSelect) { isMagicalSelect.addEventListener('change', (e) => { if(magicalStatsContainer) magicalStatsContainer.style.display = e.target.value === 'yes'?'block':'none'; updateDiagnosticsDisplay();});}
    if(randomNameBtn && creatureNameInput) { randomNameBtn.addEventListener('click', () => { const n=DCREATURE_DATA.randomNames; if(n&&n.length>0) creatureNameInput.value=n[Math.floor(Math.random()*n.length)];});}

    // --- Save Logic ---
    let creatureDataToSave = null; 
    function validateAndPrepareCreatureData() {
        let isValid = true; const data = { id: currentEditingCreatureIdFromURL || generateUniqueId() };
        data.name = creatureNameInput.value.trim(); if (!data.name) isValid = false; 
        data.level = parseInt(creatureLevelInput.value,10); if (isNaN(data.level)) isValid = false;
        document.querySelectorAll('select[data-stat]').forEach(select => { const statKey = select.dataset.stat; const tier = select.value; const customInput = document.getElementById(`${statKey}_custom`); let value; if (tier === "Custom") { value = customInput.type==='number'?parseFloat(customInput.value):customInput.value.trim(); if(customInput.type==='number'&&isNaN(value)) value=(statKey!=='strikeDmg'&&statKey!=='areaDmg')?0:""; if((!value&&value!==0&&value!==""))isValid=false;} else {value=getStatValue(statKey,tier,data.level);} data[`${statKey}_tier`]=tier; data[`${statKey}_value`]=value; if(value==="N/A"||value===undefined||(typeof value==='string'&&!value.trim()&&tier!=="Custom" && value !== ""))isValid=false;});
        data.isMagical = isMagicalSelect.value === 'yes';
        if (data.isMagical) { ['spellAtkMod','spellDC','areaDmg'].forEach(statKey => { const select = document.getElementById(`${statKey}_tier`); const customInput = document.getElementById(`${statKey}_custom`); if(!select){isValid=false;return;} const tier = select.value; let value; if (tier === "Custom") { value = customInput.type==='number'?parseFloat(customInput.value):customInput.value.trim(); if(customInput.type==='number'&&isNaN(value))value=0; else if(typeof value==='string'&&!value)value=""; if((!value&&value!==0&&value!==""))isValid=false;} else {value=getStatValue(statKey,tier,data.level);} data[`${statKey}_tier`]=tier; data[`${statKey}_value`]=value; if(value==="N/A"||value===undefined||(typeof value==='string'&&!value.trim()&&tier!=="Custom"&& value !== ""))isValid=false;});}
        else {data.spellAtkMod_tier="N/A";data.spellAtkMod_value=0;data.spellDC_tier="N/A";data.spellDC_value=0;data.areaDmg_tier="N/A";data.areaDmg_value="";}
        data.notes = document.getElementById('creatureNotes').value.trim();
        return { isValid, data };
    }
    function actualSaveCreature(creatureData) {
        let creatures = []; try { const eJSON = localStorage.getItem(HOMEBREW_CREATURES_KEY); if(eJSON)creatures=JSON.parse(eJSON);}catch(e){console.error("Error parsing creatures:",e);creatures=[];}
        let creatureUpdated = false;
        if(currentEditingCreatureIdFromURL){ const idToMatch = currentEditingCreatureIdFromURL; const idx = creatures.findIndex(c=>c.id===idToMatch); if(idx > -1){ creatures[idx]={...creatureData,id:idToMatch}; if(saveStatusCreature)saveStatusCreature.textContent=`Creature "${creatureData.name}" updated!`; creatureUpdated=true;} else { const oldId = creatureData.id; creatureData.id=generateUniqueId(); creatures.push(creatureData); console.warn(`Edit target ${oldId} not found. Saved as NEW with ID ${creatureData.id}.`); if(saveStatusCreature)saveStatusCreature.textContent=`Creature "${creatureData.name}" (original not found) saved as new.`;}}
        else { if(!creatureData.id)creatureData.id=generateUniqueId(); creatures.push(creatureData); if(saveStatusCreature)saveStatusCreature.textContent=`Creature "${creatureData.name}" saved to Homebrew!`;}
        try { localStorage.setItem(HOMEBREW_CREATURES_KEY, JSON.stringify(creatures)); if(saveStatusCreature&&saveStatusCreature.textContent)setTimeout(()=>{if(saveStatusCreature)saveStatusCreature.textContent='';},3000);}catch(e){console.error("Error saving to localStorage:",e);if(saveStatusCreature){saveStatusCreature.textContent=`Error saving. Storage full?`;setTimeout(()=>{if(saveStatusCreature)saveStatusCreature.textContent='';},3000);}}
        currentEditingCreatureIdFromURL=null; // Clear after save attempt
    }
    if(creatureForm) creatureForm.addEventListener('submit',(e)=>{e.preventDefault();const vResult=validateAndPrepareCreatureData();if(vResult.isValid)actualSaveCreature(vResult.data);else{creatureDataToSave=vResult.data;if(incompleteCreatureModal)incompleteCreatureModal.style.display='block';}});
    if(confirmSaveIncompleteBtn) confirmSaveIncompleteBtn.addEventListener('click',()=>{if(creatureDataToSave)actualSaveCreature(creatureDataToSave);if(incompleteCreatureModal)incompleteCreatureModal.style.display='none';creatureDataToSave=null;});
    if(cancelSaveIncompleteBtn) cancelSaveIncompleteBtn.addEventListener('click',()=>{if(incompleteCreatureModal)incompleteCreatureModal.style.display='none';creatureDataToSave=null;});
    if(closeIncompleteModalBtn) closeIncompleteModalBtn.addEventListener('click',()=>{if(incompleteCreatureModal)incompleteCreatureModal.style.display='none';creatureDataToSave=null;});
    document.addEventListener('keydown',function(event){if((event.ctrlKey||event.metaKey)&&event.key==='s'){event.preventDefault();if(saveCreatureBtn)saveCreatureBtn.click();}});

    // --- Export Creature as URL ---
    if (exportCreatureBtn) {
        exportCreatureBtn.addEventListener('click', () => {
            const params = new URLSearchParams();
            let currentLevel = 1; // Default level

            // Name
            if (creatureNameInput) params.append('name', creatureNameInput.value.trim());
            
            // Level
            if (creatureLevelInput) {
                const parsedLevel = parseInt(creatureLevelInput.value, 10);
                if (!isNaN(parsedLevel)) {
                    currentLevel = parsedLevel;
                }
            }
            params.append('level', currentLevel);

            // isMagical
            const isMagicalValue = isMagicalSelect ? isMagicalSelect.value : 'no';
            params.append('isMagical', isMagicalValue);

            // Notes
            const notesTextarea = document.getElementById('creatureNotes');
            if (notesTextarea) params.append('notes', notesTextarea.value.trim());

            // Process all stats based on select[data-stat]
            document.querySelectorAll('select[data-stat]').forEach(select => {
                const statKey = select.dataset.stat;
                const isMagicalStat = ['spellAtkMod', 'spellDC', 'areaDmg'].includes(statKey);

                // Only include magical stats in URL if creature is actually magical
                if (isMagicalStat && isMagicalValue !== 'yes') {
                    return; // Skip appending these params for non-magical creatures
                }

                const tier = select.value;
                const customInput = document.getElementById(`${statKey}_custom`);
                let valueToStore;

                if (tier === "Custom") {
                    if (customInput) {
                        const rawValue = customInput.value;
                        if (customInput.type === 'number') {
                            valueToStore = parseFloat(rawValue);
                            if (isNaN(valueToStore)) valueToStore = 0; // Default for invalid number
                        } else { // string type (e.g., damage strings, custom speed as text)
                            valueToStore = rawValue.trim();
                        }
                    } else { // Fallback if custom input element is somehow missing
                        // Determine a sensible default based on common stat types
                        valueToStore = (statKey === 'strikeDmg' || statKey === 'areaDmg') ? "" : 0; 
                    }
                } else {
                    // For non-custom tiers, get the calculated value.
                    // The importing page's initializeForm will use the tier to recalculate if not custom,
                    // but sending the value is consistent with how edit might work.
                    valueToStore = getStatValue(statKey, tier, currentLevel);
                }
                
                params.append(`${statKey}_tier`, tier);
                if (valueToStore !== undefined && valueToStore !== null) {
                    params.append(`${statKey}_value`, valueToStore);
                }
            });

            const baseUrl = window.location.href.split('?')[0]; // Get current page URL without query params
            const exportURL = baseUrl + '?' + params.toString();

            navigator.clipboard.writeText(exportURL)
                .then(() => {
                    if (saveStatusCreature) {
                        saveStatusCreature.textContent = "Creature URL copied to clipboard!";
                        setTimeout(() => { if (saveStatusCreature) saveStatusCreature.textContent = ''; }, 3000);
                    }
                })
                .catch(err => {
                    console.error('Failed to copy URL: ', err);
                    if (saveStatusCreature) {
                        saveStatusCreature.textContent = "Failed to copy. URL in prompt.";
                        setTimeout(() => { if (saveStatusCreature) saveStatusCreature.textContent = ''; }, 5000);
                    }
                    // Fallback for browsers where clipboard API might fail or not be permitted
                    prompt("Could not copy to clipboard. Manually copy this URL:", exportURL);
                });
        });
    }

    // --- URL Parameter Loading & Form Population ---
    function loadCreatureFromURLParams() { 
        const params = new URLSearchParams(window.location.search);
        let isEditModeById = false; // Specifically tracks if an 'id' was present for editing an existing entity

        if (params.has('id')) {
            currentEditingCreatureIdFromURL = params.get('id');
            isEditModeById = true; // It's an edit of an existing creature
            // Name and Level might also be in params for quick load, but initializeForm will handle general param loading.
            if (creatureNameInput && params.has('name')) creatureNameInput.value = params.get('name');
            // Level will be handled by initializeForm's updated logic
            console.log("Attempting to load creature for editing. ID:", currentEditingCreatureIdFromURL);
        } else {
            currentEditingCreatureIdFromURL = null; // No 'id', so it's a new creature or from an export URL
        }
        return isEditModeById; // This indicates if we are editing a *saved* creature
    }

    function initializeForm() {
        const campaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (!campaignName && noCampaignModalCreatureGen) { openNoCampaignModalCreatureGen(); return; }
        if (creatureGeneratorPageContent) creatureGeneratorPageContent.style.display = 'block';

        const params = new URLSearchParams(window.location.search);
        const isEditModeById = loadCreatureFromURLParams(); // Sets currentEditingCreatureIdFromURL

        // Set Level: Prioritize 'level' param if present, else use party avg for new, or keep existing for edit.
        if (params.has('level') && creatureLevelInput) {
            const levelVal = parseInt(params.get('level'), 10);
            if(!isNaN(levelVal)) {
                creatureLevelInput.value = Math.max(-1, Math.min(24, levelVal)); // Clamp level
            } else {
                creatureLevelInput.value = 1; // Default if 'level' param is invalid
            }
        } else if (!isEditModeById && creatureLevelInput) { // True new form (no 'id' and no 'level' param)
            const partyStats = getCampaignPartyStats();
            creatureLevelInput.value = (partyStats.avgLevel !== null && !isNaN(partyStats.avgLevel)) ? Math.max(-1, Math.min(24, partyStats.avgLevel)) : 1;
        } else if (creatureLevelInput && (creatureLevelInput.value === "" || isNaN(parseInt(creatureLevelInput.value)))) {
            // Fallback if level is still not set (e.g. edit mode without level param somehow)
            creatureLevelInput.value = 1; 
        }
        
        // Name: Load from param if present (covers export URL and edit URL if name is there)
        if (params.has('name') && creatureNameInput) {
             creatureNameInput.value = params.get('name');
        }


        // Populate and set stat selects and custom inputs from params
        document.querySelectorAll('select[data-stat]').forEach(select => {
            populateTierSelect(select, select.dataset.stat); 
            const statKey = select.dataset.stat;

            if (params.has(`${statKey}_tier`)) { // Check if tier for this stat is in URL
                const tierFromParam = params.get(`${statKey}_tier`);
                // Check if this tier is a valid option in the select
                let validTier = false;
                for(let i=0; i < select.options.length; i++){
                    if(select.options[i].value === tierFromParam) {
                        validTier = true;
                        break;
                    }
                }

                if (validTier) {
                    select.value = tierFromParam; 
                } else { // Fallback to Moderate or first option if tier from URL is invalid
                    select.value = (DCREATURE_DATA[select.dataset.stat] && DCREATURE_DATA[select.dataset.stat].Moderate !== undefined) ? 'Moderate' : (select.options.length > 0 ? select.options[0].value : '');
                }

                if (select.value === "Custom") { // Use select.value after potential validation/fallback
                    const customInput = document.getElementById(`${statKey}_custom`);
                    if (customInput && params.has(`${statKey}_value`)) {
                        customInput.value = params.get(`${statKey}_value`);
                    }
                }
            } else if (!isEditModeById) { // Default for new forms (no 'id' and no specific stat_tier param)
                if (DCREATURE_DATA[select.dataset.stat] && DCREATURE_DATA[select.dataset.stat].Moderate !== undefined) {
                    select.value = 'Moderate';
                } else if (select.options.length > 0) {
                    select.value = select.options[0].value;
                }
            }
        });

        if (params.has('isMagical') && isMagicalSelect) {
            isMagicalSelect.value = params.get('isMagical');
        } else if (!isEditModeById && isMagicalSelect) { // Default for new forms if not in params
             isMagicalSelect.value = 'no';
        }

        if (params.has('notes')) {
            const notesTextarea = document.getElementById('creatureNotes');
            if (notesTextarea) notesTextarea.value = params.get('notes');
        }
        
        if(isMagicalSelect && magicalStatsContainer) magicalStatsContainer.style.display = isMagicalSelect.value === 'yes'?'block':'none';
        updateAllStatDisplaysAndSuggestions(); 
    }
    initializeForm();
});