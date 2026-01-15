import { MakeAdminForm } from "@/components/admin/make-admin-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MakeAdminPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Make Admin</h1>
                <p className="text-muted-foreground">Grant administrative privileges to a user.</p>
            </div>
            <div className="max-w-xl">
                 <MakeAdminForm />
            </div>
        </div>
    )
}
