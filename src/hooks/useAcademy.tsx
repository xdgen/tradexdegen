import { useAnchor } from "./useAnchor";
import { Program, BN } from "@coral-xyz/anchor";
import AcademyIDL from "../lib/contracts/academy/academy.json";
import type { XdegenAcademy as XdegenAcademyType } from "@/lib/contracts/academy/academy";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
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

      // const academyData = {
      //   ...payload,
      //   owner: provider.wallet.publicKey,
      //   startDate: new BN(payload.startDate),
      //   endDate: new BN(payload.endDate),
      //   fee: payload.fee ? new BN(payload.fee * LAMPORTS_PER_SOL) : null,
      // };

      // const tx = await program.methods
      //   .createAcademy(academyData)
      //   .accountsPartial({
      //     signer: provider.wallet.publicKey,
      //     config: getConfigPDA(),
      //     academy: getAcademyPDA(provider.wallet.publicKey),
      //   })
      //   .rpc();

      return {
        academyPDA: getAcademyPDA(provider.wallet.publicKey),
        tx: "random",
      };
    },
    onSuccess: async (data) => {
      console.log(data.academyPDA);

      const response = await axiosAsync.post("/academies", {
        contractAddress: data.academyPDA,
      });
      const dataResponse = response.data as AcademyResponse<Academy>;

      if (dataResponse.status) {
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

      return await program.methods
        .createStudent(payload.twitterHandle)
        .accountsPartial({
          config: getConfigPDA(),
          student: getStudentPDA(provider.wallet.publicKey),
        })
        .rpc();
    },
    onSuccess: async (tx) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const pda = getStudentPDA(provider.wallet.publicKey); // the contract address to supply to API
      console.log(pda);
      toast.success(
        `Student created successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
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
      const tx = await program.methods
        .enroll()
        .accountsPartial({
          config: getConfigPDA(),
          student: payload.studentPDA,
          academy: payload.academyPDA,
          enrollment: getEnrollmentPDA(payload.academyPDA, payload.studentPDA),
        })
        .rpc();
      return {
        tx,
        enrollmentPDA,
      };
    },
    onSuccess: async (data) => {
      const pda = data.enrollmentPDA; // the contract address to supply to API
      console.log(pda);

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

  const getAcademy = (wallet: PublicKey) => {
    return useQuery({
      queryKey: ["academy", wallet.toBase58()],
      queryFn: async () => {
        if (!provider || !provider.wallet?.publicKey || !program) {
          throw new Error(
            "Wallet not connected. Please connect your wallet to use trading features."
          );
        }

        const academyPDA = getAcademyPDA(provider.wallet.publicKey);
        return await program.account.academy.fetch(academyPDA);
      },
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
