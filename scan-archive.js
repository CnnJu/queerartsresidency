// scan-archive.js
// This script scans your img/Archive folders and generates archive-data.json
// Run with: node scan-archive.js

const fs = require('fs');
const path = require('path');

// Configuration
const ARCHIVE_BASE = './img/Archive';
const OUTPUT_FILE = './data/archive-data.json';
const YEARS = ['2022', '2023', '2024'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

function scanArchive() {
    const archiveData = {};
    
    YEARS.forEach(year => {
        const yearPath = path.join(ARCHIVE_BASE, year);
        
        // Check if year folder exists
        if (!fs.existsSync(yearPath)) {
            console.log(`⚠️  Folder not found: ${yearPath}`);
            archiveData[year] = [];
            return;
        }
        
        // Read all files in the year folder
        const files = fs.readdirSync(yearPath);
        const mediaItems = [];
        
        files.forEach(filename => {
            const ext = path.extname(filename).toLowerCase();
            
            // Only process image files
            if (!IMAGE_EXTENSIONS.includes(ext)) {
                return;
            }
            
            // Parse filename: YEAR-artistname-SEQUENCE-MEDIUM.ext
            // Example: 2022-alban_ovanessian-01-bts.jpeg
            const parsed = parseFilename(filename, year);
            
            if (parsed) {
                mediaItems.push({
                    id: `${year}-${parsed.artist}-${parsed.sequence}`,
                    year: year,
                    artist: parsed.artist,
                    artistDisplay: formatArtistName(parsed.artist),
                    sequence: parsed.sequence,
                    medium: parsed.medium,
                    filename: filename,
                    path: `img/Archive/${year}/${filename}`,
                    extension: ext.replace('.', '')
                });
            } else {
                console.log(`⚠️  Could not parse: ${filename}`);
            }
        });
        
        // Sort by artist, then sequence
        mediaItems.sort((a, b) => {
            if (a.artist !== b.artist) {
                return a.artist.localeCompare(b.artist);
            }
            return a.sequence.localeCompare(b.sequence);
        });
        
        archiveData[year] = mediaItems;
        console.log(`✓ ${year}: Found ${mediaItems.length} files`);
    });
    
    return archiveData;
}

function parseFilename(filename, expectedYear) {
    // Remove extension
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    
    // Split by dash: YEAR-ARTIST-SEQUENCE-MEDIUM
    const parts = nameWithoutExt.split('-');
    
    if (parts.length < 4) {
        return null;
    }
    
    const year = parts[0];
    const artist = parts[1];
    const sequence = parts[2];
    const medium = parts.slice(3).join('-'); // In case medium has dashes
    
    // Validate year matches folder
    if (year !== expectedYear) {
        console.log(`⚠️  Year mismatch in ${filename}: expected ${expectedYear}, got ${year}`);
    }
    
    return {
        artist: artist,
        sequence: sequence,
        medium: medium
    };
}

function formatArtistName(artistSlug) {
    // Convert "alban_ovanessian" to "Alban Ovanessian"
    return artistSlug
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function saveArchiveData(data) {
    // Create data directory if it doesn't exist
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`\n✓ Archive data saved to: ${OUTPUT_FILE}`);
    
    // Print summary
    console.log('\n📊 Summary:');
    Object.keys(data).forEach(year => {
        const items = data[year];
        const artists = [...new Set(items.map(item => item.artistDisplay))];
        const media = [...new Set(items.map(item => item.medium))];
        
        console.log(`\n${year}:`);
        console.log(`  - ${items.length} files`);
        console.log(`  - ${artists.length} artists: ${artists.join(', ')}`);
        console.log(`  - Media types: ${media.join(', ')}`);
    });
}

// Run the scanner
console.log('🔍 Scanning archive folders...\n');
const archiveData = scanArchive();
saveArchiveData(archiveData);
console.log('\n✅ Done! You can now open index.html\n');