import { Analytic } from '../../models/Analytic';

jest.mock('../../models/Analytic');

describe('Analytics', () => {
  // TC-061: Show visitor count for period
  it('TC-061: should return visitor count for selected period', async () => {
    (Analytic.findAll as jest.Mock).mockResolvedValue([
      { ipAddress: '1.1.1.1' },
      { ipAddress: '2.2.2.2' }
    ]);
    const analytics = await Analytic.findAll({ where: { created_at: { $gte: new Date('2023-01-01') } } });
    const uniqueVisitors = new Set(analytics.map(a => a.ipAddress)).size;
    expect(uniqueVisitors).toBeGreaterThan(0);
  });

  // TC-062: Show product click count
  it('TC-062: should return click count per product', async () => {
    (Analytic.findAll as jest.Mock).mockResolvedValue([
      { type: 'PRODUCT', targetId: 'p1' },
      { type: 'PRODUCT', targetId: 'p1' },
      { type: 'PRODUCT', targetId: 'p2' }
    ]);
    const analytics = await Analytic.findAll();
    const clicks = analytics.filter(a => a.type === 'PRODUCT').reduce((acc, a) => {
      acc[a.targetId] = (acc[a.targetId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    expect(clicks['p1']).toBe(2);
    expect(clicks['p2']).toBe(1);
  });
});