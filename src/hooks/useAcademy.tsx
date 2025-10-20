import { useMemo } from "react";
import { useAnchor } from "./useAnchor";
import { Program, BN } from "@coral-xyz/anchor";
import AcademyIDL from "../lib/contracts/academy/academy.json"
import type { XdegenAcademy as XdegenAcademyType } from "@/lib/contracts/academy/academy";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export type Plan = { free: {} } | { paid: {} };

interface CreateAcademy {
    title: string;
    description: string;
    banner: string;
    plan: Plan;
    fee?: number | null;
    startDate: number;
    endDate: number;
    tutors: string[]
}

interface CreateStudent {
    twitterHandle: string;
}

interface Enroll {
    studentPDA: PublicKey,
    academyPDA: PublicKey
}

export const useAcademy = () => {
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

    const createAcademy = useMutation({
        mutationKey: ["academy", "create"],
        mutationFn: async (payload: CreateAcademy) => {
            const academyData = {
                ...payload,
                owner: provider.wallet.publicKey,
                startDate: new BN(payload.startDate),
                endDate: new BN(payload.endDate),
                fee: payload.fee ? new BN(payload.fee * LAMPORTS_PER_SOL) : null
            };

            return await program.methods.createAcademy(academyData).accountsPartial({
                signer: provider.wallet.publicKey,
                config: getConfigPDA(),
                academy: getAcademyPDA(provider.wallet.publicKey)
            }).rpc();
        },
        onSuccess: async (tx) => {
            const pda = getAcademyPDA(provider.wallet.publicKey); // the contract address to supply to API
            console.log(pda)
            toast.success(`Academy created successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }
    });

    const getAllAcademies = useQuery({
        queryKey: ["academy", "all"],
        queryFn: async () => {
            return await program.account.academy.all();
        }
    });

    const createStudent = useMutation({
        mutationKey: ['student', 'create'],
        mutationFn: async (payload: CreateStudent) => {
            return await program.methods.createStudent(payload.twitterHandle)
            .accountsPartial({
                config: getConfigPDA(),
                student: getStudentPDA(provider.wallet.publicKey)
            }).rpc();
        },
        onSuccess: async (tx) => {
            const pda = getStudentPDA(provider.wallet.publicKey); // the contract address to supply to API
            console.log(pda)
            toast.success(`Student created successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }
    })

    const enroll = useMutation({
        mutationFn: async (payload: Enroll) => {
            const enrollmentPDA = getEnrollmentPDA(payload.academyPDA, payload.studentPDA);
            const tx = await program.methods.enroll()
            .accountsPartial({
                config: getConfigPDA(),
                student: payload.studentPDA,
                academy: payload.academyPDA,
                enrollment: getEnrollmentPDA(payload.academyPDA, payload.studentPDA)
            }).rpc();
            return {
                tx,
                enrollmentPDA
            }
        },
        onSuccess: async (data) => {
            const pda = data.enrollmentPDA; // the contract address to supply to API
            console.log(pda)
            toast.success(`Student created successfully\nhttps://explorer.solana.com/tx/${data.tx}?cluster=devnet`);
        }
    })

    const getEnrollmentPDA = (academy: PublicKey, student: PublicKey) => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("enrollment"),
                academy.toBuffer(),
                student.toBuffer()
            ],
            programId
        )[0]
    }

    const getAcademy = (wallet: PublicKey) => {
        return useQuery({
            queryKey: ["academy", wallet.toBase58()],
            queryFn: async () => {
                const academyPDA = getAcademyPDA(provider.wallet.publicKey);
                return await program.account.academy.fetch(academyPDA);
            }
        });
    };

    const getStudent = (wallet: PublicKey) => {
        return useQuery({
            queryKey: ["student", wallet.toBase58()],
            queryFn: async () => {
                const studentPDA = getStudentPDA(provider.wallet.publicKey);
                return await program.account.student.fetch(studentPDA);
            }
        })
    }

    const getStudentPDA = (wallet: PublicKey) => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("student"), 
                wallet.toBuffer()
            ],
            programId
        )[0]
    }

    function getAcademyPDA(owner: PublicKey) {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("academy"),
                owner.toBuffer()
            ],
            programId
        )[0]
    }

    function getConfigPDA() {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        )[0]
    }
    
    return {
        initialize,
        createAcademy,
        getAcademyPDA,
        getEnrollmentPDA,
        getStudentPDA,
        getAllAcademies,
        createStudent,
        enroll,
        getAcademy,
        getStudent
    }
}