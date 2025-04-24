const express = require('express');
const router = express.Router();
const paypal = require('../service/paypal');

router.post('/create-order', async (req, res) => {
    try {
        const { amount, description } = req.body;
        const returnUrl = `${process.env.BASE_URL}/api/paypal/complete-order`;
        const cancelUrl = `${process.env.BASE_URL}/api/paypal/cancel-order`;

        const approvalUrl = await paypal.createOrder(amount, description, returnUrl, cancelUrl);
        res.json({ success: true, approvalUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/complete-order', async (req, res) => {
    try {
        const { token } = req.query;
        const paymentResult = await paypal.capturePayment(token);


        res.json({ success: true, paymentResult });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/cancel-order', (req, res) => {
    res.json({ success: false, message: 'Payment cancelled' });
});

module.exports = router;