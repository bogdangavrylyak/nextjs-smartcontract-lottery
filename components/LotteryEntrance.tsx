import { useEffect, useState } from 'react';
import { useWeb3Contract, useMoralis } from "react-moralis";
import { useNotification } from 'web3uikit';
import { ethers, BigNumber, ContractTransaction } from 'ethers';
import { abi, contractAddress } from '../constants';

interface contractAddressesInterface {
  [key: string]: string[]
}

const LotteryEntrance = () => {
  const addresses: contractAddressesInterface = contractAddress;
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex!).toString();
  console.log('chainId: ', chainId);
  const lotteryAddress = chainId in addresses ? addresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(lotteryAddress!, JSON.stringify(abi), provider);

    const handleWinnerPicked: ethers.providers.Listener = (from, to, value, event) => {
      console.log('winner 0: ', to.args[0]);
      console.log('winner: ', to.args.winner);
      setRecentWinner(to.args.winner);
    }
    
    contract.on('WinnerPicked', handleWinnerPicked);
    return () => {
      contract.off('WinnerPicked', handleWinnerPicked);
    };
  }, [lotteryAddress]);

  const { runContractFunction: enterLottery, isLoading, isFetching } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress!,
    functionName: 'enterLottery',
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress!,
    functionName: 'getEntranceFee',
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress!,
    functionName: 'getNumberOfPlayers',
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress!,
    functionName: 'getRecentWinner',
    params: {},
  });

  const dispatch = useNotification();

  const handleNewNotification = () => {
    dispatch({
        type: 'info',
        message: 'Transaction Complete!',
        title: 'Transaction Notification',
        position: 'topR',
        icon: 'bell',
    });
  }

  const updateUI = async () => {
    const entranceFeeFromContract = (await getEntranceFee() as BigNumber).toString();
    const numberOfPlayersFromContract = (await getNumberOfPlayers() as BigNumber).toString();
    const recentWinnerFromContract = await getRecentWinner() as string;
    setEntranceFee(entranceFeeFromContract);
    setNumberOfPlayers(numberOfPlayersFromContract);
    setRecentWinner(recentWinnerFromContract);
    console.log('entranceFeeFromContract: ', ethers.utils.formatUnits(entranceFeeFromContract, 'ether'));
  }

  const handleSuccess = async (tx: ContractTransaction) => {
    await tx.wait(1)
    handleNewNotification();
    updateUI();
  }

  useEffect(() => {
    if(isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div className='p-5'>
        { lotteryAddress ? (
        <div className=''>
          <button 
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto'
            onClick={async () => {
              await enterLottery({ 
                onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                onError: (error) => console.log(error),
              });
            }}
            disabled={isFetching || isLoading}
          >
            {isFetching || isLoading ? (
              <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div>
            ) : (
              <div>Enter Lottery</div>
            )} 
          </button>
          <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH</div>
          <div>Number Of Players: {numberOfPlayers}</div>
          <div>Recent Winner: {recentWinner}</div>
        </div>
        ) : (
          <div>
            No Lottery Address Detected
          </div>
        )
      }
    </div>
  )
}

export default LotteryEntrance;
