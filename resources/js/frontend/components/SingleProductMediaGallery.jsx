export default function SingleProductMediaGallery({ images, selectedImage, onSelectImage }) {
    return (
        <div className="grid grid-cols-[84px_1fr] gap-3.5 lg:grid-cols-[94px_1fr] lg:gap-5">
            <div className="space-y-3">
                {images.map((image) => (
                    <button
                        key={image}
                        type="button"
                        onClick={() => onSelectImage(image)}
                        className={`block overflow-hidden border bg-zinc-100 transition-colors ${
                            selectedImage === image
                                ? 'border-zinc-950'
                                : 'border-zinc-200 hover:border-zinc-500'
                        }`}
                        aria-label="Select product image"
                    >
                        <img
                            src={image}
                            alt="Product thumbnail"
                            className="h-[96px] w-full object-cover object-center lg:h-[108px]"
                        />
                    </button>
                ))}
            </div>

            <div className="overflow-hidden border border-zinc-200 bg-zinc-100 shadow-[0_16px_44px_rgba(0,0,0,0.08)]">
                <img
                    src={selectedImage}
                    alt="Corporate full sleeve t-shirt"
                    className="h-[600px] w-full object-cover object-center sm:h-[660px] xl:h-[740px]"
                />
            </div>
        </div>
    );
}
