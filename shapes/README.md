# Shapefile to GeoJSON Converter

This script converts the congressional district shapefiles to GeoJSON format and optimizes them.

## Setup

1. Install dependencies:
```bash
npm install
```

## Usage

### Convert Shapefile to GeoJSON
```bash
npm run convert
```

Or directly:
```bash
node convert-to-geojson.js
```

The output file `districts-2024.geojson` will be created in the parent directory.

### Optimize GeoJSON (Reduce File Size)

Optimize the GeoJSON file to reduce size:
```bash
npm run optimize
```

This will:
- Reduce coordinate precision to 5 decimal places
- Minify JSON (remove whitespace)
- Create `districts-2024-optimized.geojson` (~75% smaller)

For additional geometry simplification:
```bash
npm run optimize:simplify
```

Options:
- `--precision N`: Set coordinate precision (default: 5)
- `--simplify`: Enable geometry simplification
- `--pretty`: Keep pretty-printed JSON (default: minified)
