import { CardTitle, CardHeader, Card } from "@/src/components/ui/card";

export default async function Page(props: {
    params: Promise<{
        cirationId: string;
    }>;
    //on peut récuperer des search params
    searchParams: Promise<Record<string, string | string[]>>

}){ //pour recuperer les params
    const params = await props.params;
    //pour recuperer les search params
    const searchParams = await props.searchParams;
     return(

            <Card>
                <CardHeader>
                <CardTitle>{JSON.stringify(params, null, 2)}</CardTitle>
                <CardTitle>{JSON.stringify(searchParams, null, 2)}</CardTitle>
                </CardHeader>
            </Card>
                
    );
}
