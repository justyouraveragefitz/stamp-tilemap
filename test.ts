// Example: build a big tilemap out of two small "room" tilemaps.
//
// Replace `smallRoom` / `secondRoom` with tilemaps you draw yourself in
// the Tilemap Editor (drag a "tilemap" block in, click it, and paint a
// small room a few tiles wide). This file just shows the pattern.

namespace tilemapStampExample {
    export function demo() {
        const groundTile = image.create(16, 16);
        groundTile.fill(6); // solid color tile just for this standalone demo

        // A big blank 20x15 tile canvas to build the level on
        const level = tilemapStamp.createBlankTilemap(20, 15, groundTile, TileScale.Sixteen);

        // In a real project these would be `tilemap`-editor tilemaps you
        // painted by hand, e.g.: let smallRoom = tilemap`room1`
        const smallRoom = tilemapStamp.createBlankTilemap(4, 4, groundTile, TileScale.Sixteen);
        const secondRoom = tilemapStamp.createBlankTilemap(3, 5, groundTile, TileScale.Sixteen);

        // Stamp the small rooms onto the big level at different spots
        tilemapStamp.stampTilemap(level, smallRoom, 2, 2);
        tilemapStamp.stampTilemap(level, secondRoom, 10, 6, true);

        // Or center a piece on a location, e.g. around the player
        tilemapStamp.stampTilemapCentered(level, secondRoom, 15, 3);

        tiles.setTilemap(level);
    }
}

tilemapStampExample.demo();
