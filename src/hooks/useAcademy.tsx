import { useMemo } from "react";
import { useAnchor } from "./useAnchor";
import { Program } from "@coral-xyz/anchor";
import AcademyIDL from "../lib/contracts/academy/academy.json"
import type { XdegenAcademy as XdegenAcademyType } from "@/lib/contracts/academy/academy";
import { PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";


interface Tutor {
    name: string;
    email: string;
    bio: string;
    expertise: string;
}

type Plan = { free: {} } | { paid: {} };

interface CreateAcademy {
    title: string;
    description: string;
    banner: string;
    plan: Plan;
    fee: number;
    startDate: number;
    endDate: number;
    tutors: Tutor[]
}

export const useAcademy = () => {
    const provider = useAnchor();
    const program  = useMemo(() => new Program(
        AcademyIDL as XdegenAcademyType, provider
    ) as Program<XdegenAcademyType> , [provider])
    const programId = useMemo(() => new PublicKey(AcademyIDL.address), [])

    const createAcademy = useMutation({
        mutationKey: ["academy", "create"],
        mutationFn: async (payload: CreateAcademy) => {
            const academyId = `academy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return await program.methods.createAcademy(
                academyId,
                { ...payload, owner: provider.wallet.publicKey }
            ).accountsPartial({
                signer: provider.wallet.publicKey,
                academy: getAcademyPDA(academyId, provider.wallet.publicKey)
            }).rpc();
        },
        onSuccess: async (data) => {
            console.log("Academy created successfully:", data);
        }
    });

    const getAllAcademies = useQuery({
        queryKey: ["academy", "all"],
        queryFn: async () => {
            return await program.account.academy.all();
        }
    });

    const getAcademy = (academyId: string) => {
        return useQuery({
            queryKey: ["academy", "detail", academyId],
            queryFn: async () => {
                const academyPDA = getAcademyPDA(academyId, provider.wallet.publicKey);
                return await program.account.academy.fetch(academyPDA);
            },
            enabled: !!academyId
        });
    };

    function getAcademyPDA(academyId: string, owner: PublicKey) {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("academy"),
                owner.toBuffer(),
                Buffer.from(academyId)
            ],
            programId
        )[0]
    }
    
    return {
        createAcademy,
        getAcademyPDA,
        getAllAcademies,
        getAcademy
    }
}