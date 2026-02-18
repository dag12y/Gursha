import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { verifyEmail, resendVerificationEmail } from "@/api/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmailPage() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const initialEmail = params.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [resending, setResending] = useState(false);

    const canAutoVerify = useMemo(
        () => Boolean(token && initialEmail),
        [token, initialEmail],
    );

    useEffect(() => {
        async function runVerification() {
            if (!canAutoVerify) {
                return;
            }

            setVerifying(true);
            try {
                await verifyEmail(initialEmail, token);
                setVerified(true);
                toast.success("Email verified successfully");
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to verify email";
                toast.error(message);
            } finally {
                setVerifying(false);
            }
        }

        runVerification();
    }, [canAutoVerify, initialEmail, token]);

    async function handleResend(event) {
        event.preventDefault();

        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setResending(true);
        try {
            await resendVerificationEmail(email);
            toast.success("Verification email sent");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to resend verification email";
            toast.error(message);
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Verify Email</CardTitle>
                    <CardDescription>
                        {verified
                            ? "Your email is verified. You can login now."
                            : "Open the verification link from your inbox or resend one below."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {verifying ? (
                        <p className="text-sm text-muted-foreground">Verifying email...</p>
                    ) : null}

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
                        <Button type="submit" variant="outline" disabled={resending}>
                            {resending ? "Sending..." : "Resend verification email"}
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
