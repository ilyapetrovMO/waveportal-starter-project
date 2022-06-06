import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
  const contractAddress = "0xd10933649C8a9D5cf2747a980FEaAFCCC7C65622"
  const contractABI = abi.abi
  const [currentAccount, setCurrentAccount] = React.useState("")
  const [waveCount, setWaveCount] = React.useState(0)
  const [txInProgress, setTxInProgress] = React.useState(false)

  const getWaveContract = () => {
    const { ethereum } = window
    
    if (!ethereum) {
      console.error("no ethereum object found")
      return
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(contractAddress, contractABI, signer)
  }

  const getTotalWaves = async () => {
    let waveContract = getWaveContract()

    try {
      let count = await waveContract.getTotalWaves()
      setWaveCount(count.toNumber())
    } catch (error) {
      console.error(error)
      return
    }
  }

  const wave = async () => {
    let waveContract = getWaveContract()

    try {
      setTxInProgress(true)
      let waveTx = await waveContract.wave()

      await waveTx.wait()
      setTxInProgress(false)

      await getTotalWaves()

      alert(`Wave recieved! Total waves: ${waveCount}`)
    } catch (error) {
      setTxInProgress(false)
      console.error(error)
      return
    }
  }

  const checkIFWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("No etherium global object found")
      return
    } 
    
    console.log(`Connected to metamask: isMetaMask - ${ethereum.isMetaMask}`)

    try {
      const accounts = await ethereum.request({method: "eth_accounts"})

      if (accounts.length === 0) {
        console.log("no accounts found")
        return
      }
  
      const account = accounts[0]
      setCurrentAccount(account)
      console.log("authorized account: ", account)
    } catch (error) {
      console.log(error)
      return
    }
  }

  const connectWallet = () => {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(setCurrentAccount)
      .catch(err => {
        console.log(err)
      })
  }

  React.useEffect(() => {
      checkIFWalletIsConnected();
      getTotalWaves()
  })

  React.useEffect(() => {
    const interval = setInterval(() => {
      getTotalWaves()
    }, 20 * 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="mainContainer">
      <section className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        
        <button className="waveButton" disabled={txInProgress} onClick={wave}>
          Wave at Me
        </button>
        
        {!currentAccount && 
        <button className="waveButton" onClick={connectWallet}>
          connect wallet
          </button>
        }
      </section>
      <footer>
        total waves: {waveCount}
      </footer>
    </div>
  );
}
