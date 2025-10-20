import { useMemo } from "react";
import { useAnchor } from "./useAnchor";
import { Program, BN } from "@coral-xyz/anchor";
import AcademyIDL from "../lib/contracts/academy/academy.json"
import type { XdegenAcademy as XdegenAcademyType } from "@/lib/contracts/academy/academy";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTrade = () => {
    const provider = useAnchor();
    const program  = useMemo(() => new Program(
        AcademyIDL as XdegenAcademyType, provider
    ) as Program<XdegenAcademyType> , [provider])
    const programId = useMemo(() => new PublicKey(AcademyIDL.address), [])

    const initialize = useMutation({
        mutationKey: ["initialize"],
        mutationFn: async () => {
            await program.methods.initialize(provider.wallet.publicKey)
            .accounts({
                signer: provider.wallet.publicKey,
            }).rpc();
        }
    })

    const claim = useMutation({
        mutationKey: ["claim", provider.wallet.publicKey.toBase58()],
        // mutationFn: async (payload: CreateAcademy) => {
        //     const academyData = {
        //         ...payload,
        //         owner: provider.wallet.publicKey,
        //         startDate: new BN(payload.startDate),
        //         endDate: new BN(payload.endDate),
        //         fee: payload.fee ? new BN(payload.fee * LAMPORTS_PER_SOL) : null
        //     };

        //     return await program.methods.createAcademy(academyData).accountsPartial({
        //         signer: provider.wallet.publicKey,
        //         config: getConfigPDA(),
        //         academy: getAcademyPDA(provider.wallet.publicKey)
        //     }).rpc();
        // },
        // onSuccess: async (tx) => {
        //     const pda = getAcademyPDA(provider.wallet.publicKey); // the contract address to supply to API
        //     console.log(pda)
        //     toast.success(`Academy created successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        // }
    });
}