const offices = [
    {
        title: 'USA',
        address: '70 Washington Square',
        city: 'New York, NY 10012, USA',
        phone: '(2) 123 -456 -789',
        email: 'hello@timeless.ca',
    },
    {
        title: 'Canada',
        address: '70 Washington Square',
        city: 'New York, NY 10012, USA',
        phone: '(2) 123 -456 -789',
        email: 'hello@timeless.ca',
    },
    {
        title: 'Office',
        address: '70 Washington Square',
        city: 'New York, NY 10012, USA',
        phone: '(2) 123 -456 -789',
        email: 'hello@timeless.ca',
    },
];

export default function ContactLocationCards() {
    return (
        <div className="mt-14 bg-white px-6 py-8 sm:px-10 sm:py-10 lg:mt-16 lg:px-14 lg:py-12">
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                {offices.map((office) => (
                    <article key={office.title} className="text-center text-zinc-500">
                        <h3 className="font-serif text-[1.8rem] uppercase tracking-[0.02em] text-zinc-900 sm:text-[2rem]">
                            {office.title}
                        </h3>
                        <p className="mt-5 text-[0.98rem] leading-8">
                            {office.address}
                            <span className="block">{office.city}</span>
                        </p>
                        <p className="mt-6 text-[0.98rem] leading-8">
                            <span className="block">{office.phone}</span>
                            <span className="block">{office.email}</span>
                        </p>
                    </article>
                ))}
            </div>
        </div>
    );
}
