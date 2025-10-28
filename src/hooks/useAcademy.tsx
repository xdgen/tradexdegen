import { useAnchor } from "./useAnchor";
import { Program, BN } from "@coral-xyz/anchor";
import AcademyIDL from "../lib/contracts/academy/academy.json";
import type { XdegenAcademy as XdegenAcademyType } from "@/lib/contracts/academy/academy";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { axiosAsync } from "../lib/axios";

export type Plan = { free: {} } | { paid: {} };

interface CreateAcademy {
  title: string;
  description: string;
  banner: string;
  plan: Plan;
  fee?: number | null;
  startDate: number;
  endDate: number;
  tutors: string[];
}

interface CreateStudent {
  twitterHandle: string;
}

interface Enroll {
  studentPDA: PublicKey;
  academyPDA: PublicKey;
}

export const useAcademy = () => {
  const provider = useAnchor();
  const queryClient = useQueryClient();
  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(
      AcademyIDL as XdegenAcademyType,
      provider
    ) as Program<XdegenAcademyType>;
  }, [provider]);
  const programId = new PublicKey(AcademyIDL.address);

  const initialize = useMutation({
    mutationKey: ["initialize"],
    mutationFn: async () => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      return await program.methods
        .initialize(provider.wallet.publicKey)
        .accounts({
          signer: provider.wallet.publicKey,
        })
        .rpc();
    },
    onSuccess: async (tx) => {
      toast.success(
        `Academy created successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
  });

  const createAcademy = useMutation({
    mutationKey: ["academy", "create"],
    mutationFn: async (payload: CreateAcademy) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const pdaInfo = await provider.connection.getAccountInfo(
        getAcademyPDA(provider.wallet.publicKey)
      );
      if (pdaInfo) {
        return {
          tx: null,
          academyPDA: getAcademyPDA(provider.wallet.publicKey),
        };
      }

      const academyData = {
        ...payload,
        owner: provider.wallet.publicKey,
        startDate: new BN(payload.startDate),
        endDate: new BN(payload.endDate),
        fee: payload.fee ? new BN(payload.fee * LAMPORTS_PER_SOL) : null,
      };

      const transaction = new Transaction();
      const createAcademyTx = await program.methods
        .createAcademy(academyData)
        .accountsPartial({
          signer: provider.wallet.publicKey,
          config: getConfigPDA(),
          academy: getAcademyPDA(provider.wallet.publicKey),
        })
        .transaction();

      transaction.add(createAcademyTx);
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await provider.connection.confirmTransaction(txId);

      return {
        academyPDA: getAcademyPDA(provider.wallet.publicKey),
        tx: txId,
      };
    },
    onSuccess: async (data) => {
      console.log(data.academyPDA);

      const response = await axiosAsync.post("/academies", {
        contractAddress: data.academyPDA,
      });
      const dataResponse = response.data;

      if (dataResponse?.status) {
        // Invalidate and refetch all academies to show the new one
        await queryClient.invalidateQueries({ queryKey: ["academy"] });
        toast.success(
          `Academy created successfully\nhttps://explorer.solana.com/tx/${data.tx}?cluster=devnet`
        );

        localStorage.setItem(
          `academy:${dataResponse.data.userId}`,
          JSON.stringify(true)
        );
      }
    },
  });

  const getAllAcademies = useQuery({
    queryKey: ["academy", "all"],
    queryFn: async () => {
      if (!program) {
        throw new Error("Program not initialized");
      }
      return await program.account.academy.all();
    },
    enabled: !!program,
  });

  const createStudent = useMutation({
    mutationKey: ["student", "create"],
    mutationFn: async (payload: CreateStudent) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const pdaInfo = await provider.connection.getAccountInfo(
        getStudentPDA(provider.wallet.publicKey)
      );
      if (pdaInfo) {
        return {
          tx: null,
          twitter: payload.twitterHandle,
        };
      }

      const transaction = new Transaction();
      const createStudentTx = await program.methods
        .createStudent(payload.twitterHandle)
        .accountsPartial({
          config: getConfigPDA(),
          student: getStudentPDA(provider.wallet.publicKey),
        })
        .transaction();

      transaction.add(createStudentTx);
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await provider.connection.confirmTransaction(txId);

      return {
        tx: txId,
        twitter: payload.twitterHandle,
      };
    },
    onSuccess: async (data) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const pda = getStudentPDA(provider.wallet.publicKey);
      try {
        const response = await axiosAsync.post("/students", {
          twitterHandle: data.twitter,
          contractAddress: pda,
        });

        const dataResponse = response.data;
        if (dataResponse.status) {
          await queryClient.invalidateQueries({
            queryKey: ["student", "create"],
          });
          toast.success(
            `Student created successfully\nhttps://explorer.solana.com/tx/${data.tx}?cluster=devnet`
          );
        }
      } catch (error: any) {
        console.log(error?.message);
      }
    },
    onError: async (error: any) => {
      console.log(error?.message);
      console.log("Error registering user", error);
    },
  });

  const enroll = useMutation({
    mutationKey: ["enroll"],
    mutationFn: async (payload: Enroll) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const enrollmentPDA = getEnrollmentPDA(
        payload.academyPDA,
        payload.studentPDA
      );

      const pdaInfo = await provider.connection.getAccountInfo(enrollmentPDA);
      if (pdaInfo) {
        return {
          tx: null,
          enrollmentPDA,
          academyPDA: payload.academyPDA,
        };
      }

      const transaction = new Transaction();
      const enrollStudentTx = await program.methods
        .enroll()
        .accountsPartial({
          config: getConfigPDA(),
          student: payload.studentPDA,
          academy: payload.academyPDA,
          enrollment: getEnrollmentPDA(payload.academyPDA, payload.studentPDA),
        })
        .transaction();

      transaction.add(enrollStudentTx);
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );
      await provider.connection.confirmTransaction({
        signature: txId,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      });

      return {
        tx: txId,
        enrollmentPDA,
        academyPDA: payload.academyPDA,
      };
    },
    onSuccess: async (data) => {
      const enrollmentPDA = data.enrollmentPDA;
      const academyPDA = data.academyPDA;

      const response = await axiosAsync.post("/students/enroll", {
        academyContract: academyPDA,
        contractAddress: enrollmentPDA,
      });

      const dataResponse = response.data as APIResponse<any>;

      if (dataResponse.status) {
        // Invalidate and refetch all academies to show the new one
        await queryClient.invalidateQueries({ queryKey: ["enroll"] });
        toast.success(
          `Student successfully enrolled to academy \nhttps://explorer.solana.com/tx/${data.tx}?cluster=devnet`
        );
      }

      // Invalidate and refetch all academies to update student counts
      await queryClient.invalidateQueries({ queryKey: ["enroll"] });
      await queryClient.invalidateQueries({ queryKey: ["academy"] });
      await queryClient.invalidateQueries({ queryKey: ["student"] });

      toast.success(
        `Enrollment successful\nhttps://explorer.solana.com/tx/${data.tx}?cluster=devnet`
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const getEnrollmentPDA = (academy: PublicKey, student: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("enrollment"), academy.toBuffer(), student.toBuffer()],
      programId
    )[0];
  };

  const getAcademy = (wallet: PublicKey | undefined) => {
    return useQuery({
      queryKey: ["academy", wallet?.toBase58() ?? "no-wallet"],
      queryFn: async () => {
        if (!wallet || !provider || !provider.wallet?.publicKey || !program) {
          throw new Error(
            "Wallet not connected. Please connect your wallet to use trading features."
          );
        }

        const academyPDA = getAcademyPDA(provider.wallet.publicKey);
        return await program.account.academy.fetch(academyPDA);
      },
      enabled: !!wallet && !!provider && !!program, // 🧠 only fetch when ready
      staleTime: 1000 * 60, // optional: 1 minute caching
    });
  };

  const getAcademyByPDA = (academyPDA: PublicKey) => {
    return useQuery({
      queryKey: ["academy", "pda", academyPDA.toBase58()],
      queryFn: async () => {
        if (!program) {
          throw new Error("Program not initialized");
        }

        return await program.account.academy.fetch(academyPDA);
      },
      enabled: !!program,
    });
  };

  const getStudent = (wallet: PublicKey) => {
    return useQuery({
      queryKey: ["student", wallet.toBase58()],
      queryFn: async () => {
        if (!provider || !provider.wallet?.publicKey || !program) {
          throw new Error(
            "Wallet not connected. Please connect your wallet to use trading features."
          );
        }

        const studentPDA = getStudentPDA(provider.wallet.publicKey);
        return await program.account.student.fetch(studentPDA);
      },
    });
  };

  const getStudentPDA = (wallet: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("student"), wallet.toBuffer()],
      programId
    )[0];
  };

  function getAcademyPDA(owner: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("academy"), owner.toBuffer()],
      programId
    )[0];
  }

  function getConfigPDA() {
    if (!program) {
      throw new Error(
        "Wallet not connected. Please connect your wallet to use trading features."
      );
    }

    return PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    )[0];
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
    getAcademyByPDA,
    getStudent,
  };
};
