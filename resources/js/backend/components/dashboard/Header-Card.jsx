import react from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription,CardFooter } from '@/components/ui/card';

const CardItems=[
    {title:'Total Purchase', amount:'5236' },
    {title:'Total Sell', amount:'1200'},
    {title:'Total Revenue', amount:'20000'},
]
export function HeaderCard(){
    return(
        <>
            {CardItems.map((item)=>(
                <Card>
                    <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>Card Description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p><b>${item.amount}</b></p>
                    </CardContent>
                    {/* <CardFooter>
                        <p>Card Footer</p>
                    </CardFooter> */}
                </Card>
            ))}
         
        </>
    )
}