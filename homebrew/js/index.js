// index.js (for Homebrew Catalog page)
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const addNewHomebrewAssetBtn = document.getElementById('addNewHomebrewAssetBtn');
    const customAddAssetDropdown = document.getElementById('customAddAssetDropdown');
    const homebrewAssetsColumnsContainer = document.getElementById('homebrewAssetsContainer'); // Will hold columns
    const saveAllHomebrewBtn = document.getElementById('saveAllHomebrewBtn');
    const saveStatusHomebrew = document.getElementById('saveStatusHomebrew');

    // Sort and Filter Controls (ensure these IDs match your HTML for homebrewcatalog.html)
    const sortAssetsBySelect = document.getElementById('sortAssetsBy');
    const reverseSortBtn = document.getElementById('reverseSortBtn');
    const filterPanel = document.getElementById('filterPanel'); // The <aside> element

    // No Campaign Modal (Using IDs from your HTML's newUserModal)
    const noCampaignModalHomebrew = document.getElementById('newUserModal');
    const closeModalHomebrewBtn = noCampaignModalHomebrew ? noCampaignModalHomebrew.querySelector('.close-button') : null;
    const modalCreateNewCampaignBtnHomebrew = document.getElementById('createNewCampaignBtn'); 
    const modalViewCatalogAnywayBtn = document.getElementById('importCampaignBtn'); 

    // Edit Creature Modal (Functionality is redirect)
    const editCreatureModal = document.getElementById('editCreatureModal'); // Keep if HTML structure exists
    const closeEditCreatureModalBtn = editCreatureModal ? editCreatureModal.querySelector('.close-edit-creature-modal-btn') : null;

    // Delete Asset Confirm Modal
    const deleteAssetConfirmModal = document.getElementById('deleteAssetConfirmModal');
    const closeDeleteAssetConfirmModalBtn = deleteAssetConfirmModal ? deleteAssetConfirmModal.querySelector('.close-delete-asset-confirm-modal-btn') : null;
    const deleteAssetConfirmMessage = document.getElementById('deleteAssetConfirmMessage');
    const confirmDeleteAssetBtn = document.getElementById('confirmDeleteAssetBtn');
    const cancelDeleteAssetBtn = document.getElementById('cancelDeleteAssetBtn');
    let assetToDelete = { id: null, type: null, name: null };

    // Add New Item Modal (Ensure IDs match your HTML for the item creation modal)
    const addNewItemModal = document.getElementById('addNewItemModal');
    const closeAddNewItemModalBtn = document.getElementById('closeAddNewItemModalBtn');
    const addNewItemForm = document.getElementById('addNewItemForm');
    const newItemNameInput = document.getElementById('newItemName');
    const newItemDurabilityInput = document.getElementById('newItemDurability');
    const newItemDescriptionInput = document.getElementById('newItemDescription');
    const cancelNewItemBtn = document.getElementById('cancelNewItemBtn');

    // Add New Spell Modal (Ensure IDs match your HTML for the spell creation modal)
    const addNewSpellModal = document.getElementById('addNewSpellModal');
    const closeAddNewSpellModalBtn = document.getElementById('closeAddNewSpellModalBtn');
    const addNewSpellForm = document.getElementById('addNewSpellForm');
    const newSpellNameInput = document.getElementById('newSpellName');
    const newSpellRequiredLevelInput = document.getElementById('newSpellRequiredLevel');
    const newSpellDescriptionInput = document.getElementById('newSpellDescription');
    const cancelNewSpellBtn = document.getElementById('cancelNewSpellBtn');


    // --- Storage Keys & Data ---
    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    const HOMEBREW_CREATURES_KEY = 'ttrpgSuite_homebrewCreatures';
    const HOMEBREW_ITEMS_KEY = 'ttrpgSuite_homebrewItems';
    const HOMEBREW_SPELLS_KEY = 'ttrpgSuite_homebrewSpells';

    let allHomebrewAssets = { creatures: [], items: [], spells: [] };
    let currentSort = { property: 'alphabetical', reversed: false };
    let currentFilters = { creature: true, item: true, spell: true }; // Default: all checked

    const NUM_COLUMNS = 2; // Define number of columns for asset display

    // --- Cookie/LocalStorage Helpers ---
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

    // --- Generic Modal Controls ---
    function openModal(modalElement) {
        if (modalElement) modalElement.style.display = 'block';
    }
    function closeModal(modalElement) {
        if (modalElement) modalElement.style.display = 'none';
    }
    
    // --- "No Campaign" Modal Logic ---
    if(noCampaignModalHomebrew) {
        if(closeModalHomebrewBtn) closeModalHomebrewBtn.addEventListener('click', () => closeModal(noCampaignModalHomebrew));
        if(modalViewCatalogAnywayBtn && modalViewCatalogAnywayBtn.id === 'importCampaignBtn') { 
            modalViewCatalogAnywayBtn.addEventListener('click', () => {
                // Assuming this button means "View Catalog Anyway" despite its ID/HTML text
                closeModal(noCampaignModalHomebrew);
            });
        }
        if (modalCreateNewCampaignBtnHomebrew) {
            modalCreateNewCampaignBtnHomebrew.addEventListener('click', () => {
                const newCampaignName = "New Campaign";
                const dummyCampaignData = { 
                    name: newCampaignName, 
                    description: "A new adventure begins!", 
                    genre: "Fantasy", 
                    maturityRating: "TV-14", 
                    partyMembers: [], 
                    sessions: [] // Ensure new campaigns have session array
                };
                setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, JSON.stringify(dummyCampaignData), 365);
                setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365);
                window.location.href = '../index.html'; // Adjust to your Campaign Details page path
            });
        }
    }


    // --- Add New Asset Custom Dropdown & Handling ---
    if (addNewHomebrewAssetBtn && customAddAssetDropdown) {
        addNewHomebrewAssetBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            customAddAssetDropdown.style.display = customAddAssetDropdown.style.display === 'block' ? 'none' : 'block';
        });
        customAddAssetDropdown.querySelectorAll('a[data-asset-type]').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const assetType = event.target.dataset.assetType;
                customAddAssetDropdown.style.display = 'none';
                handleAddNewAsset(assetType);
            });
        });
    }

    // --- Add New Item Modal Logic ---
    if (addNewItemModal) {
        if (closeAddNewItemModalBtn) {
            closeAddNewItemModalBtn.addEventListener('click', () => {
                closeModal(addNewItemModal);
                if (addNewItemForm) addNewItemForm.reset();
            });
        }
        if (cancelNewItemBtn) {
            cancelNewItemBtn.addEventListener('click', () => {
                closeModal(addNewItemModal);
                if (addNewItemForm) addNewItemForm.reset();
            });
        }
        if (addNewItemForm) {
            addNewItemForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const itemName = newItemNameInput.value.trim();
                const itemDurability = newItemDurabilityInput.value.trim();
                const itemDescription = newItemDescriptionInput.value.trim();

                if (!itemName) { alert("Item Name is required."); newItemNameInput.focus(); return; }
                if (!itemDescription) { alert("Item Description is required."); newItemDescriptionInput.focus(); return;}

                const newItemData = { id: generateUniqueId(), assetType: 'item', name: itemName, durability: itemDurability, description: itemDescription, isExpanded: false, createdAt: Date.now() };
                allHomebrewAssets.items.push(newItemData);
                saveHomebrewAssets('items'); 
                closeModal(addNewItemModal);
                addNewItemForm.reset(); 
                processAndRenderAssets(); 
                if (saveStatusHomebrew) { saveStatusHomebrew.textContent = `Item "${itemName}" added and saved!`; setTimeout(() => { if (saveStatusHomebrew) saveStatusHomebrew.textContent = ''; }, 3000); }
            });
        }
    }

    // --- Add New Spell Modal Logic ---
    if (addNewSpellModal) {
        if (closeAddNewSpellModalBtn) {
            closeAddNewSpellModalBtn.addEventListener('click', () => {
                closeModal(addNewSpellModal);
                if (addNewSpellForm) addNewSpellForm.reset();
            });
        }
        if (cancelNewSpellBtn) {
            cancelNewSpellBtn.addEventListener('click', () => {
                closeModal(addNewSpellModal);
                if (addNewSpellForm) addNewSpellForm.reset();
            });
        }
        if (addNewSpellForm) {
            addNewSpellForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const spellName = newSpellNameInput.value.trim();
                const spellRequiredLevel = newSpellRequiredLevelInput.value.trim();
                const spellDescription = newSpellDescriptionInput.value.trim();
                if (!spellName) { alert("Spell Name is required."); newSpellNameInput.focus(); return; }
                if (!spellDescription) { alert("Spell Description is required."); newSpellDescriptionInput.focus(); return;}
                const newSpellData = { id: generateUniqueId(), assetType: 'spell', name: spellName, requiredLevel: spellRequiredLevel, description: spellDescription, isExpanded: false, createdAt: Date.now() };
                allHomebrewAssets.spells.push(newSpellData);
                saveHomebrewAssets('spells');
                closeModal(addNewSpellModal);
                addNewSpellForm.reset();
                processAndRenderAssets();
                if (saveStatusHomebrew) { saveStatusHomebrew.textContent = `Spell "${spellName}" added and saved!`; setTimeout(() => { if (saveStatusHomebrew) saveStatusHomebrew.textContent = ''; }, 3000); }
            });
        }
    }
    
    function handleAddNewAsset(type) {
        if (type === 'creature') {
            window.location.href = '../creature-generator'; // Adjust path as needed
        } else if (type === 'item') {
            if (addNewItemForm) addNewItemForm.reset();
            openModal(addNewItemModal); 
            if (newItemNameInput) newItemNameInput.focus();
        } else if (type === 'spell') {
            if (addNewSpellForm) addNewSpellForm.reset();
            openModal(addNewSpellModal);
            if (newSpellNameInput) newSpellNameInput.focus();
        }
    }
    
    // --- Edit Creature: Redirect to Generator ---
    function redirectToCreatureEditor(creatureId) {
        const creature = allHomebrewAssets.creatures.find(c => c.id === creatureId);
        if (!creature) { console.error("Creature not found for editing:", creatureId); return; }
        const params = new URLSearchParams();
        params.append('id', creature.id);
        params.append('name', creature.name);
        params.append('level', creature.level);
        // Add all relevant creature properties to params...
        const statsToParam = ['armorClass', 'hitPoints', 'speed', 'attrMod', 'perception', 'skills', 'savingThrows', 'strikeAtkBonus', 'strikeDmg', 'resistAndWeak'];
        statsToParam.forEach(statKey => {
            if (creature[`${statKey}_tier`]) params.append(`${statKey}_tier`, creature[`${statKey}_tier`]);
            if (creature[`${statKey}_value`] !== undefined) params.append(`${statKey}_value`, creature[`${statKey}_value`]);
        });
        params.append('isMagical', creature.isMagical ? 'yes' : 'no');
        if (creature.isMagical) {
            const magicalStats = ['spellAtkMod', 'spellDC', 'areaDmg'];
            magicalStats.forEach(statKey => {
                 if (creature[`${statKey}_tier`]) params.append(`${statKey}_tier`, creature[`${statKey}_tier`]);
                 if (creature[`${statKey}_value`] !== undefined) params.append(`${statKey}_value`, creature[`${statKey}_value`]);
            });
        }
        if(creature.notes) params.append('notes', creature.notes);
        window.location.href = `../creature-generator?${params.toString()}`; // Adjust path
    }

    // --- Delete Asset Modal & Logic ---
    if(deleteAssetConfirmModal) { // Ensure modal element exists
        if(closeDeleteAssetConfirmModalBtn) closeDeleteAssetConfirmModalBtn.addEventListener('click', () => closeModal(deleteAssetConfirmModal));
        if(cancelDeleteAssetBtn) cancelDeleteAssetBtn.addEventListener('click', () => closeModal(deleteAssetConfirmModal));
        if(confirmDeleteAssetBtn) {
            confirmDeleteAssetBtn.addEventListener('click', () => {
                if (assetToDelete.id && assetToDelete.type) {
                    let listChanged = false;
                    const typePlural = assetToDelete.type + 's'; 

                    if (allHomebrewAssets[typePlural]) {
                        allHomebrewAssets[typePlural] = allHomebrewAssets[typePlural].filter(asset => asset.id !== assetToDelete.id);
                        saveHomebrewAssets(typePlural);
                        listChanged = true;
                    }
                    
                    if (listChanged) {
                        processAndRenderAssets(); // Refresh display
                        if(saveStatusHomebrew) {
                            saveStatusHomebrew.textContent = `"${assetToDelete.name || 'Asset'}" deleted.`;
                            setTimeout(() => {if(saveStatusHomebrew)saveStatusHomebrew.textContent = ''}, 3000);
                        }
                    }
                }
                closeModal(deleteAssetConfirmModal);
                assetToDelete = { id: null, type: null, name: null };
            });
        }
    }
    
    function openDeleteConfirmationModal(id, name, type) {
        assetToDelete = { id, type, name };
        if(deleteAssetConfirmMessage) deleteAssetConfirmMessage.textContent = `Are you sure you want to delete "${name || 'this asset'}"? This action is permanent.`;
        openModal(deleteAssetConfirmModal);
    }

    // --- Save & Load Homebrew Assets ---
    function saveHomebrewAssets(assetTypeKeyPlural) {
        try {
            const keyMap = {
                'creatures': HOMEBREW_CREATURES_KEY,
                'items': HOMEBREW_ITEMS_KEY,
                'spells': HOMEBREW_SPELLS_KEY
            };
            const storageKey = keyMap[assetTypeKeyPlural];
            if (storageKey && allHomebrewAssets[assetTypeKeyPlural]) {
                localStorage.setItem(storageKey, JSON.stringify(allHomebrewAssets[assetTypeKeyPlural]));
                console.log(`${assetTypeKeyPlural} saved to localStorage using key ${storageKey}.`);
            } else {
                console.warn("Invalid asset type key for saving:", assetTypeKeyPlural);
            }
        } catch (e) {
            console.error(`Error saving ${assetTypeKeyPlural} to localStorage:`, e);
            if (saveStatusHomebrew) saveStatusHomebrew.textContent = "Error saving assets!";
        }
    }

    function loadAllHomebrewAssets() {
        const now = Date.now();
        try {
            allHomebrewAssets.creatures = JSON.parse(localStorage.getItem(HOMEBREW_CREATURES_KEY) || '[]').map(c => ({...c, assetType: 'creature', isExpanded: false, createdAt: c.createdAt || now}));
            allHomebrewAssets.items = JSON.parse(localStorage.getItem(HOMEBREW_ITEMS_KEY) || '[]').map(i => ({...i, assetType: 'item', isExpanded: false, createdAt: i.createdAt || now}));
            allHomebrewAssets.spells = JSON.parse(localStorage.getItem(HOMEBREW_SPELLS_KEY) || '[]').map(s => ({...s, assetType: 'spell', isExpanded: false, createdAt: s.createdAt || now}));
        } catch (e) {
            console.error("Error loading homebrew assets from localStorage:", e);
            allHomebrewAssets = { creatures: [], items: [], spells: [] };
        }
        processAndRenderAssets(); // This will filter, sort, and then render
    }
    
    // --- Sorting and Filtering Logic ---
    function applyFiltersAndSort() {
        // Ensure assetType is present on all loaded assets for reliable filtering
        let combinedAssets = [
            ...(allHomebrewAssets.creatures || []),
            ...(allHomebrewAssets.items || []),
            ...(allHomebrewAssets.spells || [])
        ].map(asset => ({ // Ensure assetType is part of each object if not already
            ...asset, 
            assetType: asset.assetType || (allHomebrewAssets.creatures.includes(asset) ? 'creature' : (allHomebrewAssets.items.includes(asset) ? 'item' : 'spell'))
        }));


        // Apply Filters
        if (currentFilters && Object.keys(currentFilters).length > 0) {
            const activeAssetTypes = Object.keys(currentFilters).filter(type => currentFilters[type]);
            if (activeAssetTypes.length > 0) { // Only filter if some types are selected
                 combinedAssets = combinedAssets.filter(asset => asset.assetType && activeAssetTypes.includes(asset.assetType));
            } else { // If no filters checked, show nothing (or everything, depending on desired behavior)
                combinedAssets = []; // Show nothing if no filter is active
            }
        }

        // Apply Sort
        if (currentSort && currentSort.property) {
            switch (currentSort.property) {
                case 'alphabetical':
                    combinedAssets.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                    break;
                case 'createdAt':
                    combinedAssets.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                    break;
                case 'nameLength':
                    combinedAssets.sort((a, b) => (a.name || "").length - (b.name || "").length);
                    break;
            }
            if (currentSort.reversed) {
                combinedAssets.reverse();
            }
        }
        return combinedAssets;
    }
    
    function processAndRenderAssets() {
        const assetsToRender = applyFiltersAndSort();
        renderHomebrewAssets(assetsToRender);
    }

    // Event Listeners for Sort Controls
    if (sortAssetsBySelect) {
        sortAssetsBySelect.addEventListener('change', (e) => {
            currentSort.property = e.target.value;
            processAndRenderAssets();
        });
    }
    if (reverseSortBtn) {
        reverseSortBtn.addEventListener('click', () => {
            currentSort.reversed = !currentSort.reversed;
            reverseSortBtn.innerHTML = currentSort.reversed ? '&#x2191;' : '&#x2193;'; 
            reverseSortBtn.title = currentSort.reversed ? "Sort Ascending" : "Sort Descending";
            processAndRenderAssets();
        });
    }

    // Event Listeners for Filter Controls
    if (filterPanel) {
        filterPanel.querySelectorAll('input[type="checkbox"][data-filter-type]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filterType;
                if (filterType && currentFilters.hasOwnProperty(filterType)) {
                    currentFilters[filterType] = e.target.checked;
                    processAndRenderAssets();
                }
            });
        });
    }
    
    // Helper function for individual card expansion
    const setupExpansionToggle = (cardElement, assetObject) => {
        const header = cardElement.querySelector('.homebrew-asset-header');
        const expandIcon = header ? header.querySelector('.expand-icon') : null;
        if (header && expandIcon) {
            header.addEventListener('click', () => {
                assetObject.isExpanded = !assetObject.isExpanded;
                cardElement.classList.toggle('expanded');
                //expandIcon.textContent = assetObject.isExpanded ? '▼' : '►';
            });
        }
    };
    
    // --- Render Assets into Columns ---
    function renderHomebrewAssets(assetsToRender) {
        if (!homebrewAssetsColumnsContainer) {
            console.error("Asset columns container #homebrewAssetsContainer not found!");
            return;
        }
        homebrewAssetsColumnsContainer.innerHTML = ''; 

        if (!assetsToRender || assetsToRender.length === 0) {
            homebrewAssetsColumnsContainer.innerHTML = "<p>No homebrew assets match your current filters or none exist.</p>";
            return;
        }

        // Create column divs
        const columns = [];
        for (let i = 0; i < NUM_COLUMNS; i++) {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'asset-column';
            columns.push(columnDiv);
            homebrewAssetsColumnsContainer.appendChild(columnDiv);
        }

        // Distribute assets into columns
        assetsToRender.forEach((asset, index) => {
            const columnIndex = index % NUM_COLUMNS;
            const card = createAssetCard(asset); 
            if (columns[columnIndex]) {
                columns[columnIndex].appendChild(card);
            } else {
                console.error("Error: Column index out of bounds during rendering.");
                // Fallback: append to main container if columns somehow fail
                homebrewAssetsColumnsContainer.appendChild(card);
            }
        });
    }

    function createAssetCard(asset) { // asset should have assetType property
        const card = document.createElement('div');
        card.className = `homebrew-asset-card ${asset.assetType}-card`;
        if (asset.isExpanded) card.classList.add('expanded');
        card.dataset.assetId = asset.id;

        let contentHtml = '';
        const assetTypeDisplay = asset.assetType ? asset.assetType.charAt(0).toUpperCase() + asset.assetType.slice(1) : 'Asset';
        let headerName = asset.name || `New ${assetTypeDisplay}`;


        if (asset.assetType === 'creature') {
            let creatureDetailsHtml = '<div class="creature-full-details">';
            creatureDetailsHtml += `<p><strong>Name:</strong> ${asset.name || 'N/A'}</p>`;
            creatureDetailsHtml += `<p><strong>Level:</strong> ${asset.level !== undefined ? asset.level : 'N/A'}</p>`;
            const simpleStats = ['hitPoints', 'armorClass', 'speed', 'perception', 'savingThrows', 'skills', 'attrMod', 'strikeAtkBonus', 'resistAndWeak'];
            simpleStats.forEach(key => {
                const tier = asset[`${key}_tier`];
                const value = asset[`${key}_value`];
                const keyDisplay = (key.charAt(0).toUpperCase() + key.slice(1)).replace(/([A-Z])/g, ' $1');
                if (value !== undefined) {
                     creatureDetailsHtml += `<p><strong>${keyDisplay}:</strong> ${value} ${tier && tier !== 'Custom' ? `(${tier})` : ''}</p>`;
                }
            });
            if (asset.strikeDmg_value) { creatureDetailsHtml += `<p><strong>Strike Damage:</strong> ${asset.strikeDmg_value} ${asset.strikeDmg_tier && asset.strikeDmg_tier !== 'Custom' ? `(${asset.strikeDmg_tier})` : ''}</p>`; }
            creatureDetailsHtml += `<p><strong>Magical:</strong> ${asset.isMagical ? 'Yes' : 'No'}</p>`;
            if (asset.isMagical) {
                const magicalStats = ['spellAtkMod', 'spellDC', 'areaDmg'];
                 magicalStats.forEach(key => {
                    const tier = asset[`${key}_tier`];
                    const value = asset[`${key}_value`];
                    const keyDisplay = (key.charAt(0).toUpperCase() + key.slice(1)).replace(/([A-Z])/g, ' $1');
                    if (value !== undefined && (value !== 0 || typeof value === 'string' && value !== "")) { 
                         creatureDetailsHtml += `<p><strong>${keyDisplay}:</strong> ${value} ${tier && tier !== 'Custom' && tier !== "N/A" ? `(${tier})` : ''}</p>`;
                    }
                });
            }
            if (asset.notes) { creatureDetailsHtml += `<p class="notes-section"><strong>Notes:</strong><br>${asset.notes.replace(/\n/g, '<br>')}</p>`;}
            creatureDetailsHtml += '</div>';
            creatureDetailsHtml += `
                <div class="asset-inline-actions">
                    <button class="btn btn-primary edit-creature-btn">Edit</button>
                    <button class="btn btn-delete delete-asset-btn">Delete</button>
                </div>`;
            contentHtml = creatureDetailsHtml;
        } else if (asset.assetType === 'item') {
            contentHtml = `
                <div class="form-group">
                    <label for="item-name-${asset.id}">Name:</label>
                    <input type="text" id="item-name-${asset.id}" data-field="name" value="${asset.name || ''}">
                </div>
                <div class="form-group">
                    <label for="item-durability-${asset.id}">Durability:</label>
                    <input type="text" id="item-durability-${asset.id}" data-field="durability" value="${asset.durability || ''}" placeholder="e.g., 10/10 or Sturdy">
                </div>
                <div class="form-group">
                    <label for="item-description-${asset.id}">Description:</label>
                    <textarea id="item-description-${asset.id}" data-field="description" rows="3" placeholder="Item description...">${asset.description || ''}</textarea>
                </div>
                <div class="asset-inline-actions">
                    <button class="btn btn-delete delete-asset-btn">Delete</button>
                </div>`;
        } else if (asset.assetType === 'spell') {
            contentHtml = `
                <div class="form-group">
                    <label for="spell-name-${asset.id}">Name:</label>
                    <input type="text" id="spell-name-${asset.id}" data-field="name" value="${asset.name || ''}">
                </div>
                <div class="form-group">
                    <label for="spell-level-${asset.id}">Required Level:</label>
                    <input type="text" id="spell-level-${asset.id}" data-field="requiredLevel" value="${asset.requiredLevel || ''}" placeholder="e.g., 3rd-level spell or Cantrip">
                </div>
                <div class="form-group">
                    <label for="spell-description-${asset.id}">Description:</label>
                    <textarea id="spell-description-${asset.id}" data-field="description" rows="3" placeholder="Spell description...">${asset.description || ''}</textarea>
                </div>
                <div class="asset-inline-actions">
                    <button class="btn btn-delete delete-asset-btn">Delete</button>
                </div>`;
        }
        
        card.innerHTML = `
            <div class="homebrew-asset-header">
                <h3>${headerName}</h3> 
                <div class="homebrew-asset-subdiv">
                    <span class="asset-type-badge">${assetTypeDisplay}</span>
                    <div class="expand-icon">►</div>
                </div>
            </div>
            <div class="homebrew-asset-content">
                ${contentHtml}
            </div>`;

        setupExpansionToggle(card, asset);

        if (asset.assetType === 'creature') {
            const editBtn = card.querySelector('.edit-creature-btn');
            if(editBtn) editBtn.addEventListener('click', () => redirectToCreatureEditor(asset.id));
        }
        const deleteBtn = card.querySelector('.delete-asset-btn');
        if(deleteBtn) deleteBtn.addEventListener('click', () => openDeleteConfirmationModal(asset.id, asset.name, asset.assetType));
        
        if (asset.assetType === 'item' || asset.assetType === 'spell') {
            card.querySelectorAll('input, textarea').forEach(el => {
                el.addEventListener('input', (e) => {
                    const field = e.target.dataset.field;
                    if(field) {
                        asset[field] = e.target.value;
                        if (field === 'name') {
                            const nameDisplayH3 = card.querySelector('.homebrew-asset-header h3');
                            if(nameDisplayH3) nameDisplayH3.textContent = e.target.value || `New ${asset.assetType.charAt(0).toUpperCase() + asset.assetType.slice(1)}`;
                        }
                    }
                    if (saveAllHomebrewBtn) saveAllHomebrewBtn.style.display = 'inline-block';
                });
            });
        }
        return card;
    }
    
    // Save All Button for items/spells
    if (saveAllHomebrewBtn) {
        saveAllHomebrewBtn.addEventListener('click', () => {
            saveHomebrewAssets('items');
            saveHomebrewAssets('spells');
            if(saveStatusHomebrew) {
                saveStatusHomebrew.textContent = "Item and Spell changes saved.";
                setTimeout(() => {if(saveStatusHomebrew) saveStatusHomebrew.textContent = ''}, 3000);
            }
            saveAllHomebrewBtn.style.display = 'none';
        });
    }

    // --- Initial Page Load ---
    function initializeCatalogPage() {
        const campaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        let campaignDataExists = false;
        if (campaignName) {
            const campaignDataString = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
            if (campaignDataString) {
                try {
                    JSON.parse(campaignDataString);
                    campaignDataExists = true;
                } catch(e) {
                    console.warn("Campaign data for", campaignName, "is corrupted. Clearing last viewed key.");
                    setCookie(LAST_VIEWED_CAMPAIGN_KEY, '', -1);
                }
            }
        }

        if (!campaignDataExists && noCampaignModalHomebrew) {
            openModal(noCampaignModalHomebrew);
        }
        
        loadAllHomebrewAssets(); 
        
        if(reverseSortBtn) { 
            reverseSortBtn.innerHTML = currentSort.reversed ? '&#x2191;' : '&#x2193;';
            reverseSortBtn.title = currentSort.reversed ? "Sort Ascending" : "Sort Descending";
        }

    }

    initializeCatalogPage();
    
    // Window click listener for closing modals
    window.addEventListener('click', (event) => {
        if (customAddAssetDropdown && customAddAssetDropdown.style.display === 'block') {
            if (addNewHomebrewAssetBtn && !addNewHomebrewAssetBtn.contains(event.target) && !customAddAssetDropdown.contains(event.target)) {
                customAddAssetDropdown.style.display = 'none';
            }
        }
        if (noCampaignModalHomebrew && event.target === noCampaignModalHomebrew) closeModal(noCampaignModalHomebrew);
        if (editCreatureModal && event.target === editCreatureModal) closeModal(editCreatureModal); // For the placeholder modal
        if (deleteAssetConfirmModal && event.target === deleteAssetConfirmModal) closeModal(deleteAssetConfirmModal);
        if (addNewItemModal && event.target === addNewItemModal) { 
            closeModal(addNewItemModal);
            if(addNewItemForm) addNewItemForm.reset();
        }
        if (addNewSpellModal && event.target === addNewSpellModal) { 
            closeModal(addNewSpellModal);
            if(addNewSpellForm) addNewSpellForm.reset();
        }
    });
});