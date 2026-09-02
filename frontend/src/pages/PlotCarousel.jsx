import { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { getPlots } from "../api"
import { Link } from "react-router-dom"
import PlotCard from "../components/PlotCard"
import "./PlotCarousel.css"

const PlotCarousel = () => {

    const [plots, setPlots] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

    useEffect(() => {
        const fetchPlots = async() => {
            const data = await getPlots()
            setPlots(data)
            setIsLoading(false)
        }
        fetchPlots()
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap())
        }

        onSelect()
        emblaApi.on("select", onSelect)

        return () => emblaApi.off("select", onSelect)
    }, [emblaApi])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const slides = [
        ...plots.map((plot) => ({ type: "plot", plot })),
        { type: "add", id: "add-end" },
    ]

    useEffect(() => {
        if (emblaApi && slides.length > 1) {
            emblaApi.scrollTo(0)
        }
    }, [emblaApi, slides.length])

    if (isLoading){
        return(<p>Loading....</p>)
    }
    if (plots.length===0){
        return(
            <>
            <p>You Have no plots yet! </p>
            <Link to='/plot/new'>(+)</Link>
            </>
        )
    }
    
    return(
        <div className="plot-carousel">
            <div className="plot-carousel__viewport">
                <button type="button" className="plot-carousel__arrow plot-carousel__arrow--left" onClick={scrollPrev} aria-label="Previous plot">
                    <img src="/src/assets/arrow.png" alt="Previous" />
                </button>

                <div className="embla" ref={emblaRef}>
                    <div className="embla__container">
                        {slides.map((slide, index) => (
                            <div key={slide.id ?? slide.plot?.id ?? index} className="embla__slide">
                                {slide.type === "add" ? (
                                    <Link to="/plot/new" className="plot-card plot-card--add">
                                        +
                                    </Link>
                                ) : (
                                    <PlotCard plot={slide.plot} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="button" className="plot-carousel__arrow plot-carousel__arrow--right" onClick={scrollNext} aria-label="Next plot">
                    <img src="/src/assets/arrow.png" alt="Next" />
                </button>
            </div>

            <div className="plot-carousel__dots" aria-label="Plot selection">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id ?? slide.plot?.id ?? `dot-${index}`}
                        type="button"
                        className={`plot-carousel__dot ${selectedIndex === index ? "is-active" : ""}`}
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            <div className="plot-carousel__nav">
                <div className="plot-carousel__nav-section">
                    <Link to="/beedex" className="plot-carousel__nav-link plot-carousel__nav-link--left" aria-label="Go to Beedex" title="Bee-dex">
                        <img src="/src/assets/pokedex.png" alt="Beedex" />
                    </Link>
                    <div className="plot-carousel__nav-tooltip">Bee-dex</div>
                </div>
                <div className="plot-carousel__nav-caption">{selectedIndex + 1} of {plots.length} plots</div>
                <div className="plot-carousel__nav-section">
                    <Link to="/map" className="plot-carousel__nav-link plot-carousel__nav-link--right" aria-label="Go to map" title="Map">
                        <img src="/src/assets/globe.png" alt="Map" />
                    </Link>
                    <div className="plot-carousel__nav-tooltip">Map</div>
                </div>
            </div>
        </div>
    )
}

export default PlotCarousel
