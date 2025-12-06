// --------- SIDEBAR TOGGLE ---------
function setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainCards = document.querySelectorAll(".main-card");
    const toggleBtn = document.getElementById("sidebar-toggle");
    
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        mainCards.forEach(card => {
            card.classList.toggle("sidebar-collapsed");
        });
    });
}

// --------- SIDEBAR NAVIGATION ---------
function setupNavigation() {
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    
    sidebarItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Remove active from all
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            // Hide all sections
            document.querySelectorAll(".section-page").forEach(section => {
                section.style.display = "none";
            });
            
            // Show selected section
            const sectionId = item.getAttribute("data-section");
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = "flex";
            }
        });
    });
}

// --------- CLASH MACRO SLIDER ---------
function setupClashMacroSlider() {
    const slider = document.getElementById("delay-slider");
    const valueDisplay = document.getElementById("delay-value");
    
    if (slider && valueDisplay) {
        slider.addEventListener("input", () => {
            valueDisplay.textContent = slider.value + " ms";
        });
    }
}

// --------- LOAD FLAGS FROM PYTHON ---------
async function loadFlags() {
    try {
        const flags = await window.pywebview.api.get_flags();
        const tbody = document.querySelector("#flags-table tbody");
        const totalSpan = document.getElementById("total-flags");

        tbody.innerHTML = "";
        flags.forEach(([name, value]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="flag-name">${name}</td>
                <td contenteditable="true" class="flag-value">${value}</td>
            `;
            
            // Make rows selectable
            tr.addEventListener("click", (e) => {
                // Don't toggle if clicking on editable cell
                if (e.target.contentEditable === "true") return;
                tr.classList.toggle("selected");
            });
            
            // Save on value edit
            const valueCell = tr.querySelector(".flag-value");
            valueCell.addEventListener("blur", async () => {
                const newValue = valueCell.textContent.trim();
                const flagName = tr.querySelector(".flag-name").textContent;
                
                try {
                    await window.pywebview.api.update_flag(flagName, newValue);
                    showNotification('success', 'Flag Updated', `${flagName} = ${newValue}`);
                } catch (err) {
                    console.error("Error updating flag:", err);
                    showNotification('error', 'Update Failed', 'Failed to update flag');
                    await loadFlags(); // Reload to revert
                }
            });
            
            // Prevent newlines in contenteditable
            valueCell.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    valueCell.blur();
                }
            });
            
            tbody.appendChild(tr);
        });

        totalSpan.textContent = flags.length.toString();
    } catch (err) {
        console.error("Error loading flags:", err);
    }
}

// --------- SEARCH FILTER ---------
function setupSearch() {
    const searchInput = document.getElementById("search");
    const tbody = document.querySelector("#flags-table tbody");

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        const rows = tbody.querySelectorAll("tr");

        rows.forEach(row => {
            const name = row.children[0].textContent.toLowerCase();
            row.style.display = name.includes(q) ? "" : "none";
        });
    });
}

// --------- WINDOW CONTROL BUTTONS ---------
function setupWindowButtons() {
    const closeBtn = document.getElementById("close-btn");
    const minBtn = document.getElementById("min-btn");
    const maxBtn = document.getElementById("max-btn");
    
    // Also get the ones in other sections
    const closeBtns = document.querySelectorAll(".close-btn");
    const minBtns = document.querySelectorAll(".min-btn");
    const maxBtns = document.querySelectorAll(".max-btn");

    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            window.pywebview.api.close();
        });
    });

    minBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            window.pywebview.api.minimize();
        });
    });

    maxBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            window.pywebview.api.maximize();
        });
    });
}

// --------- MODAL UTILITIES ---------
function createModal(title, content) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    
    const modal = document.createElement("div");
    modal.className = "modal";
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-content">
            ${content}
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    modal.querySelector(".modal-close").addEventListener("click", () => {
        overlay.remove();
    });
    
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    return { overlay, modal };
}

// --------- NOTIFICATION SYSTEM ---------
function showNotification(type, title, message) {
    // Remove any existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let iconSVG = '';
    if (type === 'success') {
        iconSVG = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else if (type === 'error') {
        iconSVG = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    } else if (type === 'warning') {
        iconSVG = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81442 19.9905C1.98733 20.2939 2.23672 20.5467 2.53771 20.7239C2.8387 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        iconSVG = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    }
    
    notification.innerHTML = `
        <div class="notification-icon">
            ${iconSVG}
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto hide after 2 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// --------- CONFIRM MODAL ---------
function showConfirmModal(title, message, onConfirm) {
    const content = `
        <div style="padding: 10px 0;">
            <p style="color: #e3e3e3; font-size: 14px; line-height: 1.6;">
                ${message}
            </p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" id="confirm-ok-btn">OK</button>
            <button class="btn btn-ghost" id="confirm-cancel-btn">Cancel</button>
        </div>
    `;
    
    const { overlay, modal } = createModal(title, content);
    
    modal.querySelector("#confirm-ok-btn").addEventListener("click", () => {
        overlay.remove();
        if (onConfirm) {
            onConfirm();
        }
    });
    
    modal.querySelector("#confirm-cancel-btn").addEventListener("click", () => {
        overlay.remove();
    });
}

// --------- PROFILES MODAL ---------
function showProfilesModal() {
    const content = `
        <div class="profiles-section">
            <h3 class="section-label">Preset Flag Lists</h3>
            <div class="profiles-actions">
                <button class="btn btn-ghost profile-btn">Save</button>
                <button class="btn btn-ghost profile-btn">Load</button>
            </div>
            <input type="text" class="modal-input" placeholder="Profile Name" id="profile-name-input" />
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" id="profile-ok-btn">OK</button>
            <button class="btn btn-ghost" id="profile-cancel-btn">Cancel</button>
        </div>
    `;
    
    const { overlay, modal } = createModal("Flag Profiles", content);
    
    modal.querySelector("#profile-ok-btn").addEventListener("click", () => {
        const profileName = modal.querySelector("#profile-name-input").value;
        if (profileName) {
            console.log("Profile action:", profileName);
            showNotification('success', 'Profile Saved', `Profile "${profileName}" has been saved`);
            overlay.remove();
        } else {
            showNotification('error', 'No Name', 'Please enter a profile name');
        }
    });
    
    modal.querySelector("#profile-cancel-btn").addEventListener("click", () => {
        overlay.remove();
    });
}

// --------- ADD NEW MODAL ---------
function showAddNewModal() {
    const content = `
        <div class="tabs">
            <button class="tab-btn active" data-tab="single">Add single</button>
            <button class="tab-btn" data-tab="import">Import JSON</button>
        </div>
        
        <div class="tab-content active" id="single-tab">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="modal-input" id="flag-name-input" />
            </div>
            <div class="form-group">
                <label class="form-label">Value</label>
                <input type="text" class="modal-input" id="flag-value-input" placeholder="True/False or number" />
            </div>
        </div>
        
        <div class="tab-content" id="import-tab">
            <div class="form-group">
                <label class="form-label">Paste JSON</label>
                <textarea class="modal-textarea" id="json-import-input" placeholder='{"FlagName": "value", "AnotherFlag": "123"}'></textarea>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-primary" id="add-ok-btn">OK</button>
            <button class="btn btn-ghost" id="add-cancel-btn">Cancel</button>
        </div>
    `;
    
    const { overlay, modal } = createModal("Add Fast Flag", content);
    
    modal.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            modal.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            modal.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.dataset.tab + "-tab";
            modal.querySelector("#" + tabId).classList.add("active");
        });
    });
    
    modal.querySelector("#add-ok-btn").addEventListener("click", async () => {
        const activeTab = modal.querySelector(".tab-btn.active").dataset.tab;
        
        if (activeTab === "single") {
            const name = modal.querySelector("#flag-name-input").value.trim();
            const value = modal.querySelector("#flag-value-input").value.trim();
            
            if (name && value) {
                try {
                    await window.pywebview.api.add_flag(name, value);
                    await loadFlags();
                    showNotification('success', 'Flag Added', `Successfully added ${name}`);
                    overlay.remove();
                } catch (err) {
                    console.error("Error adding flag:", err);
                    showNotification('error', 'Add Failed', 'Failed to add flag');
                }
            } else {
                showNotification('error', 'Invalid Input', 'Please fill in both name and value');
            }
        } else {
            const json = modal.querySelector("#json-import-input").value;
            
            if (json) {
                try {
                    JSON.parse(json); // Validate JSON first
                    const result = await window.pywebview.api.import_json(json);
                    
                    if (result) {
                        await loadFlags();
                        showNotification('success', 'Flags Imported', 'Successfully imported flags from JSON');
                        overlay.remove();
                    } else {
                        showNotification('error', 'Import Failed', 'Failed to import flags');
                    }
                } catch (e) {
                    showNotification('error', 'Invalid JSON', 'Please enter valid JSON format');
                }
            } else {
                showNotification('error', 'No JSON', 'Please paste JSON data to import');
            }
        }
    });
    
    modal.querySelector("#add-cancel-btn").addEventListener("click", () => {
        overlay.remove();
    });
}

