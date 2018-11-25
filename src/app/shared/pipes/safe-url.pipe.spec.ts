import { SafeUrlPipe } from './safe-url.pipe';

xdescribe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
