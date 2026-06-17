import react from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription,CardFooter } from '@/components/ui/card';

const DEFAULT_CARD_ITEMS=[
    { title: 'Total Purchase', amount: 0, format: 'currency', description: 'Live from checkout orders' },
    { title: 'Total Sell', amount: 0, format: 'count', description: 'Items sold across orders' },
    { title: 'Total Revenue', amount: 0, format: 'currency', description: 'Live gross revenue' },
]

function formatAmount(amount, format = 'currency') {
    const numericValue = Number(amount) || 0;

    if (format === 'count') {
        return new Intl.NumberFormat('en-US').format(numericValue);
    }

    return `$${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numericValue)}`;
}

export function HeaderCard({ items = DEFAULT_CARD_ITEMS, loading = false }){
    const cardItems = Array.isArray(items) && items.length > 0 ? items : DEFAULT_CARD_ITEMS;

    return(
        <>
            {cardItems.map((item, index)=>(
                <Card key={`${item.title}-${index}`}>
                    <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.description || 'Live dashboard metric'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            <b>{loading ? 'Loading…' : formatAmount(item.amount, item.format)}</b>
                        </p>
                    </CardContent>
                    {/* <CardFooter>
                        <p>Card Footer</p>
                    </CardFooter> */}
                </Card>
            ))}
         
        </>
    )
}