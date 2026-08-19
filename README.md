# SUPERFIGHT

## Arcade prototype

The first playable slice is a browser-based 1v1 training build using the supplied Cyclops and Wolverine sprite folders. It includes local movement, jump, dodge frames with brief invulnerability, basic attacks, a combo power meter, a repeatable charged power attack, a three-bar special, health, a round timer, and a simple Wolverine CPU opponent.

Open [index.html](index.html) directly in a browser, or serve the repository from its root:

```powershell
py -m http.server 5173
```

Then visit `http://127.0.0.1:5173/`.

### Player controls

| Input | Action |
| --- | --- |
| Left / Right | Move and face the opponent |
| Up | Jump |
| Down | Dodge |
| X | Basic attack; clean hits build meter |
| A | Power/ranged attack; costs 1 bar |
| S | Special/ultimate; costs 3 bars |
| Enter | Start or rematch |

The sprite assets include more complete animation coverage than the current combat slice uses. The next natural systems are character select, tag-in partners, hitbox timing data, audio, and a dedicated CPU behavior layer.