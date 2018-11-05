import { ReverseArrayPipe } from './reverse-array.pipe';

xdescribe('ReverseArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new ReverseArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
