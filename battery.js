// -------------------------
// 1️⃣ Toggle Battery Finder Form
// -------------------------
function toggleBatteryFinder() {
    const form = document.getElementById('batteryFinderForm');
    if (form) {
        const isShowing = form.classList.contains('show');
        form.classList.toggle('show');
        // Prevent body scroll when form is open
        if (!isShowing) {
            document.body.style.overflow = 'hidden';
            // Load categories when form opens (if not already loaded)
            setTimeout(() => {
                const categorySelect = document.getElementById('vehicleCategory');
                if (categorySelect && categorySelect.options.length <= 1) {
                    loadCategories();
                }
            }, 100);
        } else {
            document.body.style.overflow = '';
        }
    } else {
        console.error('Battery finder form not found');
    }
}

// Make function globally accessible
window.toggleBatteryFinder = toggleBatteryFinder;




// -------------------------
// 2️⃣ Load Categories from PostgreSQL Database
// -------------------------
async function loadCategories() {
    const categorySelect = document.getElementById('vehicleCategory');
    if (!categorySelect) return;

    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    try {
        const response = await fetch('./api/categories.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if response has error
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Populate dropdown with categories from database
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.text = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        // Show error message to user
        const option = document.createElement('option');
        option.value = '';
        option.text = 'Error loading categories';
        categorySelect.appendChild(option);
    }
}

// -------------------------
// 3️⃣ Load Makes for Selected Category from PostgreSQL Database
// -------------------------
async function loadMakes() {
    const categoryId = document.getElementById('vehicleCategory').value;
    const makeSelect = document.getElementById('carMake');
    const modelSelect = document.getElementById('carModel');

    // Reset dropdowns
    makeSelect.innerHTML = '<option value="">Select Make</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';

    if (!categoryId) return;

    try {
        const response = await fetch(`./api/makes.php?category_id=${categoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if response has error
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Populate dropdown with makes from database
        data.forEach(make => {
            const option = document.createElement('option');
            option.value = make.id;
            option.text = make.name;
            makeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading makes:', error);
        // Show error message to user
        makeSelect.innerHTML = '<option value="">Error loading makes</option>';
    }
}

// -------------------------
// 4️⃣ Load Models for Selected Make from PostgreSQL Database
// -------------------------
async function loadModels() {
    const makeId = document.getElementById('carMake').value;
    const modelSelect = document.getElementById('carModel');

    modelSelect.innerHTML = '<option value="">Select Model</option>'; // reset

    if (!makeId) return;

    try {
        const response = await fetch(`./api/models.php?make_id=${makeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if response has error
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Populate dropdown with models from database
        data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.text = model.name;
            modelSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading models:', error);
        // Show error message to user
        modelSelect.innerHTML = '<option value="">Error loading models</option>';
    }
}

// -------------------------
// 5️⃣ Handle Find Battery Button - Search in PostgreSQL Database
// -------------------------
async function findBattery() {
    const category = document.getElementById('vehicleCategory').value;
    const make = document.getElementById('carMake').value;
    const model = document.getElementById('carModel').value;

    if (!category || !make || !model) {
        alert('Please select category, make, and model.');
        return;
    }

    // Show loading state
    const findBtn = document.querySelector('.find-battery-btn');
    const originalText = findBtn ? findBtn.textContent : 'FIND BATTERY';
    if (findBtn) {
        findBtn.disabled = true;
        findBtn.textContent = 'Searching...';
    }

    try {
        const response = await fetch('./api/battery_search.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category_id: category,
                make_id: make,
                model_id: model
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if response has error
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Display results
        displayBatteryResults(data);
        
    } catch (error) {
        console.error('Error finding battery:', error);
        alert('Error finding battery. Please try again later.\n\nError: ' + error.message);
    } finally {
        // Restore button state
        if (findBtn) {
            findBtn.disabled = false;
            findBtn.textContent = originalText;
        }
    }
}

// -------------------------
// 6️⃣ Display Battery Results
// -------------------------
function displayBatteryResults(data) {
    // Close the form first
    toggleBatteryFinder();
    
    // Create results modal
    const resultsModal = document.createElement('div');
    resultsModal.id = 'batteryResultsModal';
    resultsModal.className = 'battery-finder-form show';
    resultsModal.style.zIndex = '2001';
    
    let resultsHTML = '<div class="battery-finder-content" style="max-width: 600px;">';
    resultsHTML += '<h3>Battery Results</h3>';
    
    if (data.batteries && data.batteries.length > 0) {
        resultsHTML += `<p style="margin-bottom: 20px; color: #002583;">Found ${data.batteries.length} battery option(s):</p>`;
        resultsHTML += '<div style="max-height: 400px; overflow-y: auto;">';
        
        data.batteries.forEach((battery, index) => {
            resultsHTML += `
                <div style="border: 2px solid #E5E8EF; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #f9f9f9;">
                    <h4 style="color: #002583; margin: 0 0 10px 0; font-size: 1.1rem;">${battery.name || battery.battery_name || 'Battery ' + (index + 1)}</h4>
                    ${(battery.specifications || battery.specs) ? `<p style="margin: 5px 0; color: #333;"><strong>Specifications:</strong> ${battery.specifications || battery.specs}</p>` : ''}
                    <p style="margin: 5px 0; color: #FF3E41; font-size: 1.2rem; font-weight: bold;">Price: ${battery.price || 'Contact for price'}</p>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
    } else {
        resultsHTML += `
            <div style="text-align: center; padding: 40px 20px;">
                <p style="color: #666; font-size: 1.1rem; margin-bottom: 20px;">No batteries found for this vehicle.</p>
                <p style="color: #002583;">Please contact us for assistance:</p>
                <p style="color: #FF3E41; font-weight: bold; margin-top: 10px;">Phone: +255 696 474 770</p>
                <p style="color: #FF3E41; font-weight: bold;">Email: info@Chinaboda.co.tz</p>
            </div>
        `;
    }
    
    resultsHTML += '<button class="close-form-btn" onclick="closeBatteryResults()" style="margin-top: 20px;">Close</button>';
    resultsHTML += '</div>';
    
    resultsModal.innerHTML = resultsHTML;
    document.body.appendChild(resultsModal);
    document.body.style.overflow = 'hidden';
}

// Close battery results modal
function closeBatteryResults() {
    const modal = document.getElementById('batteryResultsModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Make it globally accessible
window.closeBatteryResults = closeBatteryResults;

// -------------------------
// 6️⃣ Initialize Form on Page Load
// -------------------------
document.addEventListener('DOMContentLoaded', loadCategories);


// Close popup when clicking outside (on dark overlay)
document.addEventListener('click', function(event) {
    const form = document.getElementById('batteryFinderForm');
    const formContent = document.querySelector('.battery-finder-content');
    const buttons = document.querySelectorAll('.header-btn, .battery-finder-btn');
    
    if (form && form.classList.contains('show')) {
        // Check if click is outside the form content (on dark overlay)
        if (formContent && !formContent.contains(event.target)) {
            // Check if click is not on any button that opens the form
            let isButton = false;
            buttons.forEach(btn => {
                if (btn.contains(event.target)) {
                    isButton = true;
                }
            });
            
            // Close if clicked outside and not on a button
            if (!isButton) {
                form.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    }
});
