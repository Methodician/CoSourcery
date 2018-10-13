import { TruncateStringPipe } from './truncate-string.pipe';

xdescribe('TruncateStringPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateStringPipe();
    expect(pipe).toBeTruthy();
  });
});
