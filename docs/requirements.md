# HoneyGame — Requirements Plan

Approved direction: a cozy, apiary-first idle game with discovery. This document incorporates the latest conversation decisions, including the home sale bin and the two-week offline calendar cap.

## Product contract

- R1. Start with one small hive and one colony in a village backyard.
- R2. Introduce care, harvesting, home shipping, and a useful first purchase through village letters.
- R3. Production continues while away, limited by hive and shared pantry/shipping capacity. Full containers pause production safely; stored goods never spoil.
- R4. The starter hive holds honey until manually harvested. A later collector upgrade transfers whole goods into storage, subject to both capacities.
- R5. Care is a short inspection/repair checklist. Missing it never destroys colonies or progress.
- R6. One in-game day is ten real minutes, seven days form a week, four weeks a season, and four seasons a year.
- R7. The calendar advances offline by at most fourteen in-game days per absence. Production uses elapsed real time within capacity limits. Discarded calendar time is not carried into the next load.
- R8. The farmers market opens for one day each week, principally for shopping. Vendor inventory rotates.
- R9. Players queue goods in a home sale bin; they are sold automatically at the end of the market day, including when the boundary passes offline. No market attendance or stall setup is required.
- R10. Players may withdraw queued goods before settlement; unqueued goods remain safely stored.
- R11. Bee variety and planted forage influence honey. Plants and fruit trees support the apiary, rather than creating a crop-first farm simulator.
- R12. Coins may buy available equipment, space, plants, trees, recipes, and bee varieties without a prescribed upgrade sequence.
- R13. Seasons change production and opportunities; winter emphasizes maintenance and preparation without permanent harm.
- R14. Villager letters gradually teach systems. Deep relationships, multiplayer, survival mechanics, and complex pricing are outside the first version.
- R15. Special-event markets and a broader discovery catalog are later content, not required for the initial slice.
- R16. Progress persists between visits. Save failures must be visible rather than silently losing progress.
- R17. The garden occupies the entire screen, with compact floating HUD controls and thumb-friendly navigation rather than a scrolling dashboard.
- R18. Hive care, planting, storage, markets, and letters open in dismissible panels over the garden; portrait and landscape views keep the important locations reachable.
- R19. The project has an Android packaging path for eventual Google Play distribution, with bundled assets, native save storage, and app lifecycle handling.

## First playable boundary

One backyard and one hive, a small forage garden, honey and wax, one candle recipe, a home shipping bin, rotating weekly shopping, coin upgrades, letters, seasonal rates, and offline save/load. Two honeybee varieties demonstrate forage preferences within one colony slot; the wider collection remains future work.

## Implementation choices and tunable assumptions

- React/TypeScript game with a Capacitor Android host and a browser development build. Native saves use Preferences; existing browser saves retain their localStorage key. No account or server is required.
- Daily inspection and weekly repair give temporary bonuses; the baseline hive remains productive without chores.
- Day 7 is market day. The latest approved market-day shipping rule supersedes the earlier suggestion of daily payouts. UI explains the weekly collection explicitly.
- Pantry and sale bin share capacity, so moving goods into shipping cannot bypass storage limits.
- Manual harvest transfers only whole units that fit; the remainder stays in the hive. Wax has a separate small hive allowance.
- A collector is an optional progression purchase, not a starter entitlement.
- Production beyond the offline calendar cap uses the final simulated season and expired care bonuses. No extra shipping cycles occur beyond the cap.
- An explicit time-preview panel allows testing minutes, market days, and seasons without waiting; preview time changes the current save.
- Exact rates, prices, content names, visual presentation, and capacity sizes are playtest parameters.

## Verification

Simulation tests cover capacity bounds, partial harvesting, time boundaries, idempotent offline settlement, calendar caps, season rollover, buying restrictions, rotating stock, crafting, and save validation. Browser tests cover first harvest, home shipping and payout, purchases, persisted progress, full-viewport gardens, accessible sheets, touch targets, and portrait/landscape layouts. Native adapter tests cover ordered Preferences writes, Back handling, lifecycle forwarding, and save sharing; real-device acceptance remains necessary before release.
