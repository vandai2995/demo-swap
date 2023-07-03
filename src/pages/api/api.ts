import * as anchor from "@project-serum/anchor"
import { DECIMAL, MOVE_TOKEN, sleep } from "utils/various";
import * as spl_token from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
export async function depositSol(
    swapProgram: anchor.Program<anchor.Idl>,
    walletKeypair: anchor.web3.Keypair,
    pool: anchor.web3.PublicKey,
    amount: number,) {
    const liquidityPoolPubkey = new anchor.web3.PublicKey(pool);
    const liquidityPoolAccount = Object(await swapProgram.account.liquidityPool.fetch(liquidityPoolPubkey));

    const amountToDeposit = new anchor.BN(amount * anchor.web3.LAMPORTS_PER_SOL);
    const tx = await swapProgram.methods.depositSol(amountToDeposit).accounts({
        authority: walletKeypair.publicKey,
        liquidityPool: liquidityPoolPubkey,
        solAccount: liquidityPoolAccount.solAccount,
        systemProgram: web3.SystemProgram.programId,
    }).signers([]).rpc(
        {
            commitment: "confirmed"
        }

    );

    const liquidityPoolAccountAfter = Object(await swapProgram.account.liquidityPool.fetch(liquidityPoolPubkey));
    const solReserve = liquidityPoolAccountAfter.solReserve.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
    return tx;
}


export async function depositMove(
    swapProgram: anchor.Program,
    walletKeypair: anchor.web3.Keypair,
    pool: anchor.web3.PublicKey,
    amount: number,) {

    const liquidityPoolPubkey = new anchor.web3.PublicKey(pool);
    const [poolAccountSigner, nonce] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("liquidity-pool"), liquidityPoolPubkey.toBuffer()],
        swapProgram.programId
    );

    let fromMoveTokenAccount;
    fromMoveTokenAccount = await spl_token.getAssociatedTokenAddress(
        MOVE_TOKEN,
        walletKeypair.publicKey,
        false
    )

    if (fromMoveTokenAccount === null) {
        fromMoveTokenAccount = await spl_token.createAssociatedTokenAccount(
            swapProgram.provider.connection,
            walletKeypair,
            MOVE_TOKEN,
            walletKeypair.publicKey,
        )
    }

    console.log("fromMoveTokenAccount: ", fromMoveTokenAccount.toBase58());

    const liquidityPoolAccount = Object(await swapProgram.account.liquidityPool.fetch(liquidityPoolPubkey));
    console.log("before: ", liquidityPoolAccount.moveTokenReserve.toNumber() / DECIMAL);
    const amountToDeposit = new anchor.BN(amount * DECIMAL);
    const tx = await swapProgram.methods.depositMove(amountToDeposit).accounts({
        liquidityPool: liquidityPoolPubkey,
        authority: walletKeypair.publicKey,
        moveTokenAccount: liquidityPoolAccount.moveTokenAccount,
        fromMove: fromMoveTokenAccount,
        poolSigner: poolAccountSigner,
        tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([]).rpc(
        {
            commitment: "confirmed"
        }
    );
    const liquidityPoolAccountAfter = Object(await swapProgram.account.liquidityPool.fetch(liquidityPoolPubkey));
    console.log("after: ", liquidityPoolAccountAfter.moveTokenReserve.toNumber() / DECIMAL);
    return tx

}

export async function swapMoveToSol(
    swapProgram: anchor.Program,
    walletKeypair: anchor.web3.Keypair,
    pool: anchor.web3.PublicKey,
    amount: number,) {
    let fromMoveTokenAccount;

    fromMoveTokenAccount = await spl_token.getAssociatedTokenAddress(
        MOVE_TOKEN,
        walletKeypair.publicKey,
        false
    )

    if (fromMoveTokenAccount === null) {
        fromMoveTokenAccount = await spl_token.createAssociatedTokenAccount(
            swapProgram.provider.connection,
            walletKeypair,
            MOVE_TOKEN,
            walletKeypair.publicKey,
        )
    }

    const liquidityPoolPubkey = new anchor.web3.PublicKey(pool);
    const liquidityPoolAccount = Object(await swapProgram.account.liquidityPool.fetch(liquidityPoolPubkey));
    const amountToSwap = new anchor.BN(amount * DECIMAL);
    const tx = await swapProgram.methods.swapMoveToSol(amountToSwap).accounts({
        liquidityPool: liquidityPoolPubkey,
        authority: walletKeypair.publicKey,
        solAccount: liquidityPoolAccount.solAccount,
        moveTokenAccount: liquidityPoolAccount.moveTokenAccount,
        fromMoveTokenAccount: fromMoveTokenAccount,
        destination: walletKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([]).rpc(
        {
            commitment: "confirmed"
        }
    );

    return tx;
}


export async function swapSolToMove(
    swapProgram: anchor.Program,
    walletKeypair: anchor.web3.Keypair,
    pool: anchor.web3.PublicKey,
    amount: number,) {


    const liquidityPoolPubkey = new anchor.web3.PublicKey(pool);

    const [poolAccountSigner, nonce] = anchor.web3.PublicKey.findProgramAddressSync(
        [liquidityPoolPubkey.toBuffer()],
        swapProgram.programId
    );

    let destinationMoveTokenAccount;

    destinationMoveTokenAccount = await spl_token.getAssociatedTokenAddress(
        MOVE_TOKEN,
        walletKeypair.publicKey,
        false
    )

    if (destinationMoveTokenAccount === null) {
        destinationMoveTokenAccount = await spl_token.createAssociatedTokenAccount(
            swapProgram.provider.connection,
            walletKeypair,
            MOVE_TOKEN,
            walletKeypair.publicKey,
        )
    }
    const liquidityPoolAccount = Object(await swapProgram.account.liquidityPool.fetch(liquidityPoolPubkey));
    const amountToSwap = new anchor.BN(amount * anchor.web3.LAMPORTS_PER_SOL);
    const tx = await swapProgram.methods.swapSolToMove(amountToSwap).accounts({
        liquidityPool: liquidityPoolPubkey,
        authority: walletKeypair.publicKey,
        solAccount: liquidityPoolAccount.solAccount,
        moveTokenAccount: liquidityPoolAccount.moveTokenAccount,
        destination: destinationMoveTokenAccount,
        poolSigner: poolAccountSigner,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([]).rpc(
        {
            commitment: "confirmed"
        }
    );
    return tx;
}