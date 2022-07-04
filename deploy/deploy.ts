import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DEPLOY_PARAMS } from "../src/config";

/**
 * Hardhat task defining the contract deployments
 *
 * @param hre Hardhat environment to deploy to
 */
const func: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
): Promise<void> => {
  const chainId = await hre.getChainId();
  const { ethers } = hre;
  let deployer, alice;
  ({ deployer, alice } = await hre.getNamedAccounts());
  if (!deployer) {
    [deployer] = await hre.getUnnamedAccounts();
  }

  console.log({ chainId, deployer });

  if (!DEPLOY_PARAMS[chainId]) {
    console.log(
      `Deploy Params must be configured before deploying. \n`,
      DEPLOY_PARAMS
    );
    return;
  }

  const { ve, feeDistributor } = DEPLOY_PARAMS[chainId];

  // Deploy Agent contract
  console.log(`Deploying FeeDistributorAgent contract to chain: ${chainId}`);
  await hre.deployments.deploy("FeeDistributorAgent", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [ve, feeDistributor],
        },
      },
      viaAdminContract: "AgentProxyAdmin",
    },
  });

  console.log("Done!");
};

export default func;
