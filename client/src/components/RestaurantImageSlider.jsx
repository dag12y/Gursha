import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ImageWithFallback";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80";

export default function RestaurantImageSlider({ photos, alt }) {
    const images = useMemo(() => {
        const normalized = (Array.isArray(photos) ? photos : []).filter(Boolean);
        return normalized.length ? normalized : [FALLBACK_IMAGE];
    }, [photos]);

    const [index, setIndex] = useState(0);
    const currentIndex = images.length ? index % images.length : 0;

    useEffect(() => {
        if (images.length <= 1) {
            return;
        }

        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 3500);

        return () => clearInterval(timer);
    }, [images.length]);

    function previous() {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    }

    function next() {
        setIndex((prev) => (prev + 1) % images.length);
    }

    return (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
            <ImageWithFallback
                src={images[currentIndex]}
                alt={alt || "Restaurant"}
                className="h-48 w-full object-cover"
            />

            {images.length > 1 ? (
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={previous}
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={next}
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, dotIndex) => (
                            <button
                                key={dotIndex}
                                type="button"
                                className={`h-2 w-2 rounded-full ${dotIndex === currentIndex ? "bg-white" : "bg-white/50"}`}
                                onClick={() => setIndex(dotIndex)}
                                aria-label={`Go to image ${dotIndex + 1}`}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
