// index.js (for Homebrew Catalog page)
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const addNewHomebrewAssetBtn = document.getElementById('addNewHomebrewAssetBtn');
    const customAddAssetDropdown = document.getElementById('customAddAssetDropdown');
    const homebrewAssetsColumnsContainer = document.getElementById('homebrewAssetsContainer');
    const saveAllHomebrewBtn = document.getElementById('saveAllHomebrewBtn'); // This will be hidden/removed.
    const saveStatusHomebrew = document.getElementById('saveStatusHomebrew');

    const sortAssetsBySelect = document.getElementById('sortAssetsBy');
    const reverseSortBtn = document.getElementById('reverseSortBtn');
    const filterPanel = document.getElementById('filterPanel');

    // No Campaign Modal
    const noCampaignModalHomebrew = document.getElementById('newUserModal');
    const closeModalHomebrewBtn = noCampaignModalHomebrew ? noCampaignModalHomebrew.querySelector('.close-button') : null;
    const modalCreateNewCampaignBtnHomebrew = document.getElementById('createNewCampaignBtn');
    const modalActionBtn = document.getElementById('importCampaignBtn');

    // Delete Asset Confirm Modal
    const deleteAssetConfirmModal = document.getElementById('deleteAssetConfirmModal');
    const closeDeleteAssetConfirmModalBtn = deleteAssetConfirmModal ? deleteAssetConfirmModal.querySelector('.close-delete-asset-confirm-modal-btn') : null;
    const deleteAssetConfirmMessage = document.getElementById('deleteAssetConfirmMessage');
    const confirmDeleteAssetBtn = document.getElementById('confirmDeleteAssetBtn');
    const cancelDeleteAssetBtn = document.getElementById('cancelDeleteAssetBtn');
    let assetToDelete = { id: null, type: null, name: null };

    // Add New Item Modal
    const addNewItemModal = document.getElementById('addNewItemModal');
    const closeAddNewItemModalBtn = document.getElementById('closeAddNewItemModalBtn');
    const addNewItemForm = document.getElementById('addNewItemForm');
    const newItemNameInput = document.getElementById('newItemName');
    const newItemDurabilityInput = document.getElementById('newItemDurability');
    const newItemDescriptionInput = document.getElementById('newItemDescription');
    const cancelNewItemBtn = document.getElementById('cancelNewItemBtn');

    // Add New Spell Modal
    const addNewSpellModal = document.getElementById('addNewSpellModal');
    const closeAddNewSpellModalBtn = document.getElementById('closeAddNewSpellModalBtn');
    const addNewSpellForm = document.getElementById('addNewSpellForm');
    const newSpellNameInput = document.getElementById('newSpellName');
    const newSpellRequiredLevelInput = document.getElementById('newSpellRequiredLevel');
    const newSpellDescriptionInput = document.getElementById('newSpellDescription');
    const cancelNewSpellBtn = document.getElementById('cancelNewSpellBtn');

    // --- Data Storage Keys ---
    const LAST_VIEWED_CAMPAIGN_KEY = 'ttrpgSuite_lastViewedCampaign';
    const CAMPAIGN_DATA_PREFIX = 'ttrpgSuite_campaignData_';
    const CREATURE_DATA_PREFIX = 'ttrpgSuite_creature_';
    const ITEM_DATA_PREFIX = 'ttrpgSuite_item_';
    const SPELL_DATA_PREFIX = 'ttrpgSuite_spell_';
    
    let currentCampaignFullData = null; // Holds the campaign manifest (with asset IDs)
    let currentSort = { property: 'alphabetical', reversed: false };
    let currentFilters = { creature: true, item: true, spell: true };
    const NUM_COLUMNS = 2;

    // --- Cookie Helpers (JSON-aware) ---
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
                        return JSON.parse(decoded);
                    } catch (e) {
                        return decoded;
                    }
                } catch (e) {
                    return value;
                }
            }
        }
        return null;
    }
    
    function deleteCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }

    function keyToTitleCase(str) {
        if (!str) return '';
        // Handles camelCase and snake_case to produce a readable Title Case string.
        return str
            .replace(/_/g, ' ') 
            .replace(/([A-Z])/g, ' $1') 
            .replace(/\b\w/g, char => char.toUpperCase()) 
            .trim();
    }

    // --- Generic Modal Controls ---
    function openModal(modalElement) { if (modalElement) modalElement.style.display = 'block'; }
    function closeModal(modalElement) { if (modalElement) modalElement.style.display = 'none'; }

    // --- "No Campaign" Modal Logic ---
    if (noCampaignModalHomebrew) {
        if (closeModalHomebrewBtn) closeModalHomebrewBtn.addEventListener('click', () => closeModal(noCampaignModalHomebrew));
        if (modalActionBtn) {
            modalActionBtn.textContent = "Go to Home";
            modalActionBtn.addEventListener('click', () => { window.location.href = '../'; });
        }
        if (modalCreateNewCampaignBtnHomebrew) {
            modalCreateNewCampaignBtnHomebrew.addEventListener('click', () => {
                const newCampaignName = "New Campaign";
                const dummyCampaignData = {
                    name: newCampaignName, description: "A new adventure begins!", genre: "Fantasy", maturityRating: "TV-14",
                    partyMembers: [], sessions: [],
                    homebrewAssets: { creatures: [], items: [], spells: [] }
                };
                setCookie(CAMPAIGN_DATA_PREFIX + newCampaignName, dummyCampaignData, 365);
                setCookie(LAST_VIEWED_CAMPAIGN_KEY, newCampaignName, 365, true);
                window.location.reload();
            });
        }
    }
    
    // --- Add New Asset Dropdown & Handling ---
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

    function handleAddNewAsset(type) {
        if (type === 'creature') {
            window.location.href = '../creature-generator';
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

    // --- Add/Delete/Edit Asset Logic ---
    if (addNewItemForm) {
        if(closeAddNewItemModalBtn) closeAddNewItemModalBtn.addEventListener('click', () => closeModal(addNewItemModal));
        if(cancelNewItemBtn) cancelNewItemBtn.addEventListener('click', () => closeModal(addNewItemModal));
        addNewItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const itemName = newItemNameInput.value.trim();
            if (!itemName || !currentCampaignFullData) return;
            
            const newItemData = { id: generateUniqueId(), assetType: 'item', name: itemName, durability: newItemDurabilityInput.value.trim(), description: newItemDescriptionInput.value.trim(), isExpanded: false, createdAt: Date.now() };
            
            setCookie(`${ITEM_DATA_PREFIX}${currentCampaignFullData.name}_${newItemData.id}`, newItemData, 365);
            currentCampaignFullData.homebrewAssets.items.push(newItemData.id);
            saveCurrentCampaignData();

            closeModal(addNewItemModal);
            addNewItemForm.reset();
            fetchAllAssetsAndRender();
            if (saveStatusHomebrew) { saveStatusHomebrew.textContent = `Item "${itemName}" added and saved!`; setTimeout(() => { if (saveStatusHomebrew) saveStatusHomebrew.textContent = ''; }, 3000); }
        });
    }

    if (addNewSpellForm) {
        if(closeAddNewSpellModalBtn) closeAddNewSpellModalBtn.addEventListener('click', () => closeModal(addNewSpellModal));
        if(cancelNewSpellBtn) cancelNewSpellBtn.addEventListener('click', () => closeModal(addNewSpellModal));
        addNewSpellForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const spellName = newSpellNameInput.value.trim();
            if (!spellName || !currentCampaignFullData) return;

            const newSpellData = { id: generateUniqueId(), assetType: 'spell', name: spellName, requiredLevel: newSpellRequiredLevelInput.value.trim(), description: newSpellDescriptionInput.value.trim(), isExpanded: false, createdAt: Date.now() };
            
            setCookie(`${SPELL_DATA_PREFIX}${currentCampaignFullData.name}_${newSpellData.id}`, newSpellData, 365);
            currentCampaignFullData.homebrewAssets.spells.push(newSpellData.id);
            saveCurrentCampaignData();

            closeModal(addNewSpellModal);
            addNewSpellForm.reset();
            fetchAllAssetsAndRender();
            if (saveStatusHomebrew) { saveStatusHomebrew.textContent = `Spell "${spellName}" added and saved!`; setTimeout(() => { if (saveStatusHomebrew) saveStatusHomebrew.textContent = ''; }, 3000); }
        });
    }
    
    function openDeleteConfirmationModal(id, name, type) {
        assetToDelete = { id, type, name };
        if (deleteAssetConfirmMessage) deleteAssetConfirmMessage.textContent = `Are you sure you want to delete "${name || 'this asset'}"? This action is permanent.`;
        openModal(deleteAssetConfirmModal);
    }

    if (deleteAssetConfirmModal) {
        if(closeDeleteAssetConfirmModalBtn) closeDeleteAssetConfirmModalBtn.addEventListener('click', () => closeModal(deleteAssetConfirmModal));
        if(cancelDeleteAssetBtn) cancelDeleteAssetBtn.addEventListener('click', () => closeModal(deleteAssetConfirmModal));
        if (confirmDeleteAssetBtn) {
            confirmDeleteAssetBtn.addEventListener('click', () => {
                if (assetToDelete.id && assetToDelete.type && currentCampaignFullData && currentCampaignFullData.homebrewAssets) {
                    const campaignName = currentCampaignFullData.name;
                    const typePlural = assetToDelete.type + 's';
                    
                    let prefix = '';
                    if (assetToDelete.type === 'creature') prefix = CREATURE_DATA_PREFIX;
                    else if (assetToDelete.type === 'item') prefix = ITEM_DATA_PREFIX;
                    else if (assetToDelete.type === 'spell') prefix = SPELL_DATA_PREFIX;
                    
                    if (prefix) deleteCookie(`${prefix}${campaignName}_${assetToDelete.id}`);

                    if (currentCampaignFullData.homebrewAssets[typePlural]) {
                        currentCampaignFullData.homebrewAssets[typePlural] = currentCampaignFullData.homebrewAssets[typePlural].filter(id => id !== assetToDelete.id);
                        saveCurrentCampaignData();
                    }

                    fetchAllAssetsAndRender();

                    if (saveStatusHomebrew) {
                        saveStatusHomebrew.textContent = `"${assetToDelete.name || 'Asset'}" deleted.`;
                        setTimeout(() => { if (saveStatusHomebrew) saveStatusHomebrew.textContent = '' }, 3000);
                    }
                }
                closeModal(deleteAssetConfirmModal);
            });
        }
    }

    function saveCurrentCampaignData() {
        if (!currentCampaignFullData || !currentCampaignFullData.name) {
            console.error("No campaign manifest is loaded. Cannot save.");
            return;
        }
        setCookie(CAMPAIGN_DATA_PREFIX + currentCampaignFullData.name, currentCampaignFullData, 365);
        if (saveAllHomebrewBtn) saveAllHomebrewBtn.style.display = 'none';
    }

    // --- Core Loading and Rendering Pipeline ---

    function loadCampaignAndAssets() {
        const campaignName = getCookie(LAST_VIEWED_CAMPAIGN_KEY);
        if (!campaignName) {
            openModal(noCampaignModalHomebrew);
            if (addNewHomebrewAssetBtn) addNewHomebrewAssetBtn.style.display = 'none';
            return;
        }

        const campaignData = getCookie(CAMPAIGN_DATA_PREFIX + campaignName);
        if (campaignData && typeof campaignData === 'object') {
            currentCampaignFullData = campaignData;

            if (!currentCampaignFullData.homebrewAssets) {
                currentCampaignFullData.homebrewAssets = { creatures: [], items: [], spells: [] };
            }
            if (!Array.isArray(currentCampaignFullData.homebrewAssets.creatures)) currentCampaignFullData.homebrewAssets.creatures = [];
            if (!Array.isArray(currentCampaignFullData.homebrewAssets.items)) currentCampaignFullData.homebrewAssets.items = [];
            if (!Array.isArray(currentCampaignFullData.homebrewAssets.spells)) currentCampaignFullData.homebrewAssets.spells = [];

            fetchAllAssetsAndRender();
        } else {
            console.error("Failed to load campaign data for:", campaignName);
            openModal(noCampaignModalHomebrew);
            if (addNewHomebrewAssetBtn) addNewHomebrewAssetBtn.style.display = 'none';
        }
    }

    async function fetchAllAssetsAndRender() {
        if (!currentCampaignFullData || !currentCampaignFullData.homebrewAssets) {
            renderHomebrewAssets([]);
            return;
        }

        const campaignName = currentCampaignFullData.name;
        const combinedAssets = [];

        const fetchAsset = (id, type) => {
            let prefix = '';
            if (type === 'creature') prefix = CREATURE_DATA_PREFIX;
            else if (type === 'item') prefix = ITEM_DATA_PREFIX;
            else if (type === 'spell') prefix = SPELL_DATA_PREFIX;
            const asset = getCookie(`${prefix}${campaignName}_${id}`);
            if (asset) {
                asset.assetType = asset.assetType || type;
                asset.isExpanded = false;
                //asset.isExpanded = asset.isExpanded || false; // Preserve expanded state from cookie
                asset.createdAt = asset.createdAt || Date.now();
                combinedAssets.push(asset);
            } else {
                console.warn(`Could not find asset data for type '${type}' with ID '${id}'. It may have been deleted.`);
            }
        };

        (currentCampaignFullData.homebrewAssets.creatures || []).forEach(id => fetchAsset(id, 'creature'));
        (currentCampaignFullData.homebrewAssets.items || []).forEach(id => fetchAsset(id, 'item'));
        (currentCampaignFullData.homebrewAssets.spells || []).forEach(id => fetchAsset(id, 'spell'));
        
        const sortedAndFilteredAssets = applyFiltersAndSort(combinedAssets);
        renderHomebrewAssets(sortedAndFilteredAssets);
    }
    
    function applyFiltersAndSort(assets) {
        if (!assets) return [];
        let combinedAssets = [...assets];

        if (currentFilters) {
            const activeAssetTypes = Object.keys(currentFilters).filter(type => currentFilters[type]);
            combinedAssets = combinedAssets.filter(asset => activeAssetTypes.includes(asset.assetType));
        }

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
        fetchAllAssetsAndRender();
    }
    
    const setupExpansionToggle = (cardElement, assetObject) => {
        const header = cardElement.querySelector('.homebrew-asset-header');
        if (header) {
            header.addEventListener('click', (e) => {
                if(e.target.closest('.asset-inline-actions')) return;
                assetObject.isExpanded = !assetObject.isExpanded;
                cardElement.classList.toggle('expanded');
                const prefix = assetObject.assetType === 'creature' ? CREATURE_DATA_PREFIX : assetObject.assetType === 'item' ? ITEM_DATA_PREFIX : SPELL_DATA_PREFIX;
                setCookie(`${prefix}${currentCampaignFullData.name}_${assetObject.id}`, assetObject, 365);
            });
        }
    };

    function redirectToCreatureEditor(creatureId) {
        const params = new URLSearchParams({ id: creatureId });
        window.location.href = `../creature-generator?${params.toString()}`;
    }

    function createAssetCard(asset) {
        const card = document.createElement('div');
        card.className = `homebrew-asset-card ${asset.assetType}-card`;
        if (asset.isExpanded) card.classList.add('expanded');
        card.dataset.assetId = asset.id;

        let contentHtml = '';
        const assetTypeDisplay = asset.assetType.charAt(0).toUpperCase() + asset.assetType.slice(1);
        let headerName = asset.name || `New ${assetTypeDisplay}`;

        if (asset.assetType === 'creature') {
            let detailsHtml = '';
            const excludedKeys = new Set(['id', 'assetType', 'isExpanded', 'createdAt', 'name']);
            
            // Generate stat block HTML by iterating through the creature's properties
            for (const key in asset) {
                if (Object.prototype.hasOwnProperty.call(asset, key) && !excludedKeys.has(key)) {
                    const title = keyToTitleCase(key);
                    const value = asset[key];
                    // Skip empty or null notes, and handle boolean 'isMagical'
                    if (key === 'notes' && !value) continue; 
                    if (key === 'isMagical') {
                         detailsHtml += `<p><strong>Magical:</strong> ${value ? 'Yes' : 'No'}</p>`;
                    } else {
                         detailsHtml += `<p><strong>${title}:</strong> ${value}</p>`;
                    }
                }
            }
            contentHtml = `<div class="creature-full-details">${detailsHtml}</div>`;
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
                <div class="asset-inline-actions">
                    ${asset.assetType === 'creature' ? '<button class="btn btn-primary edit-creature-btn">Edit</button>' : ''}
                    <button class="btn btn-delete delete-asset-btn">Delete</button>
                </div>
            </div>`;

        setupExpansionToggle(card, asset);

        if (asset.assetType === 'creature') {
            const editBtn = card.querySelector('.edit-creature-btn');
            if(editBtn) editBtn.addEventListener('click', (e) => { e.stopPropagation(); redirectToCreatureEditor(asset.id); });
        }
        
        const deleteBtn = card.querySelector('.delete-asset-btn');
        if(deleteBtn) deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteConfirmationModal(asset.id, asset.name, asset.assetType); });
        
        if (asset.assetType === 'item' || asset.assetType === 'spell') {
            let debounceTimer;
            card.querySelectorAll('input, textarea').forEach(el => {
                el.addEventListener('input', (e) => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        const field = e.target.dataset.field;
                        const prefix = asset.assetType === 'item' ? ITEM_DATA_PREFIX : SPELL_DATA_PREFIX;
                        const cookieName = `${prefix}${currentCampaignFullData.name}_${asset.id}`;
                        
                        const assetToUpdate = getCookie(cookieName);
                        if (assetToUpdate && Object.prototype.hasOwnProperty.call(assetToUpdate, field)) {
                            assetToUpdate[field] = e.target.value;
                            setCookie(cookieName, assetToUpdate, 365);

                            if (field === 'name') {
                                card.querySelector('.homebrew-asset-header h3').textContent = e.target.value || `New ${asset.assetType}`;
                            }

                            if (saveStatusHomebrew) {
                                saveStatusHomebrew.textContent = `Saved!`;
                                setTimeout(() => { if (saveStatusHomebrew) saveStatusHomebrew.textContent = '' }, 1500);
                            }
                        }
                    }, 500);
                });
            });
        }
        return card;
    }

    function renderHomebrewAssets(assetsToRender) {
        if (!homebrewAssetsColumnsContainer) return;
        homebrewAssetsColumnsContainer.innerHTML = '';
        if (!assetsToRender || assetsToRender.length === 0) {
            homebrewAssetsColumnsContainer.innerHTML = "<p>No homebrew assets match your current filters or none exist in this campaign.</p>";
            return;
        }
        const columns = [];
        for (let i = 0; i < NUM_COLUMNS; i++) {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'asset-column';
            columns.push(columnDiv);
            homebrewAssetsColumnsContainer.appendChild(columnDiv);
        }
        assetsToRender.forEach((asset, index) => {
            const columnIndex = index % NUM_COLUMNS;
            const card = createAssetCard(asset);
            if (columns[columnIndex]) columns[columnIndex].appendChild(card);
        });
    }

    if (saveAllHomebrewBtn) {
        saveAllHomebrewBtn.style.display = 'none';
    }

    // --- Event Listeners for Controls ---
    if(sortAssetsBySelect) sortAssetsBySelect.addEventListener('change', (e) => { currentSort.property = e.target.value; processAndRenderAssets(); });
    if(reverseSortBtn) reverseSortBtn.addEventListener('click', () => { currentSort.reversed = !currentSort.reversed; reverseSortBtn.innerHTML = currentSort.reversed ? '&#x2191;' : '&#x2193;'; processAndRenderAssets(); });
    if(filterPanel) {
        filterPanel.querySelectorAll('input[type="checkbox"][data-filter-type]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filterType;
                if(currentFilters.hasOwnProperty(filterType)) {
                    currentFilters[filterType] = e.target.checked;
                    processAndRenderAssets();
                }
            });
        });
    }

    // --- Initial Page Load ---
    function initializeCatalogPage() {
        loadCampaignAndAssets();
    }

    initializeCatalogPage();
    
    window.addEventListener('click', (event) => {
        if (customAddAssetDropdown && customAddAssetDropdown.style.display === 'block' && !addNewHomebrewAssetBtn.contains(event.target)) {
            customAddAssetDropdown.style.display = 'none';
        }
        if (noCampaignModalHomebrew && event.target === noCampaignModalHomebrew) closeModal(noCampaignModalHomebrew);
        if (deleteAssetConfirmModal && event.target === deleteAssetConfirmModal) closeModal(deleteAssetConfirmModal);
        if (addNewItemModal && event.target === addNewItemModal) closeModal(addNewItemModal);
        if (addNewSpellModal && event.target === addNewSpellModal) closeModal(addNewSpellModal);
    });
});
