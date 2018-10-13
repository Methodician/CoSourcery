import { TruncateTagsPipe } from './truncate-tags.pipe';

xdescribe('TruncateTagsPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateTagsPipe();
    expect(pipe).toBeTruthy();
  });
});
