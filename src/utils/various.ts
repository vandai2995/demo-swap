import * as anchor from '@project-serum/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import dotenv from 'dotenv';
dotenv.config();


export const SWAP_PROGRAM_ID = new anchor.web3.PublicKey(process.env.NEXT_PUBLIC_SWAP_PROGRAM_ID as string);
export const POOL_PUBKEY = new anchor.web3.PublicKey(process.env.NEXT_PUBLIC_POOL_PUBKEY as string);
export const MOVE_TOKEN = new anchor.web3.PublicKey(process.env.NEXT_PUBLIC_MOVE_TOKEN as string);
export const DECIMAL = 1000000000;
export function loadWalletKey(secret: any): anchor.web3.Keypair {

    const loaded = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(secret)),
    );
    return loaded;
}

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transferSolana(connection: anchor.web3.Connection, from: anchor.web3.Keypair, sto: anchor.web3.PublicKey, amount: number) {
    const transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: sto,
            lamports: amount * LAMPORTS_PER_SOL,
        }),
    );
    const signature = await anchor.web3.sendAndConfirmTransaction(
        //@ts-ignore
        connection,
        transaction,
        [from],
        {
            commitment: 'processed',
        },
    );
    return signature;
}

export async function transferToken(connection: anchor.web3.Connection, from: anchor.web3.Keypair, to: anchor.web3.PublicKey, amount: number, mint: anchor.web3.PublicKey) {
    let fromTokenAccount;
    fromTokenAccount = await splToken.getAssociatedTokenAddress(
        mint,
        from.publicKey,
    );

    if (!fromTokenAccount) {
        fromTokenAccount = await splToken.createAssociatedTokenAccount(
            connection,
            from,
            mint,
            from.publicKey,
        )
    }
    let toTokenAccount;
    toTokenAccount = await splToken.getAssociatedTokenAddress(
        mint,
        to,
    );

    if (!toTokenAccount) {
        toTokenAccount = await splToken.createAssociatedTokenAccount(
            connection,
            from,
            mint,
            to,
        )
    }
    if (fromTokenAccount && toTokenAccount) {
        const transaction = new anchor.web3.Transaction().add(
            splToken.createTransferInstruction(
                fromTokenAccount,
                toTokenAccount,
                from.publicKey,
                amount * DECIMAL,
                [],
            ),
        );

        const signature = await anchor.web3.sendAndConfirmTransaction(
            //@ts-ignore
            connection,
            transaction,
            [from],
            {
                commitment: 'processed',
            },
        );

        return signature;
    } else
        throw new Error('Something went wrong!');

}