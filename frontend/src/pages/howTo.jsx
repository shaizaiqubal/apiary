import "./HowTo.css"

const HowTo = () => (
    <main className="howto-page">
        <h1>How To Play</h1>
        <p><em>Turn your garden into a home for the bees.</em></p>
        <section><h3>Set up a plot</h3><img src="/src/assets/how2/plotcreation.png" alt="Creating a plot" /><p>A plot is any patch you're gardening: a yard, balcony, or windowbox. Drop a pin on the map and tell us:</p><ul><li>How much sun it gets</li><li>What kind of area it is:<ul><li>Balcony pot: a pot, windowbox, or small patch.</li><li>Small garden: a kitchen garden or backyard.</li><li>Large garden: a bigger garden with room for beds and borders.</li><li>Allotment: a community or public garden.</li></ul></li><li>Its approximate size in square metres (optional).</li></ul></section>
        <section><h3>The carousel</h3><img src="/src/assets/how2/carousel.png" alt="The plot carousel" /><p>Your plot is now a floating island! Level it up to watch it evolve. Browse plots, create new ones, and reach the Bee-dex and Field Map from here.</p></section>
        <section><h3>Your plot</h3><img src="/src/assets/how2/plotdetail.png" alt="Plot details" /><p>Open an island in the carousel to see your points, current tier, and activity.</p><p>Plots move through four stages:</p><ul><li>Seedling — 0 points</li><li>Garden — 500 points</li><li>Habitat — 1,250 points</li><li>Sanctuary — 2,500 points</li></ul><p><em>Can you make your plot a Sanctuary?</em></p><h5>Quests</h5><img src="/src/assets/how2/quest.png" alt="A quest card" /><p>Press Get a Quest to receive one plant quest and one nesting quest. When you complete one, submit a photo for verification. Once accepted, you receive your points.</p></section>
        <section><h5>Bee sightings</h5><img src="/src/assets/how2/sighting.png" alt="Submitting a bee sighting" /><p>Click “I found a bee” and submit a photo. The vision model checks that it is a bee, then suggests species for you to confirm.</p><img src="/src/assets/how2/sightingconfirm.png" alt="Confirming a bee species" /><p>Once confirmed, you receive points and the bee joins your Bee-dex.</p></section>
        <section><h5>About the bees</h5><p>Each bee has a rarity tier worth a set number of points:</p><ul><li>Common: 25 points</li><li>Uncommon: 45 points</li><li>Rare: 75 points</li><li>Shiny specialist bees: 150 points</li></ul><p>Your first sighting earns full points; repeat sightings earn 5 points.</p></section>
        <section><h3>The Bee-dex</h3><img src="/src/assets/how2/beedex.png" alt="The Bee-dex" /><p>Reached from the carousel, the Bee-dex is your collection of every bee you've spotted, complete with fun facts.</p></section>
        <section><h3>The Field Map</h3><img src="/src/assets/how2/map.png" alt="The Field Map" /><p>See every Apiary plot on one map and watch the small stuff add up.</p></section>
    </main>
)

export default HowTo
