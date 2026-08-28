# Tilemap Stamp

A [MakeCode Arcade](https://arcade.makecode.com/) extension that lets you
copy ("stamp") a smaller tilemap onto a larger one at a chosen column/row.
Handy for assembling big levels out of small, reusable pieces — rooms,
dungeon chunks, decorations, prefabs — either while designing a level in
code, or procedurally while the game is running.

## Blocks

### stamp tilemap ... onto ... at col ... row ...

Copies every tile (and wall setting) from a smaller **source** tilemap into
a larger **destination** tilemap, starting at the given column/row. Anything
that would land outside the destination is simply skipped, so you can stamp
partially off an edge without errors.

By default, fully transparent tiles in the source are **not** copied, so the
destination shows through in those spots — this lets you stamp
irregularly-shaped rooms without punching a rectangular hole in the
background. Turn this off with the optional "skip transparent tiles"
argument if you want an exact, opaque rectangular copy instead.

```typescript
tilemapStamp.stampTilemap(myBigTilemap, mySmallTilemap, 4, 6)
```

### stamp tilemap ... onto ... centered at col ... row ...

Same as above, but the source tilemap is centered on the given column/row
instead of using its top-left corner. Useful for stamping a piece around a
sprite's current tile location.

```typescript
tilemapStamp.stampTilemapCentered(myBigTilemap, mySmallTilemap, 10, 8)
```

### stamp tilemap ... onto current tilemap at col ... row ...

Stamps a small tilemap directly onto the tilemap that's currently loaded
and running in the scene — no need to build an offline tilemap first. Useful
for dropping in a room, or revealing part of a level, while the game plays.

```typescript
tilemapStamp.stampOnCurrentTilemap(mySmallTilemap, 5, 3)
```

### new blank tilemap width ... height ... filled with ...

Creates a brand-new tilemap of the given size, filled with a single tile —
a quick way to make a blank canvas to stamp pieces onto.

```typescript
let myBigTilemap = tilemapStamp.createBlankTilemap(20, 15, assets.tile`myTile`, TileScale.Sixteen)
```

## Typical usage

1. Draw one or more small tilemaps in the Tilemap Editor (a few tiles wide),
   e.g. `tilemap\`room1\`` and `tilemap\`room2\``.
2. Either draw a big destination tilemap the same way, or build one with
   `new blank tilemap`.
3. Call `stamp tilemap` once per small piece to place it into the big map.
4. Load the finished result with `tiles.setTilemap(myBigTilemap)`.

```typescript
let level = tilemapStamp.createBlankTilemap(30, 20, assets.tile`ground`, TileScale.Sixteen)
tilemapStamp.stampTilemap(level, tilemap`room1`, 2, 2)
tilemapStamp.stampTilemap(level, tilemap`room2`, 12, 8)
tiles.setTilemap(level)
```

Or, to add a room into the level while the game is already running:

```typescript
tilemapStamp.stampOnCurrentTilemap(tilemap`secretRoom`, 20, 10)
```

## Notes

- Both tilemaps should use the same tile scale (8px/16px/32px) for a stamp
  to line up visually.
- `stampTilemap` and `stampTilemapCentered` mutate the **destination**
  tilemap in place and don't return anything.
- The source and destination tilemaps don't need to share the same tileset
  — each stamped tile's image is looked up (or added) in the destination's
  tileset automatically, the same way Microsoft's own `arcade-tile-util`
  extension does it. A tilemap can hold at most 255 distinct tiles; if a
  destination's tileset is already full, further new tiles fall back to
  tile 0 instead of crashing the game.

## License

MIT
