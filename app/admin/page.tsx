import { buttonVariants } from "@/src/components/ui/button";
import {CardHeader, Card, CardTitle, CardContent} from '@/src/components/ui/card'
import Link from "next/link";

export default function Page(){
     //await new Promise((resolve) => setTimeout(resolve, 3000));
    //throw new Error("pageInvalid pathname"); //pour avoir l'erreur sinon commmmenté cette ligne
    return (
        <Card>
        <CardHeader>
        <CardTitle>Url : /admin/</CardTitle>
        </CardHeader>
    
    <CardContent className="flex flex-col gap-4">
        <Link
        className={buttonVariants({ size: "lg", variant: "outline"})}  
        href="/admin/citations/1"
        >
            Citation 1
        </Link>
   
        <Link
        className={buttonVariants({ size: "lg", variant: "outline"})}  
        href="/admin/citations/patate"
        >
            Citation patate
        </Link>
    </CardContent>
    </Card>
    );
}
