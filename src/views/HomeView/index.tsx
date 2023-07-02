import { FC, useState } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import * as anchor from "@project-serum/anchor";
import Swal from "sweetalert2";

import styles from "./index.module.css";
import { useProgram } from "./useProgram";
import { depositMove, depositSol, swapMoveToSol, swapSolToMove } from "pages/api/api";
import { POOL_PUBKEY } from "utils/various";
// const endpoint = "https://explorer-api.devnet.solana.com";

const endpoint = "https://solana-devnet.g.alchemy.com/v2/jFn2wegh5B12OAmy9L8rQXs1qbvLV7R4";

const connection = new anchor.web3.Connection(endpoint, "confirmed");
export const HomeView: FC = ({ }) => {
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });

  const airdropToWallet = async () => {
    if (wallet) {
      Swal.fire({
        title: 'Do you want to airdrop 1 SOL to your wallet?',
        showCancelButton: true,
        confirmButtonText: 'Airdrop',
        showLoaderOnConfirm: true,
        preConfirm: async () => {

          try {

            // const signature = await connection.requestAirdrop(
            //   wallet.publicKey,
            //   1000000000
            // );
            // const tx = await connection.confirmTransaction(signature);
            // console.log(tx);
            console.log("test")
            setTimeout(() => {
              console.log("OK")
            }, 3000)
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




  const [amountAddSol, setAmountAddSol] = useState(0);
  const [amountAddMove, setAmountAddMove] = useState(0);
  const [inputAddSolValue, setInputAddSolValue] = useState("");

  const [amountSwapSol, setAmountSwapSol] = useState(0);
  const [amountSwapMove, setAmountSwapMove] = useState(0);




  const onAddSolChange = (e: any) => {
    const updatedValue = e.target.value;
    setAmountAddSol(updatedValue);
    // setInputValue(updatedValue)
    try {
      //test log after 1 second
      setTimeout(() => {
        setInputAddSolValue(updatedValue)
      }, 1000)
    }
    catch (e) {
      console.log(e)
    }
  }
  const onHandleAddSolClick = async () => {
    let addTx: any;
    if (wallet && program) {
      if (amountAddSol == 0) {
        Swal.fire({
          title: `Please enter amount SOL`,
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
        }
      })
    }
    setAmountAddSol(0);
  };

  const onAddMoveChange = (e: any) => {
    setAmountAddMove(e.target.value);
  }
  const onHandleAddMoveClick = async () => {
    let addTx: any;
    if (wallet && program) {
      if (amountAddMove == 0) {
        Swal.fire({
          title: `Please enter amount MOVE`,
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
            text: `You have added ${amountAddMove} SOL to the pool`,
            footer: `<a href="https://explorer.solana.com/tx/${addTx}?cluster=devnet" style="text-decoration: underline; color: blue;">Click to view on Solana Explorer</a>`
          })
        }
      })
    }
    setAmountAddMove(0);
  };

  const onSwapSolChange = (e: any) => {
    setAmountSwapSol(e.target.value);
  }
  const onHandleSwapSolClick = () => {

    let addTx: any;
    if (wallet && program) {
      if (amountSwapSol == 0) {
        Swal.fire({
          title: `Please enter amount SOL`,
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
        }
      })
    }

    setAmountSwapSol(0);
  };

  const onSwapMoveChange = (e: any) => {
    setAmountSwapMove(e.target.value);
  }
  const onHandleSwapMoveClick = () => {

    let addTx: any;
    if (wallet && program) {
      if (amountSwapMove == 0) {
        Swal.fire({
          title: `Please enter amount MOVE`,
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
        }
      })
    }
    setAmountSwapMove(0);
  };

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
        <div className="flex mb-16">
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

          <div className="flex justity-between border-2 border-primary rounded-box" style={{ height: '150px' }}>
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
                      value={amountAddSol}
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
                      value={amountAddMove}
                      onChange={onAddMoveChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleAddMoveClick}

                    >ADD MOVE</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SWAP */}
          <br />
          <div className="flex justity-between border-2 border-primary rounded-box" style={{ height: '150px' }}>
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
                      value={amountSwapSol}
                      onChange={onSwapSolChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleSwapSolClick}

                    >SWAP SOL</button>
                  </div>
                </div>
                <div className="h-full flex-col w-1/2 text-center flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-2">

                    <input
                      type="text"
                      placeholder="Enter amount Move"
                      className="w-1/2 input input-borderedinput-lg bg-gray-100 text-black"
                      value={amountSwapMove}
                      onChange={onSwapMoveChange}

                    />
                    <button
                      className="btn btn-primary ml-8"
                      onClick={onHandleSwapMoveClick}

                    >SWAP MOVE</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};