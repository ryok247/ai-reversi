import 'jsdom-global/register';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
});

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;