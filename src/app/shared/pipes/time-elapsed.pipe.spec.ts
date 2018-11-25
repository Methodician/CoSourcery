import { TimeElapsedPipe } from './time-elapsed.pipe';

xdescribe('TimeElapsedPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeElapsedPipe();
    expect(pipe).toBeTruthy();
  });
});
