import {Button} from '@/src/components/ui/button';
import {CardHeader, Card, CardTitle} from '@/src/components/ui/card'
export default function Page(){
    return (
        <Card>
        <CardHeader>Header</CardHeader>
        <CardTitle>
            <Button>Click me</Button>
        </CardTitle>
        </Card>
    );
}
