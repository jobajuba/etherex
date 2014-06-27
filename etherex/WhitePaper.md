A decentralized exchange built on Ethereum
===================================================

Abstract
--------

At the end of January 2014, an organisation called Ethereum announced their existence to the world and took the minds of developers and crypto enthusiasts all over the world. With such an innovative, versatile and secure platform to build upon, we now have the means to create the solution to the Achille's heel of cryptocurrencies, and that solution is a decentralized exchange.

This document will go further into the details of this implementation of a decentralized exchange built on Ethereum, the concepts, requirements, potential problems and solutions, and innovations.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

  - [Concept](#concept)
    - [The decentralized, centralized order book](#the-decentralized-centralized-order-book)
  - [Requirements](#requirements)
  - [Problems and solutions](#problems-and-solutions)
    - [Blockchain bloat](#blockchain-bloat)
    - [Off-chain coins and fiat integration](#off-chain-coins-and-fiat-integration)
    - [Adoption and ecosystem](#adoption-and-ecosystem)
  - [Implementation of a decentralized exchange on Ethereum](#implementation-of-a-decentralized-exchange-on-ethereum)
  - [A New Approach](#a-new-approach)
  - [Data structure and API](#data-structure-and-api)
    - [API](#api)
    - [Trades (buy / sell)](#trades-buy--sell)
    - [Deposits / Withdrawals](#deposits--withdrawals)
    - [Cancellations](#cancellations)
    - [Adding a market](#adding-a-market)
    - [Operations](#operations)
    - [Amounts](#amounts)
    - [Prices](#prices)
    - [Market IDs](#market-ids)
    - [Currencies](#currencies)
    - [Market names](#market-names)
    - [Minimum trade amounts](#minimum-trade-amounts)
    - [Examples](#examples)
  - [Notes](#notes)
- [Interface](#interface)
    - [JSON API](#json-api)
- [Conclusion](#conclusion)
    - [References](#references)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


Concept
-------

The concept of a decentralized exchange can take many shapes and can be implemented in many different ways. A few projects have already emerged, including some that are already operational, namely Counterparty and Mastercoin's metaDEx. Both implement the concept in a peer-to-peer fashion and are built on top of the Bitcoin network. Unfortunately, these exchanges are limited by the very nature of Bitcoin's blockchain technology. We won't go further into the details of those limitations in this paper since Vitalik Buterin already covered them in the [Ethereum white paper][1], but we need to describe how such limitations affect the implementation of a decentralized exchange built on that technology.

Bitcoin's strength lies in it's simplicity, at least in terms of what it aims to achieve. There is no denying it's complexity, the efforts required to understand it's inner workings or how difficult it can be to grasp the concept at first. But what it does is still ultimately very simple operations, which are those of a currency; if I send you `x` BTC, I now have `x` BTC less and you have `x` more BTC. The Bitcoin blockchain only keeps track of those transactions as a distributed public ledger, and this is where those limitations start to emerge.

Building a decentralized exchange on a ledger that was designed to keep track of simple transactions (unspent outputs in Bitcoin's jargon) would be like trying to run Wall Street using side-notes in every accountant's single-lined book and matching traders by phone, however close to reality that can actually be (or was).

It is for those reasons and those mentioned in Vitalik's white paper that make Ethereum a much better platform for such an exchange.


### The decentralized, centralized order book

We will now have the platform to build something that was previously either impossible, very difficult to achieve and/or needed countless hacks in order to provide even the most basic functionality transparently, which is the safe transfer of funds.

Having great cryptographic tools at our disposal is interesting, but it's never really that useful unless it allows us to connect more easily. Bitcoin has allowed that in incredible ways. And since it's just the first experiment, we know much more is still possible. I also like to compare Bitcoin to git. They're great decentralized tools, but we still need to gather somewhere and have some level of centralization; we now have GitHub. And it could be decentralized too, distribute the load of hosting in the process and increase its responsiveness. But the point to this is the transparency and the inherent security it provides. It is now possible to build decentralized, centralized tools.

Ethereum now provides the perfect platform for transparency. We can now centralize the order book, the trading engine, and every rule we need to make an exchange work, only now **fully transparently, totally open-source and with the security of blockchain technology**.

[ some more describing the concept still ? ]


Requirements
------------

* Fully operational Ethereum network
* Standard balance check API
* Off-chain interaction with other cryptocurrencies


Problems and solutions
----------------------

Centralized exchanges suffer from a serious trust problem. A decentralized exchange solves most of these problems, but also has challenges of its own. We'll take a look at those in this section.


* Possible blockchain bloat
* Off-chain coins and fiat integration
* Adoption and ecosystem


Managing the integration of other cryptocurrencies is a challenging part of a decentralized exchange, and probably the main reason why none has emerged so far. Ethereum now provides a solution to the security and decentralization, but also brings the necessary building blocks for other cryptocurrencies to start interacting. A decentralized exchange will be the first application of this kind to take advantage of those possibilities.

Outside of the Ethereum network, a decentralized exchange will need secure wallets and their related APIs to communicate information back into the trading engine. The first implementations for ETH/BTC might require a more centralized approach depending on the tools available to secure off-chain coins. Decisions will need to be taken regarding other trading pairs, and easier and more direct implementations into the Ethereum network will offer alternatives that will also have to be considered when they arise.


### Blockchain bloat

Trading data will need to be regularly optimized to maintain an acceptable footprint on the Ethereum network. More research and tests will be needed, but it is already clear that the operating costs will not be suited for HFT trading and for very small trades. It will be the project's responsibility to be properly optimized both in its execution and storage use. However, other scaling issues would have to be resolved with the Ethereum platform itself, to which the exchange would contribute with any development or direct code contribution.


### Off-chain coins and fiat integration

It has to be understood that the decentralized exchange itself will not be providing the off-chain services but act as a hub for other DAOs and DACs to provide such services. In the same way that Ethereum provides a feature-less platform, the exchange initially provides a blank slate for new markets. Many pairs of the same currency can also compete in security, features, speed, privacy and so on, across different levels of decentralization.

[ more about markets and currency pairs ]


### Adoption and ecosystem

A decentralized exchange will require no sign-up of any kind from users to allow for its normal operations. However, users would be required to hold an initial balance of Ether to interact with the network in the first place. The exchange will hold an important role within the ecosystem as described as the DAOex in the (draft) paper [The DAOist protocol][2] by Vlad Zamfir, and some work has already been done in that paper to provide a solution to easier adoption. Other elements of that protocol will need to be implemented both in the exchange and DAOs and will be covered when a complete API is available. At the very least, a standard API for getting balances and transferring amounts for subcurrencies will need to be established.



Implementation of a decentralized exchange on Ethereum
------------------------------------------------------

The decentralized exchange is made of a set of contracts running on the Ethereum blockchain. We've been running tests and simulations since their first proof-of-concept (poc) was made available and already made a number of contributions to the codebase of Ethereum itself. Although very basic at the moment, those were exactly what we needed to confirm the feasibility of this project, a sort of poc-within-a-poc. Below is an even more simplistic example outlining some of the basic ideas of a exchange contract :

```python
init:
    contract.storage[2] = msg.sender # Set sender as owner
code:
    statusindex = 1
    ownerindex = 2
    buyindex = 3
    sellindex = 4
    status = contract.storage[statusindex]
    owner = contract.storage[ownerindex]
    if status == 0 and msg.sender == owner:
        if tx.value < 1 * 10 ^ 18: # Minimum 1 ETH to initialize
            return(0)
        contract.storage[statusindex] = 1
        return(1)
    else:
        if tx.value < 1 * 10 ^ 18: # Minimum 1 ETH for this example
            return(0)
        buyorsell = msg.data[0]
        availabletobuy = contract.storage[sellindex]
        if buyorsell == 1:
            if availabletobuy <= msg.value:
                return(0)
            contract.storage[sellindex] = availabletobuy - msg.value
            ret = send(500, msg.sender, 2 * msg.value)
            return(ret)
        elif buyorsell == 2:
            contract.storage[sellindex] = availabletobuy + msg.value
        return(1)
    return(0) # Should have returned something
```

You will notice how this is a one way exchange and barely touches the surface of what is possible. Remember that this contract is for the sake of the example only. Every version of the contracts that will be used will be different in almost every way, but the same concepts will still apply.

Let's take a look at what this example would do.

First we define the different storage indexes that will be used and get the contract status from the contract's storage. We then proceed to check if the contract has been initialized, and if not, make sure our owner is funding the exchange with at least 1 ether. If that verification passes, the owner's address is written into the contract's storage at the specified index and the contract's status is changed afterwards.

Once the contract is initialized, after the else statement, fees are calculated, and the transaction's value is checked to be at least 10 times the base fees, which are fixed for this example.

The `msg.data[0]` field is then checked to indicate a buy (passing 1 as first value) or a sell (passing 2 as first value) and the current balance available to buy. In our example, a seller would actually be giving away instead of selling. If the sender is buying and the balance allows it, we proceed to subtract the amount minus the fees from the balance in storage, send twice the value less the fees to the buyer, and send the exchange's owner part of the fees. If the sender is selling, as mentioned before, the transaction's value minus the fees is added to the balance in storage and the sender can now feel very generous. Exchange fees are also sent to the owner in that case.

This outlines how this example works only, and the real implementation will be much more complex and useful. Other contracts will be receiving transactions from the exchange only, acting as secure data feeds thus allowing to update balances inside the exchange's contracts in a secure fashion.



A New Approach
--------------

Ethereum now allows us to build an exchange with a decentralized but shared order book, and where every asset denominated in ether can be handled in a trustless, automated, decentralized trading engine.

The main contract handles most of the interactions with the users, dispatching commands or simply refunding the user in case of an invalid request. Once the interface is stable enough, most or all of these errors should be caught before becoming transactions and actual trades or operation requests. The main contract will handle most of the exchange's logic, including trade verifications, but will only hold a few meta-data objects and the nonces of price indexes. A separate, possibly self-replicating contract will store those price indexes, which themselves at least include prices and the total of trades per price. Another contract will handle a subcurrency as the base asset of the exchange. It's actual use is still being discussed since there is still a preference towards simply using Ether for all transactions if possible. However, a balance within the exchange still needs to be recorded and such a subcurrency currently serves that purpose with that contract. A fourth contract, also self-replicating, will hold the actual trades and data. And, at the very least, a fifth contract is needed to hold the different markets being added.

Other contracts will eventually get added for Contracts for Differences (CFDs) and any new features. It will also be up to the community to provide some of those contracts, something that should be made easy by copying a current set of contracts and related interface.


[ More info about interactions between contracts and other feeds, backend servers, the website, other interfaces, limitations, etc. ]



Data structure and API
----------------------

A full description of the final contract storage data structure will be provided for anyone to read the exchange's orderbook and data.

### API

* __WARNING: Provisional API only, we are in the process of refactoring the API to offload more features to the interface__
* The API is the format of the data field for the Ethereum transactions.
* You only need an Ethereum client to use the API.


### Trades (buy / sell)
```
<operation> <amount> <price> <marketid>
```


### Deposits / Withdrawals
```
<operation> <amount> <currency>
```


### Cancellations
```
<operation> <id>
```


### Adding a market
```
<operation> <minimum trade> <minimum price> <currency> <contract>
```


### Operations

Allowed values:
```
1 = BUY
2 = SELL
3 = DEPOSIT
4 = WITHDRAW
5 = CANCEL
6 = ADDMARKET
```


### Amounts

* Amount in wei for ETH or XETH
* Amount in satoshi for BTC
* Lowest denomination of each subcurrency


### Prices

* Price in ETH/XETH * 10 ^ 8, as long integer
* Price in ETH/BTC * 10 ^ 8, as long integer


### Market IDs
```
1 = ETH/XETH
```
New market IDs will be created as DAO creators add their subcurrency to the exchange.


### Currencies
```
1 = ETH
2 = XETH
3 = BTC
```
New currency IDs will also be created as markets get added.


### Market names
Follow the "ETH/<name>" convention for the market name, like "ETH/BOB" for BobCoin.

### Minimum trade amounts
When adding a subcurrency, make the minimum trade amount high enough to make economic sense.


### Examples

Buy 1000 ETH at 1200 ETH/BTC (for 1.2 BTC)
```
1 1000000000000000000000 120000000000 1
```

Sell 1000 ETH at 1200 ETH/BTC (for 1.2 BTC)
```
2 1000000000000000000000 120000000000 1
```

Fulfill trade
```
3 0x3039
```

Deposit 1 BTC
```
3 100000000 2
```

Withdraw 1 ETH
```
4 1000000000000000000 1
```

Cancel operation
```
5 0x3039
```

Add your subcurrency
```
6 1000000000000000000000 100000000 "ETH/BOB" 0xe559de5527492bcb42ec68d07df0742a98ec3f1e
```


Notes
-----
* Your Ethereum address is used as your identity



Interface
=========

The decentralized exchange will provide an open source interface on the Ethereum platform both as a standalone web app that connects to a node and as a client-browser interface.

[ needs more details? ]


###JSON API

A complete JSON-RPC API will be provided to retrieve information about the exchange, however providing your own nodes will be highly encouraged. All of the exchange's data will be available to you from the interface within the Ethereum client.

There will be no JSON or other type of trading API since the exchange is using Ethereum. Trading is done by sending transactions directly to the contract(s) running the exchange.


Conclusion
==========

Using blockchain technology allows to solve many problems by having the users and the exchange access the same data as easily. New challenges are introduced at many levels, and allocation of resources have to be carefully managed to allow a good user experience and provide useful decentralized services. However, the possibilities combined with the inherent security of the network will allow for better, safer and simpler trading tools operating in total transparency.



### References
[1]: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-White-Paper#scripting
1: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-White-Paper#scripting

[2]: https://docs.google.com/a/coinculture.info/document/d/1h9WY8XbT3cuIVN5mFmlkRJ8tHj5pJSnEpQ4__fslxXI/edit
2: https://docs.google.com/a/coinculture.info/document/d/1h9WY8XbT3cuIVN5mFmlkRJ8tHj5pJSnEpQ4__fslxXI/edit