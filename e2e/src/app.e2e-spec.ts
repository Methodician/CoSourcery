import { AppPage } from './app.po';

xdescribe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', async () => {
    page.navigateTo();
    expect(await page.getParagraphText()).toEqual('Welcome to CoSourcery!');
  });
});
