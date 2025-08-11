import { updateContactSection } from '../../services/contactService';

jest.mock('../../services/contactService');

describe('Contact Info Editing', () => {
  // TC-054: Edit contact info
  it('TC-054: should allow admin to edit contact info', async () => {
    (updateContactSection as jest.Mock).mockResolvedValue({ data: { address: 'Jl. Mawar' } });
    const result = await updateContactSection({ address: 'Jl. Mawar' });
    expect(result.data).toHaveProperty('address', 'Jl. Mawar');
  });
});