// --------- ADVANCED SETTINGS MODAL ---------
function showAdvancedSettingsModal() {
    const content = `
        <div class="settings-list">
            <div class="setting-item">
                <div class="setting-info">
                    <div class="setting-title">Copy Format</div>
                    <div class="setting-desc">Choose the format for copying JSON.</div>
                    <select class="modal-select setting-select">
                        <option>Default</option>
                        <option>Compact</option>
                        <option>Pretty</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <div class="setting-title">Ctrl+C Json Format</div>
                    <div class="setting-desc">Copies selected flags as JSON using the chosen Copy Format when pressing Ctrl+C.</div>
                </div>
                <label class="toggle">
                    <input type="checkbox" />
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <div class="setting-title">Use Alt Manually</div>
                    <div class="setting-desc">Auto add the Alt Manually flag when starting pulse-strap.</div>
                </div>
                <label class="toggle">
                    <input type="checkbox" checked />
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <div class="setting-title">Preset Column</div>
                    <div class="setting-desc">Toggle the Preset Column which shows toggleable FastFlags in FastFlag Setting.</div>
                </div>
                <label class="toggle">
                    <input type="checkbox" />
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <div class="setting-title">Flag Count</div>
                    <div class="setting-desc">Toggle the total flag count in the FastFlag Editor.</div>
                </div>
                <label class="toggle">
                    <input type="checkbox" checked />
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-primary" id="settings-save-btn">Save</button>
            <button class="btn btn-ghost" id="settings-close-btn">Close</button>
        </div>
    `;
    
    const { overlay, modal } = createModal("Advanced Settings", content);
    
    modal.querySelector("#settings-save-btn").addEventListener("click", () => {
        console.log("Settings saved");
        showNotification('success', 'Settings Saved', 'Advanced settings have been saved');
        overlay.remove();
    });
    
    modal.querySelector("#settings-close-btn").addEventListener("click", () => {
        overlay.remove();
    });
}

