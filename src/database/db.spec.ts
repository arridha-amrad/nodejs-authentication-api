describe('Database', () => {
  it('should use test database URI', () => {
    expect(process.env.DB_URI).toContain('nodejs_authentication__test');
    expect(process.env.NODE_ENV).toBe('test');
  });
});
