const axios = require('axios');

async function generateAccessToken() {
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    });
    return response.data.access_token;
}

exports.createOrder = async (amount, description, returnUrl, cancelUrl) => {
    const accessToken = await generateAccessToken();

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        data: {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    description,
                    amount: {
                        currency_code: 'USD',
                        value: amount
                    }
                }
            ],
            application_context: {
                return_url: returnUrl,
                cancel_url: cancelUrl,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW'
            }
        }
    });

    return response.data.links.find(link => link.rel === 'approve').href;
};

exports.capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken();

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    });

    return response.data;
};