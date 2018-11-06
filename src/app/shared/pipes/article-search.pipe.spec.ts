import { ArticleSearchPipe } from './article-search.pipe';

xdescribe('ArticleSearchPipe', () => {
  it('create an instance', () => {
    const pipe = new ArticleSearchPipe();
    expect(pipe).toBeTruthy();
  });
});
