// Archive data
let archiveData = {};
let allMedia = [];
let currentFilters = {
    year: 'all',
    medium: 'all',
    artist: 'all'
};

// Initialize
async function init() {
    try {
        await loadArchiveData();
        setupEventListeners();
        populateFilters();
        renderMedia();
    } catch (error) {
        showError('Failed to load archive data. Make sure archive-data.json exists in the data/ folder.');
        console.error(error);
    }
}

// Load archive data from JSON
async function loadArchiveData() {
    const response = await fetch('data/archive-data.json');
    if (!response.ok) {
        throw new Error('Archive data not found');
    }
    archiveData = await response.json();
    
    // Flatten all media into single array for easier filtering
    allMedia = [];
    Object.keys(archiveData).forEach(year => {
        allMedia = allMedia.concat(archiveData[year]);
    });
    
    console.log(`Loaded ${allMedia.length} media items`);
}

// Setup event listeners
function setupEventListeners() {
    // Year filters
    document.querySelectorAll('.year-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.year-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.year = e.target.dataset.year;
            renderMedia();
        });
    });

    // Artist select
    document.getElementById('artist-select').addEventListener('change', (e) => {
        currentFilters.artist = e.target.value;
        renderMedia();
    });
}

// Populate dynamic filters (media types and artists)
function populateFilters() {
    // Get unique media types
    const mediaTypes = [...new Set(allMedia.map(item => item.medium))].sort();
    
    // Create medium filter buttons
    const mediumContainer = document.getElementById('medium-buttons');
    mediaTypes.forEach(medium => {
        const btn = document.createElement('button');
        btn.className = 'medium-filter';
        btn.dataset.medium = medium;
        btn.textContent = capitalizeWords(medium);
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.medium-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.medium = e.target.dataset.medium;
            renderMedia();
        });
        mediumContainer.appendChild(btn);
    });

    // Populate artist dropdown
    const artists = [...new Set(allMedia.map(item => item.artistDisplay))].sort();
    const select = document.getElementById('artist-select');
    artists.forEach(artist => {
        const option = document.createElement('option');
        option.value = artist;
        option.textContent = artist;
        select.appendChild(option);
    });
}

// Filter and render media
function renderMedia() {
    const content = document.getElementById('content');
    
    // Apply filters
    let filtered = allMedia.filter(item => {
        const matchesYear = currentFilters.year === 'all' || item.year === currentFilters.year;
        const matchesMedium = currentFilters.medium === 'all' || item.medium === currentFilters.medium;
        const matchesArtist = currentFilters.artist === 'all' || item.artistDisplay === currentFilters.artist;
        return matchesYear && matchesMedium && matchesArtist;
    });

    // Update stats
    updateStats(filtered);

    // Render
    if (filtered.length === 0) {
        content.innerHTML = '<div class="empty-state">No media found for selected filters</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'media-grid';

    filtered.forEach(item => {
        const mediaItem = createMediaElement(item);
        grid.appendChild(mediaItem);
    });

    content.innerHTML = '';
    content.appendChild(grid);

    // Setup lazy loading
    setupLazyLoading();
}

// Update statistics display
function updateStats(filtered) {
    const stats = document.getElementById('stats');
    const years = [...new Set(filtered.map(i => i.year))];
    const artists = [...new Set(filtered.map(i => i.artistDisplay))];
    const media = [...new Set(filtered.map(i => i.medium))];
    
    stats.innerHTML = `
        Showing ${filtered.length} works · 
        ${years.length} year${years.length !== 1 ? 's' : ''} · 
        ${artists.length} artist${artists.length !== 1 ? 's' : ''} · 
        ${media.length} medium${media.length !== 1 ? 's' : ''}
    `;
}

// Create media element
function createMediaElement(item) {
    const div = document.createElement('div');
    div.className = 'media-item';

    div.innerHTML = `
        <img data-src="${item.path}" 
             alt="${item.artistDisplay} - ${item.medium}" 
             class="lazy">
        <div class="media-info">
            <h3>${item.artistDisplay}</h3>
            <span class="medium">${capitalizeWords(item.medium)}</span>
            <p class="meta">${item.year} · ${item.filename}</p>
        </div>
    `;

    return div;
}

// Lazy loading for images
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before image is visible
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Show error message
function showError(message) {
    const content = document.getElementById('content');
    content.innerHTML = `<div class="error-state">${message}</div>`;
}

// Utility: Capitalize words
function capitalizeWords(str) {
    return str.split(/[-_]/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Start the app
init();