import { FC, useEffect, useState } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import * as anchor from "@project-serum/anchor";
import Swal from "sweetalert2";

import styles from "./index.module.css";
import { useProgram } from "./useProgram";
import { depositMove, depositSol, swapMoveToSol, swapSolToMove } from "pages/api/api";
import { DECIMAL, MOVE_TOKEN, POOL_PUBKEY, loadWalletKey, transferToken } from "utils/various";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";
// const endpoint = "https://explorer-api.devnet.solana.com";

const endpoint = "https://solana-devnet.g.alchemy.com/v2/jFn2wegh5B12OAmy9L8rQXs1qbvLV7R4";

const connection = new anchor.web3.Connection(endpoint, "confirmed");
export const HomeView: FC = ({ }) => {
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  const [amountAddSol, setAmountAddSol] = useState(undefined);
  const [amountAddMove, setAmountAddMove] = useState(undefined);
  const [amountSwapSol, setAmountSwapSol] = useState(undefined);
  const [amountSwapMove, setAmountSwapMove] = useState(undefined);
  // const [inputAddSolValue, setInputAddSolValue] = useState("");
  // const [inputSwapSolValue, setInputSwapSolValue] = useState(false);

  const [poolInfo, setPoolInfo] = useState({
    poolSol: 0,
    poolMove: 0,
  });

  const airdropToWallet = async () => {
    if (wallet) {
      Swal.fire({
        title: 'Do you want to airdrop 1 SOL to your wallet?',
        showCancelButton: true,
        confirmButtonText: 'Airdrop',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const signature = await connection.requestAirdrop(
              wallet.publicKey,
              1000000000
            );
            const tx = await connection.confirmTransaction(signature);
            console.log(tx);
          }
          catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `AirDropped!`,
          })
        }
      })

    }
  };

  const airdropMoveToWallet = async () => {
    if (wallet) {
      let txAirdrop: any;
      Swal.fire({
        title: 'Do you want to airdrop 100 MOVE to your wallet?',
        showCancelButton: true,
        confirmButtonText: 'Airdrop',
        showLoaderOnConfirm: true,
        preConfirm: async () => {

          try {
            const airdropWallet = loadWalletKey(process.env.NEXT_PUBLIC_AIRDROP_WALLET_KEY);
            txAirdrop = await transferToken(
              connection,
              airdropWallet,
              wallet.publicKey,
              100,
              MOVE_TOKEN
            )
            console.log(txAirdrop);
          }
          catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `AirDropped!`,
            text: `You have airdropped 100 MOVE to your wallet`,
            footer: `<a href="https://explorer.solana.com/tx/${txAirdrop}?cluster=devnet" style="text-decoration: underline; color: blue;">Click to view on Solana Explorer</a>`
          })
        }
      })

    }
  };




  const onAddSolChange = (e: any) => {
    const updatedValue = e.target.value;
    setAmountAddSol(updatedValue);
  }
  const onHandleAddSolClick = async () => {
    let addTx: any;
    if (wallet && program) {
      if (!amountAddSol) {
        Swal.fire({
          title: `Please enter amount SOL`,
        })
        return;
      }
      //verify input value is number
      if (isNaN(amountAddSol)) {
        Swal.fire({
          title: `Please enter a number`,
        })
        return;
      }

      Swal.fire({
        title: 'Do you want to deposit to liquidity pool?',
        showCancelButton: true,
        confirmButtonText: 'Add Liquidity',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            addTx = await depositSol(program, wallet, POOL_PUBKEY, amountAddSol);
            console.log("tx: ", addTx);
            const poolInfo: any = await program?.account.liquidityPool.fetch(POOL_PUBKEY);
            setPoolInfo({
              poolSol: (poolInfo.solReserve.toNumber()) / LAMPORTS_PER_SOL,
              poolMove: poolInfo.moveTokenReserve.toNumber() / DECIMAL
            })
          }
          catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `Added!`,
            text: `You have added ${amountAddSol} SOL to the pool`,
            footer: `<a href="https://explorer.solana.com/tx/${addTx}?cluster=devnet" style="text-decoration: underline; color: blue;">Click to view on Solana Explorer</a>`
          })
          setAmountAddSol(undefined);
        }
      })
    }
  };

  const onAddMoveChange = (e: any) => {
    setAmountAddMove(e.target.value);
  }
  const onHandleAddMoveClick = async () => {
    let addTx: any;
    if (wallet && program) {
      if (!amountAddMove) {
        Swal.fire({
          title: `Please enter amount MOVE`,
        })
        return;
      }

      if (isNaN(amountAddMove)) {
        Swal.fire({
          title: `Please enter a number`,
        })
        return;
      }
      Swal.fire({
        title: 'Do you want to deposit to liquidity pool?',
        showCancelButton: true,
        confirmButtonText: 'Add Liquidity',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            addTx = await depositMove(program, wallet, POOL_PUBKEY, amountAddMove);
            console.log("tx: ", addTx);
            const poolInfo: any = await program?.account.liquidityPool.fetch(POOL_PUBKEY);
            setPoolInfo({
              poolSol: (poolInfo.solReserve.toNumber()) / LAMPORTS_PER_SOL,
              poolMove: poolInfo.moveTokenReserve.toNumber() / DECIMAL
            })

          }
          catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `Added!`,
            text: `You have added ${amountAddMove} MOVE to the pool`,
            footer: `<a href="https://explorer.solana.com/tx/${addTx}?cluster=devnet" style="text-decoration: underline; color: blue;">Click to view on Solana Explorer</a>`
          })
          setAmountAddMove(undefined);
        }
      })
    }
  };

  const onSwapSolChange = (e: any) => {
    const inputValue = e.target.value;
    setAmountSwapSol(e.target.value);
    // setInputSwapSolValue(inputValue !== '');
  }
  const onHandleSwapSolClick = async () => {

    let addTx: any;
    if (wallet && program) {
      const poolInfo: any = await program.account.liquidityPool.fetch(POOL_PUBKEY);
      const poolMove = poolInfo.moveTokenReserve.toNumber() / DECIMAL;
      const poolSol = poolInfo.solReserve.toNumber() / LAMPORTS_PER_SOL;

      if (poolMove === 0) {
        Swal.fire({
          title: `Pool of MOVE is out of stock. Please add MOVE to the liquidity pool`,
        })
        return;
      }

      if (!amountSwapSol) {
        Swal.fire({
          title: `Please enter amount SOL`,
        })
        return;
      }
      if (isNaN(amountSwapSol)) {
        Swal.fire({
          title: `Please enter a number`,
        })
        return;
      }
      if (poolMove < amountSwapSol * 10) {
        Swal.fire({
          title: `Not enough MOVE in the pool`,
        })
        return;
      }

      Swal.fire({
        title: 'Do you want to SWAP SOL TO MOVE?',
        showCancelButton: true,
        confirmButtonText: 'SWAP',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            addTx = await swapSolToMove(program, wallet, POOL_PUBKEY, amountSwapSol);
            console.log("tx: ", addTx);
            const poolInfo: any = await program?.account.liquidityPool.fetch(POOL_PUBKEY);
            setPoolInfo({
              poolSol: (poolInfo.solReserve.toNumber()) / LAMPORTS_PER_SOL,
              poolMove: poolInfo.moveTokenReserve.toNumber() / DECIMAL
            })

          }
          catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `Swapped!`,
            text: `You have swapped ${amountSwapSol} SOL to MOVE`,
            footer: `<a href="https://explorer.solana.com/tx/${addTx}?cluster=devnet" style="text-decoration: underline; color: blue;">Click to view on Solana Explorer</a>`
          })
          setAmountSwapSol(undefined);
        }
      })
    }

  };

  const onSwapMoveChange = (e: any) => {
    setAmountSwapMove(e.target.value);
  }
  const onHandleSwapMoveClick = async () => {

    let addTx: any;
    if (wallet && program) {
      const poolInfo: any = await program.account.liquidityPool.fetch(POOL_PUBKEY);
      const poolSol = poolInfo.solReserve.toNumber() / LAMPORTS_PER_SOL;
      const poolMove = poolInfo.moveTokenReserve.toNumber() / DECIMAL;

      if (poolSol === 0) {
        Swal.fire({
          title: `Pool of SOL is out of stock. Please add SOL to the liquidity pool`,
        })
        return;
      }
      if (!amountSwapMove) {
        Swal.fire({
          title: `Please enter amount MOVE`,
        })
        return;
      }
      if (isNaN(amountSwapMove)) {
        Swal.fire({
          title: `Please enter a number`,
        })
        return;
      }
      if (poolSol < amountSwapMove / 10) {
        Swal.fire({
          title: `Not enough SOL in the pool`,
        })
        return;
      }

      Swal.fire({
        title: 'Do you want to SWAP MOVE TO SOL?',
        showCancelButton: true,
        confirmButtonText: 'SWAP',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            addTx = await swapMoveToSol(program, wallet, POOL_PUBKEY, amountSwapMove);
            console.log("tx: ", addTx);
            const poolInfo: any = await program?.account.liquidityPool.fetch(POOL_PUBKEY);
            setPoolInfo({
              poolSol: (poolInfo.solReserve.toNumber()) / LAMPORTS_PER_SOL,
              poolMove: poolInfo.moveTokenReserve.toNumber() / DECIMAL
            })

          }
          catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `Swapped!`,
            text: `You have swapped ${amountSwapMove} MOVE to SOL`,
            footer: `<a href="https://explorer.solana.com/tx/${addTx}?cluster=devnet" style="text-decoration: underline; color: blue;">Click to view on Solana Explorer</a>`
          })
          setAmountSwapMove(undefined);
        }
      })
    }
  };


  useEffect(() => {
    const getPoolInfo = async () => {
      if (!program) return;
      const poolInfo: any = await program?.account.liquidityPool.fetch(POOL_PUBKEY);
      setPoolInfo({
        poolSol: (poolInfo.solReserve.toNumber()) / LAMPORTS_PER_SOL,
        poolMove: poolInfo.moveTokenReserve.toNumber() / DECIMAL
      })
    }
    getPoolInfo();
  }, [program])


  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
          <div className="flex-none">
            <button className="btn btn-square btn-ghost">
              <span className="text-4xl">🦤</span>
            </button>
          </div>
          <div className="flex-1 px-2 mx-2">
            <span className="text-lg font-bold">Demo Swap</span>
          </div>
          <div className="flex-none">
            <WalletMultiButton className="btn btn-ghost" />
          </div>
        </div>
        <div className="flex mb-2 mt-8">
          <div className="mr-4">Need some SOL on test wallet?</div>
          <div className="mr-4">
            <button
              className="btn btn-primary normal-case btn-xs"
              onClick={airdropToWallet}
            >
              Airdrop 1 SOL
            </button>
          </div>
        </div>
        <div className="mb-8">
          <p className="text-xs">
            Due to the rate limitation of Solana Devnet, airdrop may fail at times.
          </p>
          <p className="text-xs">
            In such cases, you can use <a href="https://solfaucet.com/" style={{ textDecoration: "underline", color: "lightblue" }}>this</a> instead.
          </p>
        </div>

        <div className="flex mb-8">
          <div className="mr-4">Need some MOVE on test wallet?</div>
          <div className="mr-4">
            <button
              className="btn btn-primary normal-case btn-xs"
              onClick={airdropMoveToWallet}
            >
              Airdrop 100 MOVE
            </button>
          </div>
        </div>



        <div className="min-h-screen">
          {/* Swap form */}
          <div className="text-center pt-4">
            <h1 className="mb-5 text-5xl font-bold">
              <span className="text-5xl font-bold">Swap</span>
              <span className="text-5xl font-bold text-primary">.</span>
            </h1>
            <p className="mb-5">
              Swap MOVE Token on the Solana blockchain.
            </p>
          </div>

          <div className="flex justity-between border-2 border-primary rounded-box" style={{ height: '200px' }}>
            <div className="grid grid-flow-row w-full items-center">
              <div className="flex w-full">
                <span className="text-center w-full">Add Liquidity</span>
              </div>
              <div className="flex">
                <div className="h-full flex-col w-1/2 text-center flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-2">

                    <input
                      type="text"
                      placeholder="Enter amount SOL"
                      className="w-1/2 input input-borderedinput-lg bg-gray-100 text-black "
                      value={amountAddSol !== undefined ? amountAddSol : ''}
                      onChange={onAddSolChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleAddSolClick}

                    >ADD SOL</button>
                  </div>
                </div>
                <div className="h-full flex-col w-1/2 text-center flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-2">

                    <input
                      type="text"
                      placeholder="Enter amount Move"
                      className="w-1/2 input input-borderedinput-lg bg-gray-100 text-black"
                      value={amountAddMove !== undefined ? amountAddMove : ''}
                      onChange={onAddMoveChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleAddMoveClick}

                    >ADD MOVE</button>
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <div className="text-left flex flex-col ml-10 mb-4 mt-4 w-full">
                  <li>
                    <span className="text-white">Sol amount: {poolInfo.poolSol}</span>
                  </li>
                  <li>
                    <span className="text-white">Move amount: {poolInfo.poolMove}</span>
                  </li>
                </div>

              </div>
            </div>
          </div>

          {/* SWAP */}
          <br />
          <div className="flex justity-between border-2 border-primary rounded-box" style={{ height: '170px' }}>
            <div className="grid grid-flow-row w-full items-center">
              <div className="flex w-full">
                <span className="text-center w-full">SWAP</span>
              </div>
              <div className="flex">
                <div className="h-full flex-col w-1/2 text-center flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-2">

                    <input
                      type="text"
                      placeholder="Enter amount SOL"
                      className="w-1/2 input input-borderedinput-lg bg-gray-100 text-black "
                      value={amountSwapSol !== undefined ? amountSwapSol : ''}
                      onChange={onSwapSolChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleSwapSolClick}

                    >SWAP SOL</button>
                  </div>
                  <div className={`w-full h-full flex items-center justify-center p-2`}>
                    <span className={`text-left ml-10 w-full block`}>
                      You will receive: {amountSwapSol ? amountSwapSol * 10 : 0} MOVE
                    </span>
                  </div>
                </div>
                <div className="h-full flex-col w-1/2 text-center flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-2">

                    <input
                      type="text"
                      placeholder="Enter amount Move"
                      className="w-1/2 input input-borderedinput-lg bg-gray-100 text-black"
                      value={amountSwapMove !== undefined ? amountSwapMove : ''}
                      onChange={onSwapMoveChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleSwapMoveClick}

                    >SWAP MOVE</button>
                  </div>
                  <div className={`w-full h-full flex items-center justify-center p-2`}>
                    <span className={`text-left ml-10 w-full block`}>
                      You will receive: {amountSwapMove ? amountSwapMove / 10 : 0} SOL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8 mt-16">
            <p className="text-xs">
              Suppose the rate is constant at 1 SOL = 10 MOVE.
            </p>

          </div>
        </div>
      </div>

    </div>
  );
};
