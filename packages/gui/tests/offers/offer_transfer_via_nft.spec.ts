import { ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { CloseDialog } from '../data_object_model/close_dialog';

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['./build/electron/main.js'] });
  page = await electronApp.firstWindow();
});

test.afterAll(async () => {
  await page.close();
});

test('Verify that an NFT can be Transfer to another account', async () => {
  //Pre-requisites
  let ReceiveNftWallet = 'tcac15zuw5285d075w8ge99sz23tdcf9kyq2pzez9x3x82z22l5u8g68qs5gec8';
  let SendNftWallet = 'tcac1z23pn6l698hxygxrrdz0sz3j87dnuylp52d53h96tl4g5p09qtes5r5r2f';

  //Pre-requisites to get user back to Wallet selection page
  await new CloseDialog(page).closeIt();

  // Given I am in a Wallet with NFTs
  await page.getByRole('button', { name: 'ReceiveNftWallet' }).click();
  //await page.pause();

  //When I navigate to the NFTs tab and select an NFT
  await page.getByTestId('DashboardSideBar-nfts').click();
  await page.getByRole('button', { name: 'Bobble #3' }).getByRole('button').click();

  //Then I should be able to transfer the NFT to another account
  await page.getByRole('menuitem', { name: 'Transfer NFT' }).click();
  await page.getByLabel('Send to Address *').type(SendNftWallet);
  await page.getByRole('button', { name: '0 (>5 min) TCAC' }).click();
  await page.getByRole('option', { name: 'Enter a custom fee...' }).click();
  await page.getByLabel('Fee').fill('0.00003');
  await page.getByRole('button', { name: 'Transfer' }).click();
  await page.getByRole('button', { name: 'Transfer' }).click();

  //And I should see a confirmation dialog
  await expect(
    page.getByText('The NFT transfer transaction has been successfully submitted to the blockchain.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('button', { name: 'Update Pending' })).toBeVisible();

  //And I should be able to transfer the NFT to another back to the original account
  await page.locator('[data-testid="LayoutDashboard-log-out"]').click();
  await page.getByRole('button', { name: 'send_wallet' }).click();
  await page.getByTestId('DashboardSideBar-nfts').click();
  await page.waitForSelector('text=Bobble #3', { state: 'visible', timeout: 300000 });
  await page.getByRole('button', { name: 'Bobble #3' }).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Transfer NFT' }).click();
  await page.getByLabel('Send to Address *').type(ReceiveNftWallet);
  await page.getByRole('button', { name: '0 (>5 min) TCAC' }).click();
  await page.getByRole('option', { name: 'Enter a custom fee...' }).click();
  await page.getByLabel('Fee').fill('0.00003');
  await page.getByRole('button', { name: 'Transfer' }).click();
  await page.getByRole('button', { name: 'Transfer' }).click();
  await expect(
    page.getByText('The NFT transfer transaction has been successfully submitted to the blockchain.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('button', { name: 'Update Pending' })).toBeVisible();
});
