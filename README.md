# Compute Road Coverage in OpenStreetMap

A [TileReduce](https://github.com/mapbox/tile-reduce) processor for calculating OpenStreetMap mileage by country using [OSM QA Tiles](http://osmlab.github.io/osm-qa-tiles/).

See [How Complete is OpenStreetMap?](https://www.mapbox.com/blog/how-complete-is-openstreetmap/).

    # Usage in short (more command options below)
    npm install
    node download.js --all
    node index.js > output.json

## Installation

```
npm install
```

## Downloading data


`osm-coverage` requires two data sources

- Country boundaries
- OSM QA Tiles

### All sources

Both sources can be conveniently downloaded using the `download.js` script in this repo.

```sh
node download.js --all
```


### Only country boundaries

```sh
node download.js --countries
```

This will automatically download and convert the [Natural Earth 10m Countries](http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/) dataset.

### osm qa tiles

OSM QA tiles are very large - about 18 GB.

```sh
node download.js --osm
```

If you wish to download QA tiles yourself:

- [Download OSM QA tiles](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz)
- Use `gunzip` or any other archiving tool that can expand .gz files to expand OSM QA tiles


## Running

When executing the TileReduce task, you may provide a bounding box to select tiles. For example:

```
node index.js --area=[-77.12,38.79,-76.9,39] > output.json
```

If no bounding box is provided, `osm-coverage` will run for the whole world.

