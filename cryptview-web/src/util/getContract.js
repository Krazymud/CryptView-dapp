
import {address, ABI} from './constants/cryptviewContract'

let getContract = new Promise(function (resolve, reject) {
    let web3 = window.web3
    let cryptviewContract = web3.eth.contract(ABI)
    let cryptviewContractInstance = cryptviewContract.at(address)
    // cryptviewContractInstance = () => cryptviewContractInstance
    resolve(cryptviewContractInstance)
})

export default getContract
