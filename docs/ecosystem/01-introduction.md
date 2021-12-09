---
id: introduction
title: Introduction
sidebar_label: Introduction
slug: /
---

## What is Jellyfish?

A collection of TypeScript + JavaScript tools and libraries for DeFi Blockchain developers to build decentralized 
finance on Bitcoin. Consisting of multiple packages with more to be added in the future, this JS library enables 
developers to create decentralized applications on top of DeFi Blockchain that are modern, easy to use and easy to 
test.

### Monorepo & packages 

As with all modern JavaScript projects, jellyfish follows a monorepo structure with its concerns separated. All packages
maintained in this repo are published with the same version tag and follows the `DeFiCh/ain` releases.

| Package                                      | Description                                                                                                            |
|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `@muirglacier/jellyfish-address`               | Provide address builder, parser, validator utility library for DeFi Blockchain.                                        |
| `@muirglacier/jellyfish-api-core`              | A protocol agnostic DeFi Blockchain client interfaces, with a "foreign function interface" design.                     |
| `@muirglacier/jellyfish-api-jsonrpc`           | Implements the [JSON-RPC 1.0](https://www.jsonrpc.org/specification_v1) specification for api-core.                    |
| `@muirglacier/jellyfish-block`                 | Stateless raw block composer for the DeFi Blockchain.                                                                  |
| `@muirglacier/jellyfish-buffer`                | Buffer composer for jellyfish.                                                                                         |
| `@muirglacier/jellyfish-crypto`                | Cryptography operations for jellyfish, includes a simple 'secp256k1' EllipticPair.                                     |
| `@muirglacier/jellyfish-json`                  | Allows parsing of JSON with 'lossless', 'bignumber' and 'number' numeric precision.                                    |
| `@muirglacier/jellyfish-network`               | Contains DeFi Blockchain various network configuration for mainnet, testnet and regtest.                               |
| `@muirglacier/jellyfish-testing`               | Provides many abstractions for various commonly used setup pattern for DeFi Blockchain.                                |
| `@muirglacier/jellyfish-transaction`           | Dead simple modern stateless raw transaction composer for the DeFi Blockchain.                                         |
| `@muirglacier/jellyfish-transaction-builder`   | Provides a high-high level abstraction for constructing transaction ready to be broadcast for DeFi Blockchain.         |
| `@muirglacier/jellyfish-transaction-signature` | Stateless utility library to perform transaction signing.                                                              |
| `@muirglacier/jellyfish-wallet`                | Jellyfish wallet is a managed wallet, where account can get discovered from an HD seed.                                |
| `@muirglacier/jellyfish-wallet-classic`        | WalletClassic implements a simple, single elliptic pair wallet.                                                        |
| `@muirglacier/jellyfish-wallet-encrypted`      | Library to encrypt MnemonicHdNode as EncryptedMnemonicHdNode. Able to perform as MnemonicHdNode with passphrase known. |
| `@muirglacier/jellyfish-wallet-mnemonic`       | MnemonicHdNode implements the WalletHdNode from jellyfish-wallet; a CoinType-agnostic HD Wallet for noncustodial DeFi. |
| `@muirglacier/testcontainers`                  | Provides a lightweight, throw away instances for DeFiD node provisioned automatically in a Docker container.           |
| ~~@muirglacier/testing~~                       | (deprecated) ~~Provides rich test fixture setup functions for effective and effortless testing.~~                      |
