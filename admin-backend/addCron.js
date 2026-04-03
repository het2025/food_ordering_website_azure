import cron from 'node-cron';
import { DeliveryBoy } from './models/DeliveryBoy.js';
import { DeliveryPayout } from './models/DeliveryPayout.js';
 
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily delivery payout cron job...');
        const Mongoose = require('mongoose');
        const deliveryBoys = await DeliveryBoy.find({ totalEarnings: { [\]: 0 } });
        for (const boy of deliveryBoys) {
            const monthsDiff = (new Date().getFullYear() - boy.createdAt.getFullYear()) * 12 + (new Date().getMonth() - boy.createdAt.getMonth());
            const dayMatch = new Date().getDate() === boy.createdAt.getDate();
            if (monthsDiff > 0 && dayMatch) {
                const payoutAmount = boy.totalEarnings;
                const newPayout = new DeliveryPayout({ deliveryUser: boy._id, amount: payoutAmount, status: 'Completed', paidAt: new Date() });
                await newPayout.save();
                boy.totalEarnings = 0;
                await boy.save();
                console.log('Paid ' + boy._id + ' amount: ' + payoutAmount);
            }
        }
    } catch (e) {
        console.error(e);
    }
});
