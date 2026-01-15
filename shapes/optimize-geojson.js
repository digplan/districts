const fs = require('fs');
const path = require('path');

function reducePrecision(coords, precision = 5) {
    if (typeof coords[0] === 'number') {
        return coords.map(c => parseFloat(c.toFixed(precision)));
    }
    return coords.map(coord => reducePrecision(coord, precision));
}

function simplifyGeometry(coords, tolerance = 0.0001) {
    if (coords.length < 3) return coords;
    
    // Douglas-Peucker simplification (simplified version)
    const simplified = [];
    simplified.push(coords[0]);
    
    for (let i = 1; i < coords.length - 1; i++) {
        const prev = coords[i - 1];
        const curr = coords[i];
        const next = coords[i + 1];
        
        // Calculate distance from point to line segment
        const dx = next[0] - prev[0];
        const dy = next[1] - prev[1];
        const dist = Math.abs((dy * curr[0] - dx * curr[1] + next[0] * prev[1] - next[1] * prev[0]) / Math.sqrt(dx * dx + dy * dy));
        
        if (dist > tolerance) {
            simplified.push(curr);
        }
    }
    
    simplified.push(coords[coords.length - 1]);
    return simplified;
}

function optimizeGeoJSON(inputPath, outputPath, options = {}) {
    const {
        precision = 5,
        simplify = false,
        simplifyTolerance = 0.0001,
        minify = true
    } = options;
    
    console.log('Reading GeoJSON...');
    const geojson = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    console.log(`Original features: ${geojson.features.length}`);
    const originalSize = fs.statSync(inputPath).size;
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('Optimizing coordinates...');
    let coordCount = 0;
    let newCoordCount = 0;
    
    geojson.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        
        function processCoords(arr) {
            if (typeof arr[0] === 'number') {
                coordCount++;
                const reduced = arr.map(c => parseFloat(c.toFixed(precision)));
                newCoordCount++;
                return reduced;
            }
            return arr.map(processCoords);
        }
        
        let processed = processCoords(coords);
        
        if (simplify && feature.geometry.type === 'Polygon') {
            processed = processed.map(ring => simplifyGeometry(ring, simplifyTolerance));
        } else if (simplify && feature.geometry.type === 'MultiPolygon') {
            processed = processed.map(poly => poly.map(ring => simplifyGeometry(ring, simplifyTolerance)));
        }
        
        feature.geometry.coordinates = processed;
    });
    
    console.log(`Processed ${coordCount} coordinates`);
    
    // Write optimized file
    const output = minify ? JSON.stringify(geojson) : JSON.stringify(geojson, null, 2);
    fs.writeFileSync(outputPath, output);
    
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`\n✓ Optimized GeoJSON written to ${outputPath}`);
    console.log(`New size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Reduction: ${reduction}%`);
}

// Main
const inputPath = path.join(__dirname, '..', 'districts-2024.geojson');
const outputPath = path.join(__dirname, '..', 'districts-2024-optimized.geojson');

const args = process.argv.slice(2);
const precision = args.includes('--precision') ? parseInt(args[args.indexOf('--precision') + 1]) : 5;
const simplify = args.includes('--simplify');
const minify = !args.includes('--pretty');

optimizeGeoJSON(inputPath, outputPath, {
    precision,
    simplify,
    simplifyTolerance: 0.0001,
    minify
});


