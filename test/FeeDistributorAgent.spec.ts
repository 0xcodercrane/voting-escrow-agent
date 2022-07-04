import { expect } from "chai";
import { network, ethers, upgrades } from "hardhat";

import { abi as VE_ABI } from "../artifacts/contracts/interfaces/IVotingEscrow.sol/IVotingEscrow.json";
import { abi as FEE_DISTRIBUTOR_ABI } from "../artifacts/contracts/interfaces/IFeeDistributor.sol/IFeeDistributor.json";

const ve_addr = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
const feeDistributor_addr = "0xA464e6DCda8AC41e03616F95f4BC98a13b8922Dc";
describe("FeeDistributorAgent", () => {
  let veContract, feeDistributorContract, agentContract;
  let owner, addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    console.log({ owner: owner.address, addr1: addr1.address });

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ve_addr],
    });
    const veSigner = await ethers.provider.getSigner(ve_addr);
    veContract = new ethers.Contract(ve_addr, VE_ABI, veSigner);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [feeDistributor_addr],
    });
    const feeDistributorSigner = await ethers.provider.getSigner(
      feeDistributor_addr
    );
    feeDistributorContract = new ethers.Contract(
      feeDistributor_addr,
      FEE_DISTRIBUTOR_ABI,
      feeDistributorSigner
    );

    const agentFactory = await ethers.getContractFactory(
      "FeeDistributorAgent",
      owner
    );

    agentContract = await upgrades.deployProxy(agentFactory, [
      ve_addr,
      feeDistributor_addr,
    ]);
  });

  it("should read the onchain values from the feeDistributor", async () => {
    const start_time = await feeDistributorContract.start_time();
    expect(start_time.toString()).to.be.eq("1600300800");
  });

  it("should read the onchain values from the agent", async () => {
    const WEEK = await agentContract.WEEK();
    expect(WEEK.toString()).to.be.eq("604800");
  });

  it("should return 0 for non-lockers", async () => {
    const addr = "0x53De73E9C0bdCad10DC7d4ccF5A5568a7e385602";
    const user_epoch = await agentContract.find_timestamp_user_epoch(addr);
    expect(user_epoch.toString()).to.be.eq("0");
    const claimable = await agentContract.claimable(addr);
    expect(claimable.toString()).to.be.eq("0");
  });

  it("should return 0 if the lock didn't pass a week at least from the last claim", async () => {
    const addr = "0xc455Ff675FE613C6A6C6396C6D0321E4feC33a43";
    const user_epoch = await agentContract.find_timestamp_user_epoch(addr);
    expect(user_epoch.toString()).to.be.eq("0");
    const claimable = await agentContract.claimable(addr);
    expect(claimable.toString()).to.be.eq("0");
  });

  it("happy1: should return value larger than 0 for the lock passed 2 weeks from the initial lock", async () => {
    const addr = "0x99fd1378ca799ed6772fe7bcdc9b30b389518962";
    const user_epoch = await agentContract.find_timestamp_user_epoch(addr);
    expect(user_epoch.toString()).to.be.eq("1");
    const claimable = await agentContract.claimable(addr);
    expect(claimable.toString()).to.be.eq("8206576454858404922192");
  });

  it("happy2: should return value larger than 0 for the lock passed 2 weeks from the initial lock", async () => {
    const addr = "0xaabd5fbcb8ad62d4fbbb02a2e9769a9f2ee7e883";
    const claimable = await agentContract.claimable(addr);
    expect(claimable.toString()).to.be.eq("94232863986594147556");
  });
});
