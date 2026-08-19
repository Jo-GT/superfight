# SUPERFIGHT

## Arcade prototype

The first playable slice is a browser-based 1v1 training build using the supplied Cyclops and Wolverine sprite folders. It includes local movement, jump, dodge frames with brief invulnerability, basic attacks, a combo power meter, a repeatable charged power attack, a three-bar special, health, a round timer, and a CPU opponent with selectable Easy, Normal, and Hard behavior. Cyclops' power and special attacks now launch the supplied beam/projectile frame sequences as independent moving hitboxes; the special uses the complete `000-008` through `111-112` sequence.

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
| X | Basic attack; clean hits build meter. Press during a jump for an aerial attack |
| A | Power/ranged attack; costs 1 bar |
| S | Special/ultimate; costs 3 bars |
| Enter | Start or rematch |
| Esc | Pause/unpause; open the move list or return to character select |

The arcade menu also lets Player 1 choose Cyclops or Wolverine and select one of three available costume folders. The opponent uses the other character and starts in its default costume.

Music is loaded from `Music/`: `xmenmain.mp3` loops on the character-select menu and `BGM.mp3` loops during fights. Fight music pauses with `Esc` and resumes when the match resumes.

Cyclops' basic attacks chain through four animation stages when hits are continued inside the combo window. The HUD shows the current hit count up to `x10`; Attack1 and Attack4 also use their matching projectile frame sets.

The sprite assets include more complete animation coverage than the current combat slice uses. The next natural systems are character select, tag-in partners, hitbox timing data, audio, and a dedicated CPU behavior layer.