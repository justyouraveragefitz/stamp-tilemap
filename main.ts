/**
 * Tilemap Stamp
 * ---------------------------------------------------------------------------
 * Copies ("stamps") a smaller tilemap onto a larger one at a given column
 * and row. Useful for building big levels out of small, reusable pieces
 * (rooms, prefabs, dungeon chunks, etc.) either while designing a level or
 * procedurally at runtime.
 *
 * Implementation notes (why this looks the way it does):
 * `tiles.TileMapData.getTile(col, row)` returns a *tileset index*, not an
 * Image - `getTileImage(index)` turns that index back into the actual tile
 * picture. `setTile(col, row, index)` likewise wants an index. Two different
 * tilemaps almost never share the same tileset order, so a stamp has to
 * look up (or add) each source tile's image in the destination's tileset
 * before writing the matching index - this mirrors what Microsoft's own
 * arcade-tile-util extension does in its `setTileAt` helper.
 */

//% color="#6b5b95" icon="\uf00a" weight=90 groups='["Stamp", "Create"]'
namespace tilemapStamp {

    /**
     * Stamp a smaller tilemap onto a larger tilemap at the given column/row.
     * Tiles (and walls) from the source overwrite the matching tiles in the
     * destination. Anything that would land outside the destination is
     * skipped, so it's safe to stamp partially off the edge.
     *
     * @param destination the larger tilemap to stamp onto
     * @param source the smaller tilemap to copy from
     * @param col the destination column for the source's top-left tile
     * @param row the destination row for the source's top-left tile
     * @param skipTransparent when true, fully transparent tiles in the source are left alone so the destination shows through them
     */
    //% blockId=tilemapStamp_stamp
    //% block="stamp tilemap $source|onto $destination|at col $col row $row||skip transparent tiles $skipTransparent"
    //% source.shadow=variables_get
    //% source.defl=mySmallTilemap
    //% destination.shadow=variables_get
    //% destination.defl=myBigTilemap
    //% skipTransparent.defl=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% group="Stamp"
    //% weight=100
    //% blockGap=8
    export function stampTilemap(
        destination: tiles.TileMapData,
        source: tiles.TileMapData,
        col: number,
        row: number,
        skipTransparent: boolean = true
    ): void {
        if (!destination || !source) return;
        if (source.width <= 0 || source.height <= 0) return;

        col = Math.round(col);
        row = Math.round(row);

        // Nothing to do if the source is entirely off the destination map
        if (col >= destination.width || row >= destination.height) return;
        if (col + source.width <= 0 || row + source.height <= 0) return;

        // A blank reference tile, sized to match the source's actual tile
        // dimensions, used to detect "empty" source tiles.
        let blank: Image = null;
        if (skipTransparent) {
            const sample = source.getTileImage(source.getTile(0, 0));
            blank = image.create(sample.width, sample.height);
        }

        // The destination's live tileset - pushing onto this array adds a
        // new tile to the destination tilemap directly, same as the
        // official tileUtil.setTileAt helper does.
        const destTileset = destination.getTileset();

        // Caches "source tileset index" -> "destination tileset index" for
        // this stamp call, so repeated tiles (grass, floor, etc.) only get
        // looked up/added to the destination tileset once each.
        const indexCache: number[] = [];

        for (let sy = 0; sy < source.height; sy++) {
            const dy = row + sy;
            if (dy < 0 || dy >= destination.height) continue;

            for (let sx = 0; sx < source.width; sx++) {
                const dx = col + sx;
                if (dx < 0 || dx >= destination.width) continue;

                const srcIndex = source.getTile(sx, sy);
                const tileImg = source.getTileImage(srcIndex);

                if (skipTransparent && tileImg.equals(blank)) continue;

                let destIndex = indexCache[srcIndex];
                if (destIndex === undefined) {
                    destIndex = -1;
                    for (let i = 0; i < destTileset.length; i++) {
                        if (destTileset[i].equals(tileImg)) {
                            destIndex = i;
                            break;
                        }
                    }
                    if (destIndex === -1) {
                        if (destTileset.length < 0xff) {
                            destIndex = destTileset.length;
                            destTileset.push(tileImg);
                        } else {
                            // Destination tileset is completely full (255
                            // tiles, the max a tilemap can hold). Fall back
                            // to tile 0 rather than crashing the game.
                            destIndex = 0;
                        }
                    }
                    indexCache[srcIndex] = destIndex;
                }

                destination.setTile(dx, dy, destIndex);
                destination.setWall(dx, dy, source.isWall(sx, sy));
            }
        }
    }

