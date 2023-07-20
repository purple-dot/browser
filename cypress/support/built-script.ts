import * as PurpleDot from '../../src/index';

console.log('PurpleDot', PurpleDot);

declare global {
  interface Window {
    PurpleDot: typeof PurpleDot;
  }
}

window.PurpleDot = PurpleDot;
