import Web3 from 'web3'

let pollViews = function () {
    let web3 = window.web3
    web3 = Web3(web3.currentProvider)

    this.$store.state.contractInstance().count.call(function (error, result) {
        
    })
}