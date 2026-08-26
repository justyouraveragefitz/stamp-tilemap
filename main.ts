/**
 * Tilemap Stamp
 * ---------------------------------------------------------------------------
 * Copies ("stamps") a smaller tilemap onto a larger one at a given column
 * and row. Useful for building big levels out of small, reusable pieces
 * (rooms, prefabs, dungeon chunks, etc.) either while designing a level or
 * procedurally at runtime.
 *
 * Works with `tiles.TileMapData` objects — the same object type you get
 * from a `tilemap\`...\`` literal in code, or from a tilemap variable
 * created in the Tilemap Editor.
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
     * @param skipTransparent when true, transparent tiles in the source are left alone so the destination shows through them
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

        col = Math.round(col);
        row = Math.round(row);

        // Nothing to do if the source is entirely off the destination map
        if (col >= destination.width || row >= destination.height) return;
        if (col + source.width <= 0 || row + source.height <= 0) return;

        // Figure out the blank/transparent reference tile once, using the
        // actual size of the source's tiles (8/16/32px, etc.)
        let blank: Image = null;
        if (skipTransparent && source.width > 0 && source.height > 0) {
            const sample = source.getTile(0, 0);
            blank = image.create(sample.width, sample.height);
        }

        for (let sy = 0; sy < source.height; sy++) {
            const dy = row + sy;
            if (dy < 0 || dy >= destination.height) continue;

            for (let sx = 0; sx < source.width; sx++) {
                const dx = col + sx;
                if (dx < 0 || dx >= destination.width) continue;

                const tileImg = source.getTile(sx, sy);
                if (skipTransparent && blank && tileImg.equals(blank)) continue;

                destination.setTile(dx, dy, tileImg);
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
    //% weight=80
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
        // to 0 already gives us a fully-filled blank map.
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
