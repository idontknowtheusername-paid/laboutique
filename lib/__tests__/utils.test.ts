// Test simple pour vérifier que Jest fonctionne
describe('Utils', () => {
  test('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    expect('hello').toContain('hello');
  });

  test('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});