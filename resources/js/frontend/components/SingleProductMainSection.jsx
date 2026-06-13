import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';
import SingleProductDetailsPanel from './SingleProductDetailsPanel.jsx';
import SingleProductMediaGallery from './SingleProductMediaGallery.jsx';

const product = {
    name: 'Corporate Full Sleeve T-Shirt',
    price: '$16.95',
    description:
        'Designed for comfort and professionalism, the Corporate Full Sleeve T-shirt combines premium fabric with a clean modern fit.',
    colors: [
        { label: 'Black', value: '#000000' },
        { label: 'Green', value: '#5d9b88' },
        { label: 'Cream', value: '#e8e3c7' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
};

const productImages = [
    '/uploads/personalizer/order/order-design-ec8725a6-cb1f-456a-b929-ebf789cc956d.png',
    '/uploads/heroes/images/hero1.webp',
    '/uploads/personalizer/order/order-design-7069fa1a-7e0f-4ed7-80df-3b10ac7092d0.png',
    '/uploads/personalizer/order/order-design-e9e2e99a-d9f7-40a1-9a43-773d8aa00524.png',
    '/uploads/personalizer/order/order-design-a821648d-34d4-4db9-b17b-986431fd341b.png',
    '/uploads/personalizer/order/order-design-9eff0a64-52bc-48c1-9eaf-ddfd438b40f0.png',
];

export default function SingleProductMainSection() {
    const [selectedImage, setSelectedImage] = useState(productImages[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0].label);
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);

    const breadcrumbs = useMemo(
        () => [
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: 'Ribbed Tank Top', to: '/singleProduct' },
        ],
        []
    );

    function decreaseQuantity() {
        setQuantity((previous) => Math.max(1, previous - 1));
    }

    function increaseQuantity() {
        setQuantity((previous) => previous + 1);
    }

    return (
        <section className={`${featuresFontClass} bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-10`}>
            <div className="mx-auto w-full max-w-[1520px]">
                <p className="mb-4 text-[0.95rem] uppercase tracking-[0.08em] text-slate-600 sm:mb-6">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.label}>
                            <Link to={crumb.to} className="transition-colors hover:text-zinc-900">
                                {crumb.label}
                            </Link>
                            {index < breadcrumbs.length - 1 ? ' / ' : ''}
                        </span>
                    ))}
                </p>

                <div className="grid items-start gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:gap-10">
                    <div className="self-start">
                        <SingleProductMediaGallery
                            images={productImages}
                            selectedImage={selectedImage}
                            onSelectImage={setSelectedImage}
                        />
                    </div>

                    <SingleProductDetailsPanel
                        product={product}
                        selectedColor={selectedColor}
                        onSelectColor={setSelectedColor}
                        selectedSize={selectedSize}
                        onSelectSize={setSelectedSize}
                        quantity={quantity}
                        onDecreaseQuantity={decreaseQuantity}
                        onIncreaseQuantity={increaseQuantity}
                    />
                </div>
            </div>
        </section>
    );
}
