import util from "util";
import {
  MsgSend,
  MsgMultiSend,
  SecretNetworkClient,
  SecretSecp256k1HdWallet,
} from "../src";
import { BaseAccount } from "../src/protobuf_stuff/cosmos/auth/v1beta1/auth";
import { gasToFee } from "../src/secret_network_client";
const exec = util.promisify(require("child_process").exec);

const SECONDS_30 = 30_000;

type Account = {
  name: string;
  type: string;
  address: string;
  pubkey: string;
  mnemonic: string;
  wallet: SecretSecp256k1HdWallet;
  secretjs: SecretNetworkClient;
};

const accounts: Account[] = [];

function isAccountsFull(): boolean {
  return (
    accounts.length === 4 &&
    !!accounts[0] &&
    !!accounts[1] &&
    !!accounts[2] &&
    !!accounts[3]
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMnemonicRegexForAccountName(account: string) {
  return new RegExp(`{"name":"${account}".+?"mnemonic":".+?"}`);
}

async function waitForTx(txhash: string): Promise<any> {
  while (true) {
    try {
      const { stdout } = await exec(
        `docker exec -i secretjs-testnet secretd q tx ${txhash}`,
      );

      if (Number(JSON.parse(stdout)?.code) === 0) {
        return JSON.parse(stdout);
      }
    } catch (error) {
      // console.error("q tx:", error);
    }

    await sleep(1000);
  }
}

async function secretcliStore(
  wasmPath: string,
  account: Account,
): Promise<number> {
  const { stdout: cp_wasm, stderr } = await exec(
    `docker cp "${wasmPath}" secretjs-testnet:/wasm-file`,
  );

  const { stdout: secretcli_store } = await exec(
    `docker exec -i secretjs-testnet secretd tx compute store /wasm-file --from "${account.name}" --gas 10000000 -y`,
  );
  const { txhash }: { txhash: string } = JSON.parse(secretcli_store);

  const tx = await waitForTx(txhash);

  return Number(
    tx.logs[0].events[0].attributes.find(
      (a: { key: string; value: string }) => a.key === "code_id",
    ).value,
  );
}

async function secretcliInit(
  codeId: number,
  initMsg: object,
  label: string,
  account: Account,
): Promise<string> {
  const { stdout: secretcli_store } = await exec(
    `docker exec -i secretjs-testnet secretd tx compute instantiate ${codeId} '${JSON.stringify(
      initMsg,
    )}' --label "${label}" --from "${account.name}" --gas 500000 -y`,
  );
  const { txhash }: { txhash: string } = JSON.parse(secretcli_store);

  const tx = await waitForTx(txhash);

  return String(
    tx.logs[0].events[0].attributes.find(
      (a: { key: string; value: string }) => a.key === "contract_address",
    ).value,
  );
}

async function getBalance(
  secretjs: SecretNetworkClient,
  address: string,
): Promise<bigint> {
  const response = await secretjs.query.bank.balance({
    address,
    denom: "uscrt",
  });

  if (response.balance) {
    return BigInt(response.balance.amount);
  } else {
    return BigInt(0);
  }
}

beforeAll(async () => {
  try {
    // init testnet
    console.log("Setting up a local testnet...");
    await exec("docker rm -f secretjs-testnet || true");
    const { stdout, stderr } = await exec(
      "docker run -it -d -p 26657:26657 -p 26656:26656 -p 1317:1317 --name secretjs-testnet enigmampc/secret-network-sw-dev:v1.2.2-1",
    );
    // console.log("stdout (testnet container id?):", stdout);
    if (stderr) {
      console.error("stderr:", stderr);
    }

    return new Promise<void>(async (accept, reject) => {
      // Wait for chain to start (blocks > 0)
      // Also extract genesis accounts for easy usage in the tests

      let keepChecking = true;
      const rejectTimeoout = setTimeout(() => {
        keepChecking = false;
        reject();
      }, SECONDS_30); // reject after X time

      const accountIdToName = ["a", "b", "c", "d"];
      while (keepChecking) {
        try {
          if (!isAccountsFull()) {
            // extract mnemonics of genesis accounts from logs
            const { stdout } = await exec("docker logs secretjs-testnet");
            const logs = String(stdout);
            for (const accountId of [0, 1, 2, 3]) {
              if (!accounts[accountId]) {
                const match = logs.match(
                  getMnemonicRegexForAccountName(accountIdToName[accountId]),
                );
                if (match) {
                  const parsedAccount = JSON.parse(match[0]);
                  parsedAccount.wallet =
                    await SecretSecp256k1HdWallet.fromMnemonic(
                      parsedAccount.mnemonic,
                    );
                  parsedAccount.secretjs = await SecretNetworkClient.create(
                    "http://localhost:26657",
                    {
                      signer: parsedAccount.wallet,
                      signerAddress: parsedAccount.address,
                      chainId: "secretdev-1",
                    },
                  );
                  accounts[accountId] = parsedAccount as Account;

                  console.log(
                    `Genesis account "${accountId}": ${JSON.stringify(
                      {
                        ...accounts[accountId],
                        wallet: undefined, // don't flood the screen with wallet object internals
                        secretjs: undefined, // don't flood the screen with secretjs object internals
                      },
                      null,
                      4,
                    )}`,
                  );
                }
              }
            }
          }

          // check if the network has started (i.e. block number >= 1)
          const { stdout: status } = await exec(
            "docker exec -i secretjs-testnet secretd status",
          );

          const resp = JSON.parse(status);

          if (
            Number(resp?.SyncInfo?.latest_block_height) >= 1 &&
            isAccountsFull()
          ) {
            clearTimeout(rejectTimeoout);
            accept();
            return;
          }
        } catch (e) {
          //   console.error(e);
        }
        await sleep(250);
      }
    });
  } catch (e) {
    console.error("Setup failed:", e);
  }
}, SECONDS_30 + 5_000);

afterAll(async () => {
  try {
    console.log("Tearing down local testnet...");
    const { stdout, stderr } = await exec("docker rm -f secretjs-testnet");
    // console.log("stdout (testnet container name?):", stdout);
    if (stderr) {
      console.error("stderr:", stderr);
    }
  } catch (e) {
    console.error("Teardown failed:", e);
  }
}, SECONDS_30);

describe("query.auth", () => {
  test("accounts()", async () => {
    const { secretjs } = accounts[0];

    const result = await secretjs.query.auth.accounts({});

    // 2 account with a balance (a & b) and 7 module accounts
    expect(result.length).toBe(9);
    expect(result.filter((x) => x?.type === "ModuleAccount").length).toBe(7);
    expect(result.filter((x) => x?.type === "BaseAccount").length).toBe(2);
    expect(
      result.filter((x) => {
        if (x?.type !== "BaseAccount") {
          return false;
        }

        const account = x.account as BaseAccount;

        return (
          account.address === accounts[0].address ||
          account.address === accounts[1].address
        );
      }).length,
    ).toBe(2);
  });

  test("account()", async () => {
    const { secretjs } = accounts[0];

    const response = await secretjs.query.auth.account({
      address: accounts[1].address,
    });

    if (!response) {
      fail(`Account "${accounts[1].address}" should exist`);
    }

    expect(response.type).toBe("BaseAccount");

    const account = response.account as BaseAccount;

    expect(account.address).toBe(accounts[1].address);
    expect(account.accountNumber).toBe("1");
    expect(account.sequence).toBe("0");
  });

  test("params()", async () => {
    const { secretjs } = accounts[0];

    const response = await secretjs.query.auth.params();
    expect(response).toEqual({
      params: {
        maxMemoCharacters: "256",
        sigVerifyCostEd25519: "590",
        sigVerifyCostSecp256k1: "1000",
        txSigLimit: "7",
        txSizeCostPerByte: "10",
      },
    });
  });
});

describe("query.compute", () => {
  let sSCRT: string;

  beforeAll(async () => {
    const codeId = await secretcliStore(
      `${__dirname}/snip20-ibc.wasm.gz`,
      accounts[0],
    );

    sSCRT = await secretcliInit(
      codeId,
      {
        name: "Secret SCRT",
        admin: accounts[0].address,
        symbol: "SSCRT",
        decimals: 6,
        initial_balances: [{ address: accounts[0].address, amount: "1" }],
        prng_seed: "eW8=",
        config: {
          public_total_supply: true,
          enable_deposit: true,
          enable_redeem: true,
          enable_mint: false,
          enable_burn: false,
        },
        supported_denoms: ["uscrt"],
      },
      "sSCRT",
      accounts[0],
    );

    console.log("code id", codeId);
  }, SECONDS_30 * 2 * 10);

  test("queryContract()", async () => {
    const { secretjs } = accounts[0];

    const {
      codeInfo: { codeHash },
    } = await secretjs.query.compute.code(1);

    type Result = {
      token_info: {
        decimals: number;
        name: string;
        symbol: string;
        total_supply: string;
      };
    };

    const result = (await secretjs.query.compute.queryContract({
      address: sSCRT,
      codeHash,
      query: { token_info: {} },
    })) as Result;

    expect(result).toEqual({
      token_info: {
        decimals: 6,
        name: "Secret SCRT",
        symbol: "SSCRT",
        total_supply: "1",
      },
    });
  });
});

describe("tx.bank", () => {
  test("MsgSend", async () => {
    const { secretjs } = accounts[0];

    const aBefore = await getBalance(secretjs, accounts[0].address);
    const cBefore = await getBalance(secretjs, accounts[2].address);

    const gasLimit = 20_000;
    const msg = new MsgSend({
      fromAddress: accounts[0].address,
      toAddress: accounts[2].address,
      amount: [{ denom: "uscrt", amount: "1" }],
    });

    const tx = await secretjs.tx.signAndBroadcast([msg], {
      gasLimit: gasLimit,
      gasPriceInFeeDenom: 0.25,
      feeDenom: "uscrt",
    });

    expect(tx.code).toBe(0);

    const aAfter = await getBalance(secretjs, accounts[0].address);
    const cAfter = await getBalance(secretjs, accounts[2].address);

    expect(aBefore - aAfter).toBe(BigInt(1) + BigInt(gasToFee(gasLimit, 0.25)));
    expect(cAfter - cBefore).toBe(BigInt(1));
  });

  test("MsgMultiSend", async () => {
    const { secretjs } = accounts[0];

    const aBefore = await getBalance(secretjs, accounts[0].address);
    const bBefore = await getBalance(secretjs, accounts[1].address);
    const cBefore = await getBalance(secretjs, accounts[2].address);

    const gasLimit = 20_000;
    const msg = new MsgMultiSend({
      inputs: [
        {
          address: accounts[0].address,
          coins: [{ denom: "uscrt", amount: "2" }],
        },
      ],
      outputs: [
        {
          address: accounts[1].address,
          coins: [{ denom: "uscrt", amount: "1" }],
        },
        {
          address: accounts[2].address,
          coins: [{ denom: "uscrt", amount: "1" }],
        },
      ],
    });

    const tx = await secretjs.tx.signAndBroadcast([msg], {
      gasLimit: gasLimit,
      gasPriceInFeeDenom: 0.25,
      feeDenom: "uscrt",
    });

    expect(tx.code).toBe(0);

    const aAfter = await getBalance(secretjs, accounts[0].address);
    const bAfter = await getBalance(secretjs, accounts[1].address);
    const cAfter = await getBalance(secretjs, accounts[2].address);

    expect(aBefore - aAfter).toBe(BigInt(2) + BigInt(gasToFee(gasLimit, 0.25)));
    expect(bAfter - bBefore).toBe(BigInt(1));
    expect(cAfter - cBefore).toBe(BigInt(1));
  });
});