# Robot Founder
A hands-off pixel-art "AI agent" show: an AI with a robot body autonomously founds and runs a **physical-products company**: garage table sale → small shop + workshop → big store + workshop → flagship store + factory floor + shipping dock → IPO (or one of six ways to fail). You just watch.

Play: https://applesdg.github.io/robot-founder/

- Each company rolls a product line (sneakers, smart planters, artisanal toasters, drone kits, candles, keyboards…) with 4 SKUs that unlock through R&D, each with its own materials cost, price, build time and quality.
- Production flow: supplier crates arrive at the loading door → workbenches/machines → finished-goods shelf → store displays.
- Store: customers walk in from the street, browse, queue, pay at the register (ka-ching) or walk out over stockouts and long lines.
- Online: orders tick in on the web monitor, get packed, and leave on the delivery van; late shipments hurt the star rating.
- Hiring by bottleneck: Customer Service, Shipping, Makers, Engineers, Marketing — each a visible NPC working its station.

Spectator controls: ★ highlights mode (H), 1x/2x/4x/8x (1-4), pause (P), follow cam (F), dashboard (D), mute (M). Hall of Fame stored in localStorage.

Balance check (browser console): `__rf.balance(200)` runs 200 headless simulations and returns the outcome distribution.

Plain JS + canvas, no build step, all art and music procedural.
