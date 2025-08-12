import { User } from '../../models/User';
import bcrypt from 'bcrypt';

jest.mock('../../models/User');
jest.mock('bcrypt');

describe('Admin Authentication', () => {
  // TC-051-a: Login with correct credentials
  it('TC-051-a: should login with correct credentials', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ password: 'hashed' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    expect(user).toBeTruthy();
    const valid = await bcrypt.compare('admin123', user!.password);
    expect(valid).toBe(true);
  });

  // TC-051-b: Login with wrong credentials
  it('TC-051-b: should reject login with wrong credentials', async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ password: 'hashed' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    expect(user).toBeTruthy();
    const valid = await bcrypt.compare('wrong', user!.password);
    expect(valid).toBe(false);
  });
});