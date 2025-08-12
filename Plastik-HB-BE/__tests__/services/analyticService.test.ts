import { getTrafficAnalytics, createAnalytics } from '../../services/analyticService';
import { Analytic } from '../../models/Analytic';
import axios from 'axios';

// Mock dependencies
jest.mock('../../models/Analytic');
jest.mock('axios');

const mockedAnalytic = Analytic as jest.Mocked<typeof Analytic>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Analytics Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTrafficAnalytics', () => {
        it('should return traffic analytics with empty data when no analytics exist', async () => {
            mockedAnalytic.findAll.mockResolvedValue([]);

            const result = await getTrafficAnalytics();

            expect(result).toEqual({
                pengunjung: 0,
                pageViews: 0,
                productClicks: 0,
                clicksPerProduct: {},
                timeline: expect.any(Object)
            });
            expect(Object.keys(result.timeline)).toHaveLength(30);
        });

        it('should calculate unique visitors and page views correctly', async () => {
            const mockAnalytics = [
                {
                    ipAddress: '192.168.1.1',
                    type: 'PAGE',
                    createdAt: new Date(),
                    targetId: null
                },
                {
                    ipAddress: '192.168.1.1',
                    type: 'PAGE',
                    createdAt: new Date(),
                    targetId: null
                },
                {
                    ipAddress: '192.168.1.2',
                    type: 'PRODUCT',
                    createdAt: new Date(),
                    targetId: 'product-1'
                }
            ];

            mockedAnalytic.findAll.mockResolvedValue(mockAnalytics as any);

            const result = await getTrafficAnalytics();

            expect(result.pengunjung).toBe(2);
            expect(result.pageViews).toBe(2);
            expect(result.productClicks).toBe(1);
        });

        it('should aggregate product clicks correctly', async () => {
            const mockAnalytics = [
                {
                    ipAddress: '192.168.1.1',
                    type: 'PRODUCT',
                    createdAt: new Date('2023-01-01'),
                    targetId: 'product-1'
                },
                {
                    ipAddress: '192.168.1.2',
                    type: 'PRODUCT',
                    createdAt: new Date('2023-01-02'),
                    targetId: 'product-1'
                }
            ];

            mockedAnalytic.findAll.mockResolvedValue(mockAnalytics as any);

            const result = await getTrafficAnalytics();

            expect(result.clicksPerProduct['product-1']).toEqual({
                clicks: 2,
                lastClicked: new Date('2023-01-02').toISOString()
            });
        });
    });

    describe('createAnalytics', () => {
        it('should create analytics with city from IP', async () => {
            const mockPayload = {
                type: 'PAGE' as const,
                targetId: 'home',
                url: '/home',
                ipAddress: '192.168.1.1'
            };

            mockedAxios.get.mockResolvedValue({
                data: { city: 'Jakarta' }
            });

            const mockCreatedAnalytic = { ...mockPayload, location: 'Jakarta' };
            mockedAnalytic.create.mockResolvedValue(mockCreatedAnalytic as any);

            const result = await createAnalytics(mockPayload);

            expect(mockedAxios.get).toHaveBeenCalledWith('https://ipapi.co/json/192.168.1.1/');
            expect(mockedAnalytic.create).toHaveBeenCalledWith({
                ...mockPayload,
                location: 'Jakarta'
            });
            expect(result).toEqual(mockCreatedAnalytic);
        });

        it('should handle IP geolocation API failure', async () => {
            const mockPayload = {
                type: 'PRODUCT' as const,
                targetId: 'product-1',
                url: '/product/1',
                ipAddress: '192.168.1.1'
            };

            mockedAxios.get.mockRejectedValue(new Error('API Error'));

            const mockCreatedAnalytic = { ...mockPayload, location: 'Unknown' };
            mockedAnalytic.create.mockResolvedValue(mockCreatedAnalytic as any);

            const result = await createAnalytics(mockPayload);

            expect(mockedAnalytic.create).toHaveBeenCalledWith({
                ...mockPayload,
                location: 'Unknown'
            });
        });
    });
});