// --------- SET HOTKEY MODAL ---------
function showSetHotkeyModal() {
    const content = `
        <div class="hotkey-setter">
            <div class="hotkey-info">
                <p style="color: #8d8d8d; font-size: 13px; margin-bottom: 20px;">
                    Press any key combination to set as your macro hotkey
                </p>
            </div>
            
            <div class="hotkey-display-box">
                <div class="hotkey-key" id="hotkey-display-key">None</div>
                <div class="hotkey-hint">Waiting for input...</div>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-primary" id="hotkey-save-btn">Save</button>
            <button class="btn btn-ghost" id="hotkey-cancel-btn">Cancel</button>
        </div>
    `;
    
    const { overlay, modal } = createModal("Set Hotkey", content);
    
    let capturedKey = null;
    const displayKey = modal.querySelector("#hotkey-display-key");
    const hint = modal.querySelector(".hotkey-hint");
    
    // Capture key press
    const handleKeyPress = (e) => {
        e.preventDefault();
        
        let keyCombo = [];
        if (e.ctrlKey) keyCombo.push("Ctrl");
        if (e.shiftKey) keyCombo.push("Shift");
        if (e.altKey) keyCombo.push("Alt");
        
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        if (!['Control', 'Shift', 'Alt'].includes(key)) {
            keyCombo.push(key);
        }
        
        if (keyCombo.length > 0) {
            capturedKey = keyCombo.join(" + ");
            displayKey.textContent = capturedKey;
            displayKey.style.color = "#ffb300";
            hint.textContent = "Key captured! Click Save to confirm.";
            hint.style.color = "#6ef5b8";
        }
    };
    
    document.addEventListener("keydown", handleKeyPress);
    
    modal.querySelector("#hotkey-save-btn").addEventListener("click", () => {
        if (capturedKey) {
            // Update the keybind display button in the Clash Macro section
            const keybindDisplay = document.getElementById("keybind-display");
            if (keybindDisplay) {
                keybindDisplay.textContent = capturedKey;
            }
            
            showNotification('success', 'Hotkey Set', `Macro hotkey set to: ${capturedKey}`);
            document.removeEventListener("keydown", handleKeyPress);
            overlay.remove();
        } else {
            showNotification('error', 'No Key', 'Please press a key combination first');
        }
    });
    
    modal.querySelector("#hotkey-cancel-btn").addEventListener("click", () => {
        document.removeEventListener("keydown", handleKeyPress);
        overlay.remove();
    });
    
    // Remove listener if overlay clicked
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            document.removeEventListener("keydown", handleKeyPress);
        }
    });
}