    /**
     * Stamp a smaller tilemap onto a larger tilemap, centering it on the
     * given column/row instead of using its top-left corner.
     *
     * @param destination the larger tilemap to stamp onto
     * @param source the smaller tilemap to copy from
     * @param centerCol the destination column to center the source on
     * @param centerRow the destination row to center the source on
     * @param skipTransparent when true, transparent tiles in the source are left alone
     */
    //% blockId=tilemapStamp_stampCentered
    //% block="stamp tilemap $source|onto $destination|centered at col $centerCol row $centerRow||skip transparent tiles $skipTransparent"
    //% source.shadow=variables_get
    //% source.defl=mySmallTilemap
    //% destination.shadow=variables_get
    //% destination.defl=myBigTilemap
    //% skipTransparent.defl=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% group="Stamp"
    //% weight=90
    //% blockGap=8
    export function stampTilemapCentered(
        destination: tiles.TileMapData,
        source: tiles.TileMapData,
        centerCol: number,
        centerRow: number,
        skipTransparent: boolean = true
    ): void {
        if (!destination || !source) return;

        const col = Math.round(centerCol) - (source.width >> 1);
        const row = Math.round(centerRow) - (source.height >> 1);

        stampTilemap(destination, source, col, row, skipTransparent);
    }

    /**
     * Stamp a smaller tilemap directly onto the tilemap that's currently
     * loaded and running in the scene (rather than an offline tilemap
     * variable). Handy for dropping in a room or decoration while the
     * game is playing.
     *
     * @param source the smaller tilemap to copy from
     * @param col the column in the running tilemap for the source's top-left tile
     * @param row the row in the running tilemap for the source's top-left tile
     * @param skipTransparent when true, transparent tiles in the source are left alone
     */
    //% blockId=tilemapStamp_stampLive
    //% block="stamp tilemap $source|onto current tilemap at col $col row $row||skip transparent tiles $skipTransparent"
    //% source.shadow=variables_get
    //% source.defl=mySmallTilemap
    //% skipTransparent.defl=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% group="Stamp"
    //% weight=80
    //% blockGap=8
    export function stampOnCurrentTilemap(
        source: tiles.TileMapData,
        col: number,
        row: number,
        skipTransparent: boolean = true
    ): void {
        if (!source) return;
        if (source.width <= 0 || source.height <= 0) return;

        const scene = game.currentScene();
        if (!scene || !scene.tileMap || !scene.tileMap.enabled) return;

        const mapData = scene.tileMap.data;
        if (!mapData) return;

        col = Math.round(col);
        row = Math.round(row);

        let blank: Image = null;
        if (skipTransparent) {
            const sample = source.getTileImage(source.getTile(0, 0));
            blank = image.create(sample.width, sample.height);
        }

        for (let sy = 0; sy < source.height; sy++) {
            const dy = row + sy;
            if (dy < 0 || dy >= mapData.height) continue;

            for (let sx = 0; sx < source.width; sx++) {
                const dx = col + sx;
                if (dx < 0 || dx >= mapData.width) continue;

                const tileImg = source.getTileImage(source.getTile(sx, sy));
                if (skipTransparent && tileImg.equals(blank)) continue;

                // tiles.setTileAt takes an Image directly and manages the
                // tileset lookup/insert for us - no manual indexing needed
                // for the live scene tilemap.
                const location = tiles.getTileLocation(dx, dy);
                tiles.setTileAt(location, tileImg);
                tiles.setWallAt(location, source.isWall(sx, sy));
            }
        }
    }

    /**
     * Create a new blank tilemap filled with a single tile, ready to have
     * smaller tilemaps stamped onto it. Handy for building a big level
     * canvas out of smaller prefab pieces.
     *
     * @param width the width of the new tilemap, in tiles
     * @param height the height of the new tilemap, in tiles
     * @param background the tile used to fill the new tilemap
     * @param scale the pixel size of each tile
     */
    //% blockId=tilemapStamp_blank
    //% block="new blank tilemap width $width|height $height|filled with $background||tile size $scale"
    //% background.shadow=tileset_tile_picker
    //% width.defl=16
    //% height.defl=16
    //% scale.defl=TileScale.Sixteen
    //% expandableArgumentMode="toggle"
    //% blockSetVariable=myBigTilemap
    //% group="Create"
    //% weight=70
    //% blockGap=8
    export function createBlankTilemap(
        width: number,
        height: number,
        background: Image,
        scale: TileScale = TileScale.Sixteen
    ): tiles.TileMapData {
        width = Math.max(1, Math.round(width));
        height = Math.max(1, Math.round(height));

        // Tilemap buffer format: 2 bytes width, 2 bytes height, then one
        // byte per tile holding an index into the tileset. Index 0 (the
        // only entry in our tileset) fills every cell, so this "memset"
        // to 0 already gives us a fully-filled blank map. (Matches the
        // buffer layout used by Microsoft's own arcade-tile-util.cloneMap.)
        const buffer = control.createBuffer(4 + width * height);
        buffer.setNumber(NumberFormat.UInt16LE, 0, width);
        buffer.setNumber(NumberFormat.UInt16LE, 2, height);

        return tiles.createTilemap(
            buffer,
            image.create(width, height),
            [background],
            scale
        );
    }
}
