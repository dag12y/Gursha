import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmailSentPage() {
    const [params] = useSearchParams();
    const [email, setEmail] = useState(params.get("email") || "");
    const [submitting, setSubmitting] = useState(false);

    async function handleResend(event) {
        event.preventDefault();

        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setSubmitting(true);
        try {
            await resendVerificationEmail(email);
            toast.success("Verification email sent");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to resend verification email";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Check Your Email</CardTitle>
                    <CardDescription>
                        We sent a verification link to your inbox. Verify your email before logging in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleResend} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" variant="outline" disabled={submitting}>
                            {submitting ? "Sending..." : "Resend verification email"}
                        </Button>
                    </form>

                    <Link to="/login" className="text-sm text-primary hover:underline">
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
