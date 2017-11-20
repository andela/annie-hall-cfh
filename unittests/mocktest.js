// Setup sample tests to confirm functionality of the test environment setup.
describe('Users factory', () => {
  it('has a dummy spec to test 2 + 2', () => {
    // An intentionally passing test.
    expect(3 + 1).toEqual(4);
  });

  it('has another dummy spec to test 2 + 2', () => {
    // An intentionally failing test.
    expect(34 + 1).toEqual(35);
  });
});