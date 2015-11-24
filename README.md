# osm-coverage

A [TileReduce](https://github.com/mapbox/tile-reduce) processor for calculating OpenStreetMap coverage by country

## installation

```
npm install 
```

## downloading data


`osm-coverage` requires two data sources

- Country boundaries
- OSM QA Tiles

### all sources

Both sources can be conveniently downloaded using the `download.js` script in this repo.

```sh
node download.js --all
```


### only country boundaries

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


## running

When executing the TileReduce task, you may provide a bounding box to select tiles. For example:

```
node index.js --area=[-77.12,38.79,-76.9,39] > output.json
```

If no bounding box is provided, `osm-coverage` will run for the whole world.

