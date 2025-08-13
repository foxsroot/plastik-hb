import { Op } from 'sequelize';
import { Analytic } from '../models/Analytic';
import axios from 'axios';

// Utility to format date as YYYY-MM-DD
const formatDate = (date: Date): string =>
    date.toISOString().split('T')[0];

export const getTrafficAnalytics = async () => {
    // --- Setup ---
    // Get all analytics for the last 30 days (adjust as needed)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);

    const analytics = await Analytic.findAll({
        where: {
            created_at: {
                [Op.gte]: startDate,
                [Op.lte]: today,
            },
        },
        // raw: false,
    });

    // --- Logic ---
    // Aggregate overall stats
    const uniqueVisitors = new Set(analytics.map(a => a.ipAddress)).size;
    const pageViews = analytics.filter(a => a.type === 'PAGE').length;
    const productClicks = analytics.filter(a => a.type === 'PRODUCT').length;

    // Aggregate clicks per product
    const clicksPerProduct: Record<string, { clicks: number; lastClicked: string | null }> = {};

    analytics
        .filter(a => a.type === 'PRODUCT' && a.targetId)
        .forEach(a => {
            const productId = a.targetId;
            const createdAt = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            if (!clicksPerProduct[productId]) {
                clicksPerProduct[productId] = { clicks: 1, lastClicked: createdAt.toISOString() };
            } else {
                clicksPerProduct[productId].clicks += 1;
                // Update lastClicked if this createdAt is newer
                if (
                    !clicksPerProduct[productId].lastClicked ||
                    createdAt > new Date(clicksPerProduct[productId].lastClicked)
                ) {
                    clicksPerProduct[productId].lastClicked = createdAt.toISOString();
                }
            }
        });

    // Aggregate timeline stats
    const timeline: Record<string, { pengunjung: number; pageViews: number; productClicks: number }> = {};

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = formatDate(date);

        const dailyAnalytics = analytics.filter(a => {
            if (!a.createdAt) {
                return false;
            }
            const d = new Date(a.createdAt);
            return !isNaN(d.getTime()) && formatDate(d) === dateStr;
        });

        timeline[dateStr] = {
            pengunjung: new Set(dailyAnalytics.map(a => a.ipAddress)).size,
            pageViews: dailyAnalytics.filter(a => a.type === 'PAGE').length,
            productClicks: dailyAnalytics.filter(a => a.type === 'PRODUCT').length,
        };
    }

    // --- Response ---
    return {
        pengunjung: uniqueVisitors,
        pageViews,
        productClicks,
        clicksPerProduct,
        timeline,
    };
};

async function getCityFromIp(ip: string): Promise<string> {
    try {
        const res = await axios.get(`http://ip-api.com/json/${ip}/`);
        return res.data?.city ?? "Unknown";
    } catch (error) {
        return "Unknown";
    }
}

export const createAnalytics = async (payload: {
    type: "PAGE" | "PRODUCT";
    targetId: string;
    url: string;
    ipAddress: string;
}) => {
    const city = await getCityFromIp(payload.ipAddress);

    return await Analytic.create({
        type: payload.type,
        targetId: payload.targetId,
        url: payload.url,
        ipAddress: payload.ipAddress,
        location: city,
    });
};

export const isExist = async (targetId: string): Promise<boolean> => {
    let analytic;

    try {
        analytic = await Analytic.findOne({ where: { targetId } });
    } catch (error) {
        return false;
    }

    return !!analytic;
};