import { Op } from 'sequelize';
import { Analytic } from '../models/Analytic';

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
        raw: true,
    });

    // --- Logic ---
    // Aggregate overall stats
    const uniqueVisitors = new Set(analytics.map(a => a.ipAddress)).size;
    const pageViews = analytics.filter(a => a.type === 'PAGE').length;
    const productClicks = analytics.filter(a => a.type === 'PRODUCT').length;

    // Aggregate timeline stats
    const timeline: Record<string, { pengunjung: number; pageViews: number; productClicks: number }> = {};

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = formatDate(date);

        const dailyAnalytics = analytics.filter(a => {
            if (!a.created_at) {
                return false;
            }
            const d = new Date(a.created_at);
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
        timeline,
    };
};