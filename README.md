# VotingEscrow Agent contracts
This is a simple agent contract which allows ve lockers to see how much they can claim from FeeDistributor contract

### How to deploy contracts

```sh
yarn hardhat deploy --network NETWORK_NAME
```

### How to verify contracts on etherscan

```sh
yarn hardhat etherscan-verify --solc-input --network NETWORK_NAME
```