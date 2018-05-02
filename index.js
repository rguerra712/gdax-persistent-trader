(function () {
    'use strict';

    const Gdax = require('gdax');
    const authedClient = new Gdax.AuthenticatedClient(
        process.env.GDAX_KEY,
        process.env.GDAX_SECRET,
        process.env.GDAX_PASSPHRASE,
        process.env.GDAX_URL
    );
    const publicClient = new Gdax.PublicClient(process.env.GDAX_URL);
    exports.handler = function index(event, context, callback) {
        event = event || {};
        let message = "";
        callback = callback || (() => console.log(message));
        let action = event.action || 'buy';
        let coin = event.coin || 'BTC';
        let amount = event.amount || '.005';
        let buySellFactor = action === 'buy' ? -1 : 1;
        var addOrders = () => {
            publicClient.getProductTicker(`${coin}-USD`)
                .then(data => {
                    var priceForBuying = data.bid;
                    var priceForSelling = data.ask;
                    let price = action === 'buy' ? priceForBuying: priceForSelling;
                    placeOrder(amount, price);
                })
                .catch(error => console.log(error));

        };
        
        let placeOrder = (size, limitPrice) => {
            let buySellParams = {
                side: action,
                size: size,
                product_id: `${coin}-USD`
            };
            buySellParams.price = limitPrice; // USD
            buySellParams.type = 'limit';
            buySellParams.post_only = true;
            authedClient.placeOrder(buySellParams)
                .then(data => {
                    console.log(data);
                    callback(null, message);
                })
                .catch(error => console.log(error));
        };
        addOrders();
    };
    exports.handler();
})();