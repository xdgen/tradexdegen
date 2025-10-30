import React, { useState } from "react";
import { useTrade } from "../../hooks/useTrade";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";

const AdminTrading: React.FC = () => {
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");

    // Wrap useTrade in try-catch to handle wallet connection errors
    let tradeHook;
    try {
        tradeHook = useTrade();
    } catch (error) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <Wallet className="h-5 w-5" />
                            Wallet Connection Required
                        </CardTitle>
                        <CardDescription>
                            Please connect your wallet to access trading admin functions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-600 mb-4">
                            {error instanceof Error ? error.message : "Wallet not connected"}
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            Retry Connection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { initialize, deposit, withdraw, delegateConfig } = tradeHook;

    const handleInitialize = async () => {
        try {
            await initialize.mutateAsync();
        } catch (error) {
            console.error("Initialize error:", error);
        }
    };

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid deposit amount");
            return;
        }

        try {
            await deposit.mutateAsync(amount);
            setDepositAmount("");
        } catch (error) {
            console.error("Deposit error:", error);
        }
    };

    const handleDelegation = async () => {
        try {
            await delegateConfig.mutateAsync();
        } catch (error) {
            console.error('Delegation error:', error)
        }
    }

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid withdraw amount");
            return;
        }

        try {
            await withdraw.mutateAsync(amount);
            setWithdrawAmount("");
        } catch (error) {
            console.error("Withdraw error:", error);
        }
    };

    const getStatusIcon = (mutation: any) => {
        if (mutation.isPending) return <Loader2 className="h-4 w-4 animate-spin" />;
        if (mutation.isSuccess) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (mutation.isError) return <XCircle className="h-4 w-4 text-red-500" />;
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    };

    const getStatusBadge = (mutation: any) => {
        if (mutation.isPending) return <Badge variant="secondary">Processing...</Badge>;
        if (mutation.isSuccess) return <Badge variant="default" className="bg-green-500">Success</Badge>;
        if (mutation.isError) return <Badge variant="destructive">Error</Badge>;
        return <Badge variant="outline">Ready</Badge>;
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Admin Panel</h1>
                <p className="text-gray-600">Manage trading contract initialization, deposits, and withdrawals</p>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {/* Initialize Card */}
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Initialize Contract
                            {getStatusIcon(initialize)}
                        </CardTitle>
                        <CardDescription>
                            Set up the trading contract with initial configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                This will initialize the trading contract with the Xdegen mint and create the necessary accounts.
                            </div>
                            <Button
                                onClick={handleInitialize}
                                disabled={initialize.isPending}
                                className="w-full"
                            >
                                {initialize.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Initializing...
                                    </>
                                ) : (
                                    "Initialize Contract"
                                )}
                            </Button>
                            {initialize.isSuccess && (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Contract initialized successfully
                                </div>
                            )}
                            {initialize.isError && (
                                <div className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" />
                                    {initialize.error?.message || "Initialization failed"}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Delegate Config
                        </CardTitle>
                        <CardDescription>
                            Deposit to ER
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleDelegation}
                            disabled={delegateConfig.isPending}
                            className="w-full"
                        >
                            {delegateConfig.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Delegating...
                                </>
                            ) : (
                                "Deposit Tokens"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Deposit Card */}
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Deposit Tokens
                            {getStatusIcon(deposit)}
                        </CardTitle>
                        <CardDescription>
                            Deposit Xdegen tokens into the trading vault
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="deposit-amount">Amount (Xdegen)</Label>
                                <Input
                                    id="deposit-amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter amount to deposit"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    disabled={deposit.isPending}
                                />
                            </div>
                            <Button
                                onClick={handleDeposit}
                                disabled={deposit.isPending || !depositAmount}
                                className="w-full"
                            >
                                {deposit.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Depositing...
                                    </>
                                ) : (
                                    "Deposit Tokens"
                                )}
                            </Button>
                            {deposit.isSuccess && (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Tokens deposited successfully
                                </div>
                            )}
                            {deposit.isError && (
                                <div className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" />
                                    {deposit.error?.message || "Deposit failed"}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Withdraw Card */}
                <Card className="xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Withdraw Tokens
                            {getStatusIcon(withdraw)}
                        </CardTitle>
                        <CardDescription>
                            Withdraw Xdegen tokens from the trading vault
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="withdraw-amount">Amount (Xdegen)</Label>
                                <Input
                                    id="withdraw-amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter amount to withdraw"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    disabled={withdraw.isPending}
                                />
                            </div>
                            <Button
                                onClick={handleWithdraw}
                                disabled={withdraw.isPending || !withdrawAmount}
                                className="w-full"
                                variant="outline"
                            >
                                {withdraw.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Withdrawing...
                                    </>
                                ) : (
                                    "Withdraw Tokens"
                                )}
                            </Button>
                            {withdraw.isSuccess && (
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Tokens withdrawn successfully
                                </div>
                            )}
                            {withdraw.isError && (
                                <div className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" />
                                    {withdraw.error?.message || "Withdrawal failed"}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Overview */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Operation Status</CardTitle>
                    <CardDescription>Current status of all trading operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Initialize</span>
                            {getStatusBadge(initialize)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Deposit</span>
                            {getStatusBadge(deposit)}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Withdraw</span>
                            {getStatusBadge(withdraw)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminTrading;