var constants = require('../js/constants');
var moment = require('moment');

var NetworkActions = function() {
  /**
   * Update the UI and stores depending on the state of the network.
   *
   * If the daemon just became reachable (including startup), load the
   * latest data and ensure that we're monitoring new blocks to update our
   * stores. If our Ethereum daemon just became unreachable, dispatch an event so
   * an error dialog can be display.
   */
  this.checkNetwork = function() {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    var networkState = this.flux.store('network').getState();

    var nowUp = ethereumClient.isAvailable();

    // var wasUp = (networkState.ethereumStatus === constants.network.ETHEREUM_STATUS_CONNECTED);
    var wasDown = (!networkState.ethereumStatus || networkState.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED);

    if (!nowUp) {
      this.dispatch( constants.network.UPDATE_ETHEREUM_STATUS, {
        ethereumStatus: constants.network.ETHEREUM_STATUS_FAILED
      });
      this.dispatch(constants.network.UPDATE_READY, {
        ready: false
      });
      // this.flux.actions.network.reset(); // need stopPolling() instead

      // Put trades in loading state
      this.dispatch(constants.trade.LOAD_TRADES);
    }
    else if (wasDown && nowUp) {
      this.dispatch( constants.network.UPDATE_ETHEREUM_STATUS, {
        ethereumStatus: constants.network.ETHEREUM_STATUS_CONNECTED
      });
      this.flux.actions.network.startMonitoring();
    }

    if (nowUp) {
      var timedOut = this.flux.store('config').getState().timeout;

      this.flux.actions.network.updateNetwork();

      if (networkState.blockChainAge > timedOut) {
        // Also put trades in loading state if network was not ready
        this.dispatch(constants.trade.LOAD_TRADES);

        this.dispatch(constants.network.UPDATE_READY, {
          ready: false
        });
        this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, { percentLoaded: 100 });
        this.flux.actions.user.loadAddresses(false);
      }
      else if (networkState.blockChainAge <= timedOut) {
        if (!networkState.ready || wasDown) {
          // Also put trades in loading state if network was not ready
          this.dispatch(constants.trade.LOAD_TRADES);

          this.dispatch(constants.network.UPDATE_READY, {
            ready: true
          });
          this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, { percentLoaded: 0 });
          this.flux.actions.network.loadEverything();
        }
      }
    }

    // check yo self
    if (!this.flux.store('config').getState().demoMode)
      setTimeout(this.flux.actions.network.checkNetwork, 3000);
  };

  this.updateNetwork = function () {
    var ethereumClient = this.flux.store('config').getEthereumClient();

    // Get last block's timestamp and calculate block time and age
    ethereumClient.getBlock('latest', function(block) {
      // Update block date
      this.dispatch(constants.network.UPDATE_NETWORK, {
        blockNumber: block.number,
        blockDate: moment(block.timestamp * 1000).format('MMM Do, HH:mm')
      });

      // Update block time
      if (block.number > 1) {
        ethereumClient.getBlock(block.number - 1, function(previous) {
          var diff = block.timestamp - previous.timestamp;
          this.dispatch(constants.network.UPDATE_NETWORK, {
            blockTime: diff + " s"
          });
        }.bind(this));
      }

      // Update blockchain age
      if (block.timestamp) {
        var blockChainAge = (new Date().getTime() / 1000) - block.timestamp;
        this.dispatch(constants.network.UPDATE_BLOCK_CHAIN_AGE, {
          blockChainAge: blockChainAge
        });
      }
    }.bind(this));

    // Update other metrics
    ethereumClient.getClient(function(client) {
      this.dispatch(constants.network.UPDATE_NETWORK, { client: client });
    }.bind(this));
    ethereumClient.getPeerCount(function(peerCount) {
      this.dispatch(constants.network.UPDATE_NETWORK, { peerCount: peerCount });
    }.bind(this));
    ethereumClient.getGasPrice(function(gasPrice) {
      this.dispatch(constants.network.UPDATE_NETWORK, { gasPrice: gasPrice });
    }.bind(this));
    ethereumClient.getMining(function(mining) {
      this.dispatch(constants.network.UPDATE_NETWORK, { mining: mining });
    }.bind(this));
    ethereumClient.getHashrate(function(hashrate) {
      this.dispatch(constants.network.UPDATE_NETWORK, { hashrate: hashrate });
    }.bind(this));
  };

  /**
   * Load all of the application's data, particularly during initialization.
   */
  this.loadEverything = function () {
    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.network.updateNetwork();

    // Trigger loading addresses, which load markets, which load trades
    this.flux.actions.user.loadAddresses(true);

    // start monitoring for updates
    this.flux.actions.network.startMonitoring();
  };

  /**
   * Update data that should change over time in the UI.
   */
  this.onNewBlock = function () {
    this.flux.actions.network.updateNetwork();

    // Already using watch in EthereumClient, but not reliable enough yet
    var networkState = this.flux.store('network').getState();

    if (networkState.ready) {
      if (this.flux.store("UserStore").getState().user.id)
        this.flux.actions.user.updateBalance();

      var market = this.flux.store("MarketStore").getState().market;
      if (market.id)
        this.flux.actions.user.updateBalanceSub();
    }
  };

  this.startMonitoring = function () {
    var networkState = this.flux.store('network').getState();

    if (!networkState.isMonitoringBlocks) {
      var ethereumClient = this.flux.store('config').getEthereumClient();
      ethereumClient.startMonitoring(this.flux.actions.network.onNewBlock);

      this.dispatch(constants.network.UPDATE_IS_MONITORING_BLOCKS, {
        isMonitoringBlocks: true
      });
    }
  };

  this.stopMonitoring = function (error) {
    var networkState = this.flux.store('network').getState();

    if (networkState.isMonitoringBlocks) {
      var ethereumClient = this.flux.store('config').getEthereumClient();
      ethereumClient.stopMonitoring(error);

      this.dispatch(constants.network.UPDATE_IS_MONITORING_BLOCKS, {
        isMonitoringBlocks: false
      });
    }
  };

  this.reset = function() {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    ethereumClient.reset();
    this.flux.actions.network.startMonitoring();
  };
};

module.exports = NetworkActions;