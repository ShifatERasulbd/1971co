export default function SingleProductMediaGallery({
    images,
    selectedImage,
    onSelectImage,
}) {
    const safeImages =
        Array.isArray(images) && images.length > 0 ? images : [];

    const activeImage = selectedImage || safeImages[0];

    if (!activeImage) return null;

    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
                {safeImages.slice(0, 6).map((image, index) => (
                    <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => onSelectImage(image)}
                        className={`overflow-hidden border transition-all duration-200 ${
                            activeImage === image
                                ? 'border-zinc-900'
                                : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                    >
                        <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="aspect-[4/5] w-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}