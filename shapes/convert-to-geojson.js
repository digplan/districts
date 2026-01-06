const fs = require('fs');
const path = require('path');
const shapefile = require('shapefile');

async function convertShapefile() {
    const shapefileName = 'cb_2024_us_cd119_500k.shp';
    const shapefilePath = path.join(__dirname, shapefileName);
    const outputPath = path.join(__dirname, '..', 'districts-2024.geojson');

    try {
        console.log('Reading shapefile from:', shapefilePath);
        
        const source = await shapefile.open(shapefilePath);
        const features = [];
        
        console.log('Converting to GeoJSON...');
        
        let result = await source.read();
        while (!result.done) {
            features.push(result.value);
            result = await source.read();
        }
        
        const geojson = {
            type: 'FeatureCollection',
            features: features
        };
        
        // Write to file
        fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
        
        console.log(`✓ Successfully converted to ${outputPath}`);
        console.log(`  Features: ${geojson.features.length}`);
        
        // Show sample properties
        if (geojson.features.length > 0) {
            console.log('\nSample properties from first feature:');
            console.log(JSON.stringify(geojson.features[0].properties, null, 2));
        }
        
    } catch (error) {
        console.error('Error converting shapefile:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

convertShapefile();