// --------- BUTTON HANDLERS ---------
function setupButtons() {
    // Add New button
    const addNewBtn = document.querySelector(".btn-primary");
    if (addNewBtn) {
        addNewBtn.addEventListener("click", showAddNewModal);
    }
    
    // All other buttons
    const buttons = document.querySelectorAll(".btn-ghost");
    buttons.forEach(btn => {
        const text = btn.textContent.trim();
        
        if (text === "Profiles") {
            btn.addEventListener("click", showProfilesModal);
        } else if (text === "Advanced Settings") {
            btn.addEventListener("click", showAdvancedSettingsModal);
        } else if (text === "Delete selected") {
            btn.addEventListener("click", async () => {
                const selected = document.querySelectorAll("#flags-table tbody tr.selected");
                if (selected.length === 0) {
                    showNotification('warning', 'No Selection', 'Please select flags to delete');
                    return;
                }
                
                try {
                    for (const row of selected) {
                        const flagName = row.querySelector(".flag-name").textContent;
                        await window.pywebview.api.delete_flag(flagName);
                    }
                    await loadFlags();
                    showNotification('success', 'Deleted', `Deleted ${selected.length} flag(s)`);
                } catch (err) {
                    console.error("Error deleting flags:", err);
                    showNotification('error', 'Delete Failed', 'Failed to delete selected flags');
                }
            });
        } else if (text === "Delete All") {
            btn.addEventListener("click", () => {
                showConfirmModal(
                    "Delete All Flags",
                    "Are you sure you want to delete all flags?",
                    async () => {
                        try {
                            await window.pywebview.api.delete_all_flags();
                            await loadFlags();
                            showNotification('warning', 'All Deleted', 'All flags have been removed');
                        } catch (err) {
                            console.error("Error deleting all flags:", err);
                            showNotification('error', 'Delete Failed', 'Failed to delete all flags');
                        }
                    }
                );
            });
        } else if (text === "Copy All") {
            btn.addEventListener("click", async () => {
                try {
                    const json = await window.pywebview.api.export_json();
                    navigator.clipboard.writeText(json);
                    showNotification('success', 'Copied', 'All flags copied to clipboard as JSON');
                } catch (err) {
                    console.error("Error copying flags:", err);
                    showNotification('error', 'Copy Failed', 'Failed to copy flags');
                }
            });
        } else if (text === "Export JSON") {
            btn.addEventListener("click", async () => {
                try {
                    const json = await window.pywebview.api.export_json();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'flags.json';
                    a.click();
                    showNotification('success', 'Exported', 'Flags exported to JSON file');
                } catch (err) {
                    console.error("Error exporting JSON:", err);
                    showNotification('error', 'Export Failed', 'Failed to export JSON');
                }
            });
        } else if (text === "Clean FastFlag List") {
            btn.addEventListener("click", () => {
                showNotification('info', 'Cleaned', 'Invalid flags have been removed');
            });
        } else if (text === "Show Preset Flags") {
            btn.addEventListener("click", async () => {
                try {
                    const presets = await window.pywebview.api.get_preset_flags();
                    console.log("Available presets:", presets);
                    showNotification('info', 'Preset Flags', `${presets.length} preset flags available`);
                } catch (err) {
                    console.error("Error getting presets:", err);
                }
            });
        }
    });

    // Set Hotkey button in Clash Macro
    const setHotkeyBtn = document.getElementById("set-hotkey-btn");
    if (setHotkeyBtn) {
        setHotkeyBtn.addEventListener("click", showSetHotkeyModal);
    }
    
    // Bottom bar buttons
    const saveLaunchBtn = document.querySelector('.btn-bottom-primary');
    if (saveLaunchBtn) {
        saveLaunchBtn.addEventListener('click', async () => {
            showNotification('success', 'Launching', 'Applying flags and launching Roblox...');
            
            if (window.pywebview && window.pywebview.api) {
                try {
                    await window.pywebview.api.save_and_launch();
                } catch (err) {
                    console.error("Error launching:", err);
                }
            }
        });
    }
    
    const bottomButtons = document.querySelectorAll('.btn-bottom-secondary');
    bottomButtons.forEach(btn => {
        const text = btn.textContent.trim();
        
        if (text === 'Save') {
            btn.addEventListener('click', async () => {
                try {
                    const status = await window.pywebview.api.get_roblox_status();
                    
                    if (status === 'attached') {
                        await window.pywebview.api.apply_flags_now();
                        showNotification('success', 'Saved & Applied', 'Flags saved and applied to running Roblox');
                    } else {
                        showNotification('success', 'Saved', 'Flags saved - will apply when Roblox launches');
                    }
                } catch (err) {
                    console.error("Error saving:", err);
                    showNotification('error', 'Save Failed', 'Failed to save flags');
                }
            });
        } else if (text === 'Restart') {
            btn.addEventListener('click', async () => {
                try {
                    showNotification('info', 'Restarting', 'Closing and relaunching Roblox...');
                    await window.pywebview.api.restart_roblox();
                } catch (err) {
                    console.error("Error restarting:", err);
                    showNotification('error', 'Restart Failed', 'Failed to restart Roblox');
                }
            });
        } else if (text === 'Close') {
            btn.addEventListener('click', () => {
                if (window.pywebview) {
                    window.pywebview.api.close();
                }
            });
        }
    });
}

// --------- INIT APP ---------
function initApp() {
    setupSidebar();
    setupNavigation();
    setupWindowButtons();
    setupSearch();
    setupButtons();
    setupClashMacroSlider();
    loadFlags();
}

document.addEventListener("pywebviewready", initApp);

document.addEventListener("DOMContentLoaded", () => {
    if (!window.pywebview) {
        console.log("Running in normal browser, no Python bridge.");
        setupSidebar();
        setupNavigation();
        setupButtons();
        setupClashMacroSlider();
    }
});
