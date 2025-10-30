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

  // Helper function to check if PDA exists and is initialized
  const checkPDAExists = async (pda: PublicKey): Promise<boolean> => {
    if (!provider) return false;

    try {
      const accountInfo = await provider.connection.getAccountInfo(pda);
      if (!accountInfo) return false;

      // Check if account has data (is initialized)
      return accountInfo.data.length > 0;
    } catch (error) {
      console.error("Error checking PDA:", error);
      return false;
    }
  };

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

      const academyPDA = getAcademyPDA(provider.wallet.publicKey);

      // Check if academy already exists and is initialized
      const academyExists = await checkPDAExists(academyPDA);
      if (academyExists) {
        console.log("Academy already exists, skipping creation");
        return {
          tx: null,
          academyPDA,
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
          academy: academyPDA,
        })
        .transaction();

      transaction.add(createAcademyTx);

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Simulate transaction first to catch errors
      try {
        const simulation = await provider.connection.simulateTransaction(
          transaction
        );
        if (simulation.value.err) {
          throw new Error(
            `Transaction simulation failed: ${JSON.stringify(
              simulation.value.err
            )}`
          );
        }
      } catch (simulationError) {
        console.error("Transaction simulation failed:", simulationError);
        throw simulationError;
      }

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

      // Confirm transaction with proper commitment
      const confirmation = await provider.connection.confirmTransaction(
        {
          signature: txId,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      // Verify the academy was actually created
      const academyCreated = await checkPDAExists(academyPDA);
      if (!academyCreated) {
        throw new Error(
          "Academy creation verification failed - PDA not initialized"
        );
      }

      return {
        academyPDA,
        tx: txId,
      };
    },
    onSuccess: async (data) => {
      console.log("Academy created successfully:", data.academyPDA.toBase58());

      try {
        const response = await axiosAsync.post("/academies", {
          contractAddress: data.academyPDA.toBase58(), // Ensure we're sending string, not PublicKey
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
        } else {
          console.error("Backend academy creation failed:", dataResponse);
          toast.error("Academy created on blockchain but backend sync failed");
        }
      } catch (error) {
        console.error("Error syncing with backend:", error);
        toast.error("Academy created on blockchain but backend sync failed");
      }
    },
    onError: async (error: Error) => {
      console.error("Academy creation failed:", error);
      toast.error(`Academy creation failed: ${error.message}`);
    },
    retry: 2, // Add retry for transient failures
    retryDelay: 1000,
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

      const studentPDA = getStudentPDA(provider.wallet.publicKey);

      // Check if student already exists and is initialized
      const studentExists = await checkPDAExists(studentPDA);
      if (studentExists) {
        console.log("Student already exists, skipping creation");
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
          student: studentPDA,
        })
        .transaction();

      transaction.add(createStudentTx);

      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
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

      await provider.connection.confirmTransaction(
        {
          signature: txId,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

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
          contractAddress: pda.toBase58(), // Convert to string
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
        console.error("Error syncing student with backend:", error?.message);
      }
    },
    onError: async (error: any) => {
      console.error("Student creation failed:", error?.message);
      toast.error("Student creation failed");
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

      // Check if enrollment already exists
      const enrollmentExists = await checkPDAExists(enrollmentPDA);
      if (enrollmentExists) {
        throw new Error("You are already enrolled in this academy");
      }

      const transaction = new Transaction();
      const enrollStudentTx = await program.methods
        .enroll()
        .accountsPartial({
          config: getConfigPDA(),
          student: payload.studentPDA,
          academy: payload.academyPDA,
          enrollment: enrollmentPDA,
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

      await provider.connection.confirmTransaction(
        {
          signature: txId,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        },
        "confirmed"
      );

      return {
        tx: txId,
        enrollmentPDA,
        academyPDA: payload.academyPDA,
      };
    },
    onSuccess: async (data) => {
      try {
        const response = await axiosAsync.post("/students/enroll", {
          academyContract: data.academyPDA.toBase58(),
          contractAddress: data.enrollmentPDA.toBase58(),
        });

        const dataResponse = response.data;

        if (dataResponse.status) {
          // Invalidate relevant queries to refresh data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["enroll"] }),
            queryClient.invalidateQueries({ queryKey: ["academy"] }),
            queryClient.invalidateQueries({ queryKey: ["student"] }),
            queryClient.invalidateQueries({
              queryKey: ["enrollment", "check"],
            }),
            // Specifically invalidate the academy by PDA to refresh student count
            queryClient.invalidateQueries({
              queryKey: ["academy", "pda", data.academyPDA.toBase58()],
            }),
            // Invalidate all academies list
            queryClient.invalidateQueries({
              queryKey: ["academy", "all"],
            }),
          ]);
        }

        toast.success(
          `Student successfully enrolled to academy\nhttps://explorer.solana.com/tx/${data.tx}?cluster=devnet`
        );
      } catch (error) {
        console.error("Error syncing enrollment with backend:", error);
        toast.error("Enrollment successful but backend sync failed");
      }
    },
    onError: (error) => {
      console.error("Enrollment failed:", error);
      toast.error(error.message || "Enrollment failed");
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
      enabled: !!wallet && !!provider && !!program,
      staleTime: 1000 * 60,
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

  const getStudent = (pda: PublicKey) => {
    return useQuery({
      queryKey: ["student", pda.toBase58()],
      queryFn: async () => {
        if (!provider || !provider.wallet?.publicKey || !program) {
          throw new Error(
            "Wallet not connected. Please connect your wallet to use trading features."
          );
        }
        return await program.account.student.fetch(pda);
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

  const getEnrollment = (academyPDA: PublicKey, studentPDA: PublicKey) => {
    return useQuery({
      queryKey: ["enrollment", academyPDA.toBase58(), studentPDA.toBase58()],
      queryFn: async () => {
        if (!program) {
          throw new Error("Program not initialized");
        }

        const enrollmentPDA = getEnrollmentPDA(academyPDA, studentPDA);

        // Check if enrollment exists first
        const enrollmentExists = await checkPDAExists(enrollmentPDA);
        if (!enrollmentExists) {
          return null;
        }

        return await program.account.studentEnrollment.fetch(enrollmentPDA);
      },
      enabled: !!program && !!academyPDA && !!studentPDA,
      staleTime: 1000 * 60, // 1 minute cache
    });
  };

  const getIsStudentEnrolled = (
    academyPDA: PublicKey,
    studentPDA: PublicKey
  ) => {
    return useQuery({
      queryKey: [
        "enrollment",
        "check",
        academyPDA.toBase58(),
        studentPDA.toBase58(),
      ],
      queryFn: async (): Promise<boolean> => {
        if (!program) {
          throw new Error("Program not initialized");
        }

        const enrollmentPDA = getEnrollmentPDA(academyPDA, studentPDA);
        const enrollmentExists = await checkPDAExists(enrollmentPDA);

        return enrollmentExists;
      },
      enabled: !!program && !!academyPDA && !!studentPDA,
      staleTime: 1000 * 30, // 30 second cache for enrollment status
    });
  };

  const getStudentEnrollments = (studentPDA: PublicKey | null) => {
    return useQuery({
      queryKey: [
        "enrollments",
        "student",
        studentPDA?.toBase58() || "no-student",
      ],
      queryFn: async () => {
        if (!program) {
          throw new Error("Program not initialized");
        }

        if (!studentPDA) {
          throw new Error("StudentPDA not defined.");
        }

        try {
          return await program.account.studentEnrollment.all([
            {
              memcmp: {
                offset: 8 + 32, // Adjust based on your account structure
                bytes: studentPDA.toBase58(),
              },
            },
          ]);
        } catch (error) {
          console.error("Error fetching student enrollments:", error);
          throw new Error("Failed to fetch student enrollments");
        }
      },
      enabled: !!program && !!studentPDA,
      retry: 2,
      staleTime: 1000 * 30,
    });
  };

  const getAcademyEnrollments = (academyPDA: PublicKey) => {
    return useQuery({
      queryKey: ["enrollments", "academy", academyPDA.toBase58()],
      queryFn: async () => {
        if (!program) {
          throw new Error("Program not initialized");
        }

        return await program.account.studentEnrollment.all([
          {
            memcmp: {
              offset: 8, // Adjust based on your account structure
              bytes: academyPDA.toBase58(),
            },
          },
        ]);
      },
      enabled: !!program && !!academyPDA,
    });
  };

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
    getEnrollment,
    getIsStudentEnrolled,
    getStudentEnrollments,
    getAcademyEnrollments,
    enroll,
    getAcademy,
    getAcademyByPDA,
    getStudent,
    program,
    provider,
  };
};
