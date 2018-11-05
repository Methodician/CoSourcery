import { SafeHtmlPipe } from './safe-html.pipe';

xdescribe('SafeHtmlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipe(null);
    expect(pipe).toBeTruthy();
  });
});
