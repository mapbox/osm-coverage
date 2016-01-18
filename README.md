# Compute Road Coverage in OpenStreetMap

A [TileReduce](https://github.com/mapbox/tile-reduce) processor for calculating OpenStreetMap road feature length by country or region using [OSM QA Tiles](http://osmlab.github.io/osm-qa-tiles/).

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

All sources can be conveniently downloaded using the `download.js` script in this repo.

```sh
node download.js --all
```


### Only country boundaries (admin0)

```sh
node download.js --countries
```

This will automatically download and convert the [Natural Earth 10m Countries](http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/) dataset.

### Only states (admin1)

```sh
node download.js --states
```

This will automatically download and convert the [Natural Earth 10m States](http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/) dataset.

### OSM QA tiles

[OSM QA tiles](http://osmlab.github.io/osm-qa-tiles/) are very large - about 18 GB for the world.

```sh
node download.js --osm
```

If you wish to download QA tiles yourself:

- [Download OSM QA tiles world](https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz) or for a specific [country](https://www.mapbox.com/blog/qa-tiles-extracts/)
- Use `gunzip` or any other archiving tool that can expand .gz files to expand OSM QA tiles to `.mbtiles`
- Configure index.js to point to the [.mbtiles location](https://github.com/mapbox/osm-coverage/blob/regions/index.js#L10)


## Running

When executing the TileReduce task, you may provide an optional bounding box to limit the processing to a certain area. For example:

```
node index.js --area=[-77.12,38.79,-76.9,39] > output.json
```

If no bounding box is provided, `osm-coverage` will run for the whole world.

## Output
The tilereduce output has a simple JSON structure of Admin 1 region name and kms of roads, grouped by raw osm tags or classified as motorable/unclassified

![](https://cloud.githubusercontent.com/assets/126868/12383870/13d1bf30-bdd1-11e5-86cb-13f017526229.png)
[Sample output](http://www.jsoneditoronline.org/?id=e54dbda0cb33e34db41439fc80baf579)
